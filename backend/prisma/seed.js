const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Cria usuários de teste
  const password1 = await bcrypt.hash('senha123', 10);
  const password2 = await bcrypt.hash('teste456', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'teste@example.com' },
    update: {},
    create: {
      email: 'teste@example.com',
      passwordHash: password1,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: password2,
    },
  });

  console.log('Usuários criados:');
  console.log('- Email: teste@example.com | Senha: senha123');
  console.log('- Email: admin@example.com | Senha: teste456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
