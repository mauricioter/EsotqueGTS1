const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listarUsuarios() {
  const users = await prisma.user.findMany({
    select: { name: true, email: true, passwordHash: true, status: true }
  });
  
  console.log('=== USUÁRIOS DO MY-APP ===\n');
  users.forEach(u => {
    console.log('Nome:', u.name);
    console.log('Email:', u.email);
    console.log('Senha:', u.passwordHash || '(sem senha)');
    console.log('Status:', u.status);
    console.log('---\n');
  });
  
  await prisma.$disconnect();
}

listarUsuarios();
