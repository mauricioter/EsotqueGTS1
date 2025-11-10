const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function atualizarSenha() {
  const senhaHash = await bcrypt.hash('senha123', 10);
  
  const user = await prisma.user.update({
    where: { email: 'joao@gts.com' },
    data: { passwordHash: senhaHash }
  });
  
  console.log('Senha atualizada para joao@gts.com');
  console.log('Nova senha (hash):', senhaHash);
  console.log('Use: senha123');
  
  await prisma.$disconnect();
}

atualizarSenha();
