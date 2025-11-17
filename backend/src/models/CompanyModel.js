const prisma = require('../config/prisma');

const CompanyModel = {
  findByCnpj: async (cnpj) => {
    return prisma.company.findUnique({
      where: { cnpj },
    });
  },

  findAll: async (skip = 0, limit = 10) => {
    return prisma.company.findMany({
      skip,
      take: limit,
      orderBy: {
        atualizadoEm: 'desc',
      },
    });
  },

  count: async () => {
    return prisma.company.count();
  },

  createOrUpdateFromApi: async (data) => {
    // data = { cnpj, razaoSocial, nomeFantasia, situacao, cnaePrincipal, cidade, uf }
    return prisma.company.upsert({
      where: { cnpj: data.cnpj },
      update: {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        situacao: data.situacao,
        cnaePrincipal: data.cnaePrincipal,
        cidade: data.cidade,
        uf: data.uf,
        atualizadoEm: new Date(),
      },
      create: {
        cnpj: data.cnpj,
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        situacao: data.situacao,
        cnaePrincipal: data.cnaePrincipal,
        cidade: data.cidade,
        uf: data.uf,
      },
    });
  },

  update: async (id, data) => {
    try {
      return await prisma.company.update({
        where: { id },
        data: {
          ...data,
          atualizadoEm: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Registro não encontrado
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const deleted = await prisma.company.delete({
        where: { id },
      });
      return deleted;
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Registro não encontrado
      }
      throw error;
    }
  },
};

module.exports = CompanyModel;
