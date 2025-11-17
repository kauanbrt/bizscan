const { PrismaClient } = require('@prisma/client');

// Pool de conexões é gerenciado automaticamente pelo Prisma
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

module.exports = prisma;
