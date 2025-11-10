const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Verifica se já existe equipamento
  const existente = await prisma.equipamento.findFirst();
  
  if (existente) {
    console.log('Equipamento já existe:', existente);
    return;
  }

  const equipamento = await prisma.equipamento.create({
    data: {
      nome: 'Roteador WiFi AC1200',
      descricao: 'Roteador dual-band para instalação',
      status: 'DISPONIVEL'
    }
  });
  
  console.log('Equipamento criado:', equipamento);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
