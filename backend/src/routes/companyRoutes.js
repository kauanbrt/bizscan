const express = require('express');
const { param, body, validationResult } = require('express-validator');
const CompanyModel = require('../models/CompanyModel');
const authMiddleware = require('./authMiddleware');
const { logEvent } = require('../config/logger');
const cache = require('../config/cache');

// Configuração para ignorar erros SSL em desenvolvimento
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const router = express.Router();

// Normalizar CNPJ: só dígitos
function normalizeCnpj(cnpj) {
  return (cnpj || '').replace(/\D/g, '');
}

// Formatar CNPJ: 00.000.000/0000-00
function formatCnpj(cnpj) {
  const cleaned = normalizeCnpj(cnpj);
  if (cleaned.length !== 14) return cleaned;
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Converte dados do banco (camelCase) para formato da API pública (snake_case)
function convertToApiFormat(company) {
  if (!company) return null;
  return {
    cnpj: company.cnpj,
    razao_social: company.razaoSocial,
    nome_fantasia: company.nomeFantasia,
    situacao_cadastral: company.situacao,
    cnae_fiscal: company.cnaePrincipal,
    municipio: company.cidade,
    uf: company.uf,
  };
}

// Validar CNPJ (algoritmo completo)
function isValidCnpj(cnpj) {
  const cleaned = normalizeCnpj(cnpj);
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  const calcDigit = (base) => {
    const weights = base.length === 12
      ? [5,4,3,2,9,8,7,6,5,4,3,2]
      : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const sum = base.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcDigit(cleaned.substring(0, 12));
  if (parseInt(cleaned[12]) !== d1) return false;
  const d2 = calcDigit(cleaned.substring(0, 13));
  return parseInt(cleaned[13]) === d2;
}

// GET /api/companies - Listar empresas com paginação (DEVE VIR ANTES de /companies/:cnpj)
router.get('/companies',
  authMiddleware,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [companies, total] = await Promise.all([
        CompanyModel.findAll(skip, limit),
        CompanyModel.count(),
      ]);

      logEvent('list_success', 'Listagem de empresas realizada', {
        page,
        limit,
        total,
        userId: req.user?.id,
        ip: req.ip
      });

      res.json({
        data: companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      logEvent('list_error', 'Erro ao listar empresas', {
        error: err.message,
        userId: req.user?.id,
        ip: req.ip
      });
      console.error('Erro ao listar empresas:', err);
      return res.status(500).json({ message: 'Erro ao listar empresas.' });
    }
  }
);

// GET /api/companies/:cnpj
router.get('/companies/:cnpj',
  authMiddleware,
  async (req, res) => {
    try {
      const rawCnpj = req.params.cnpj;
      const cnpj = normalizeCnpj(rawCnpj);

      // Validação do CNPJ
      if (!cnpj || cnpj.length !== 14 || !isValidCnpj(cnpj)) {
        logEvent('search_error', 'Busca com CNPJ inválido', {
          cnpj: rawCnpj,
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({ message: 'CNPJ inválido.' });
      }

      // 1) Tenta buscar no cache em memória
      const cacheKey = `cnpj:${cnpj}`;
      let cachedData = cache.get(cacheKey);
      if (cachedData) {
        logEvent('search_success', 'Busca realizada (cache memória)', {
          cnpj,
          userId: req.user?.id,
          ip: req.ip
        });
        return res.json(cachedData);
      }

      // 2) Tenta buscar no MySQL (cache persistente)
      const company = await CompanyModel.findByCnpj(cnpj);
      if (company) {
        // Converte para formato da API pública
        const convertedData = convertToApiFormat(company);
        cache.set(cacheKey, convertedData, 300); // Cache de 5 minutos
        logEvent('search_success', 'Busca realizada (cache banco)', {
          cnpj,
          userId: req.user?.id,
          ip: req.ip
        });
        return res.json(convertedData);
      }

      // 3) Se não tiver, consulta API externa (OpenCNPJ)
      const apiUrl = `https://api.opencnpj.org/${cnpj}`;
      console.log('Consultando API externa:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Erro da API:', errorText);
        logEvent('search_error', 'Empresa não encontrada na API externa', {
          cnpj,
          status: response.status,
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(404).json({ message: 'Empresa não encontrada.' });
      }

      const data = await response.json();
      console.log('Dados recebidos da API:', data);

      // Salva campos básicos no banco para histórico/listagem
      const basicData = {
        cnpj,
        razaoSocial: data.razao_social || data.nome || '',
        nomeFantasia: data.nome_fantasia || null,
        situacao: data.situacao_cadastral || data.situacao || null,
        cnaePrincipal: data.cnae_fiscal || null,
        cidade: data.municipio || null,
        uf: data.uf || null,
      };

      // Salva no banco apenas dados básicos
      await CompanyModel.createOrUpdateFromApi(basicData);

      // Retorna dados completos da API (não apenas os salvos no banco)
      cache.set(cacheKey, data, 300); // Cache de 5 minutos

      logEvent('search_success', 'Busca realizada (API externa)', {
        cnpj,
        userId: req.user?.id,
        ip: req.ip
      });

      return res.json(data); // Retorna dados completos da API
    } catch (err) {
      logEvent('search_error', 'Erro ao buscar empresa', {
        cnpj: req.params.cnpj,
        userId: req.user?.id,
        error: err.message,
        ip: req.ip
      });
      console.error('Erro ao buscar empresa:', err);
      return res.status(500).json({ message: 'Erro ao buscar empresa.' });
    }
  }
);

// POST /api/companies - Inserir empresa manualmente
router.post('/companies',
  authMiddleware,
  [
    body('cnpj').custom((value) => {
      const cleaned = normalizeCnpj(value);
      if (!isValidCnpj(cleaned)) {
        throw new Error('CNPJ inválido');
      }
      return true;
    }),
    body('razaoSocial').trim().notEmpty().withMessage('Razão social é obrigatória'),
    body('nomeFantasia').optional().trim(),
    body('situacao').optional().trim(),
    body('cnaePrincipal').optional().trim(),
    body('cidade').optional().trim(),
    body('uf').optional().trim().isLength({ max: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logEvent('insert_error', 'Tentativa de inserção com dados inválidos', {
          errors: errors.array(),
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          message: 'Dados inválidos.',
          errors: errors.array()
        });
      }

      const { cnpj, razaoSocial, nomeFantasia, situacao, cnaePrincipal, cidade, uf } = req.body;
      const cleanedCnpj = normalizeCnpj(cnpj);

      const data = {
        cnpj: cleanedCnpj,
        razaoSocial,
        nomeFantasia: nomeFantasia || null,
        situacao: situacao || null,
        cnaePrincipal: cnaePrincipal || null,
        cidade: cidade || null,
        uf: uf || null,
      };

      const company = await CompanyModel.createOrUpdateFromApi(data);

      // Converte e atualiza o cache
      const cacheKey = `cnpj:${cleanedCnpj}`;
      const convertedData = convertToApiFormat(company);
      cache.set(cacheKey, convertedData, 300);

      logEvent('insert_success', 'Empresa inserida com sucesso', {
        cnpj: cleanedCnpj,
        userId: req.user?.id,
        ip: req.ip
      });

      return res.status(201).json(convertedData);
    } catch (err) {
      logEvent('insert_error', 'Erro ao inserir empresa', {
        userId: req.user?.id,
        error: err.message,
        ip: req.ip
      });
      console.error('Erro ao inserir empresa:', err);
      return res.status(500).json({ message: 'Erro ao inserir empresa.' });
    }
  }
);

// PUT /api/companies/:id - Atualizar empresa
router.put('/companies/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage('ID inválido'),
    body('cnpj').optional().custom((value) => {
      const cleaned = normalizeCnpj(value);
      if (!isValidCnpj(cleaned)) {
        throw new Error('CNPJ inválido');
      }
      return true;
    }),
    body('razaoSocial').optional().trim().notEmpty().withMessage('Razão social não pode ser vazia'),
    body('nomeFantasia').optional().trim(),
    body('situacao').optional().trim(),
    body('cnaePrincipal').optional().trim(),
    body('cidade').optional().trim(),
    body('uf').optional().trim().isLength({ max: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logEvent('update_error', 'Tentativa de atualização com dados inválidos', {
          errors: errors.array(),
          userId: req.user?.id,
          ip: req.ip
        });
        return res.status(400).json({
          message: 'Dados inválidos.',
          errors: errors.array()
        });
      }

      const id = parseInt(req.params.id);
      const updateData = {};

      if (req.body.cnpj) updateData.cnpj = normalizeCnpj(req.body.cnpj);
      if (req.body.razaoSocial) updateData.razaoSocial = req.body.razaoSocial;
      if (req.body.nomeFantasia !== undefined) updateData.nomeFantasia = req.body.nomeFantasia || null;
      if (req.body.situacao !== undefined) updateData.situacao = req.body.situacao || null;
      if (req.body.cnaePrincipal !== undefined) updateData.cnaePrincipal = req.body.cnaePrincipal || null;
      if (req.body.cidade !== undefined) updateData.cidade = req.body.cidade || null;
      if (req.body.uf !== undefined) updateData.uf = req.body.uf || null;

      const company = await CompanyModel.update(id, updateData);

      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada.' });
      }

      // Converte e atualiza cache se houver CNPJ
      if (company.cnpj) {
        const cacheKey = `cnpj:${company.cnpj}`;
        const convertedData = convertToApiFormat(company);
        cache.set(cacheKey, convertedData, 300);
      }

      logEvent('update_success', 'Empresa atualizada com sucesso', {
        id,
        userId: req.user?.id,
        ip: req.ip
      });

      const convertedData = convertToApiFormat(company);
      return res.json(convertedData);
    } catch (err) {
      logEvent('update_error', 'Erro ao atualizar empresa', {
        id: req.params.id,
        userId: req.user?.id,
        error: err.message,
        ip: req.ip
      });
      console.error('Erro ao atualizar empresa:', err);
      return res.status(500).json({ message: 'Erro ao atualizar empresa.' });
    }
  }
);

// DELETE /api/companies/:id - Deletar empresa
router.delete('/companies/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage('ID inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'ID inválido.',
          errors: errors.array()
        });
      }

      const id = parseInt(req.params.id);
      const deleted = await CompanyModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Empresa não encontrada.' });
      }

      // Invalida o cache usando o CNPJ da empresa deletada
      if (deleted.cnpj) {
        const cacheKey = `cnpj:${deleted.cnpj}`;
        cache.del(cacheKey);
      }

      logEvent('delete_success', 'Empresa deletada com sucesso', {
        id,
        cnpj: deleted.cnpj,
        userId: req.user?.id,
        ip: req.ip
      });

      return res.json({ message: 'Empresa deletada com sucesso.' });
    } catch (err) {
      logEvent('delete_error', 'Erro ao deletar empresa', {
        id: req.params.id,
        userId: req.user?.id,
        error: err.message,
        ip: req.ip
      });
      console.error('Erro ao deletar empresa:', err);
      return res.status(500).json({ message: 'Erro ao deletar empresa.' });
    }
  }
);

module.exports = router;
