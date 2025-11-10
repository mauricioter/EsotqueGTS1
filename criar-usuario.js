const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'João Técnico',
      email: 'joao@gts.com',
      passwordHash: 'senha123',
      role: 'OPERATOR',
      status: 'APPROVED'
    }
  });
  console.log('Usuário criado:', user);
}

main().finally(() => prisma.$disconnect());
