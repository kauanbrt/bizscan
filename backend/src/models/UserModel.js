const prisma = require('../config/prisma');

const UserModel = {
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create: async ({ email, passwordHash }) => {
    return prisma.user.create({
      data: { email, passwordHash },
    });
  },
};

module.exports = UserModel;
