-- CreateEnum
CREATE TYPE "CategoriaFerramenta" AS ENUM ('ELETRICA', 'FIBRA', 'MEDICAO', 'SEGURANCA', 'REDE', 'FERRAMENTAS_MANUAIS', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusFerramenta" AS ENUM ('DISPONIVEL', 'EM_USO', 'EM_MANUTENCAO', 'PERDIDA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('EMPRESTIMO', 'DEVOLUCAO', 'MANUTENCAO', 'PERDA', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "Ferramenta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaFerramenta" NOT NULL,
    "quantidadeTotal" INTEGER NOT NULL DEFAULT 1,
    "quantidadeEmUso" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusFerramenta" NOT NULL DEFAULT 'DISPONIVEL',
    "localizacaoAtual" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ferramenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoFerramenta" (
    "id" TEXT NOT NULL,
    "ferramentaId" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "tecnicoNome" TEXT NOT NULL,
    "tipoMovimentacao" "TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "dataRetirada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevistaDevolucao" TIMESTAMP(3),
    "dataDevolucaoReal" TIMESTAMP(3),
    "motivo" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoFerramenta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovimentacaoFerramenta" ADD CONSTRAINT "MovimentacaoFerramenta_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "Ferramenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
