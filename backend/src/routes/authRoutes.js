const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');
const { logEvent } = require('../config/logger');

const router = express.Router();

// Lista de tokens invalidados (blacklist simples em memória)
const tokenBlacklist = new Set();

// POST /api/login
router.post('/login',
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logEvent('auth_error', 'Tentativa de login com dados inválidos', {
          errors: errors.array(),
          ip: req.ip
        });
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      }

      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);

      if (!user) {
        logEvent('auth_error', 'Tentativa de login com email inexistente', {
          email,
          ip: req.ip
        });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        logEvent('auth_error', 'Tentativa de login com senha incorreta', {
          email,
          ip: req.ip
        });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );

      logEvent('auth_success', 'Login realizado com sucesso', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      res.json({ token });
    } catch (err) {
      logEvent('auth_error', 'Erro interno no login', {
        error: err.message,
        ip: req.ip
      });
      console.error('Erro no login:', err);
      res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
);

// POST /api/logout
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      tokenBlacklist.add(token);

      logEvent('auth_info', 'Logout realizado', {
        ip: req.ip
      });
    }

    res.json({ message: 'Logout realizado com sucesso.' });
  } catch (err) {
    logEvent('auth_error', 'Erro ao fazer logout', {
      error: err.message,
      ip: req.ip
    });
    res.status(500).json({ message: 'Erro ao fazer logout.' });
  }
});

// Exporta também a blacklist para usar no middleware
module.exports = router;
module.exports.tokenBlacklist = tokenBlacklist;
