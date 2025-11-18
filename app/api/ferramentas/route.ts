import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

/**
 * GET /api/ferramentas
 * Lista todas as ferramentas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoria = searchParams.get('categoria');

    const where: any = {};
    if (status) where.status = status;
    if (categoria) where.categoria = categoria;

    logger.info({ status, categoria }, 'Listando ferramentas');
    const ferramentas = await prisma.ferramenta.findMany({
      where,
      orderBy: { nome: 'asc' },
    });

    // Calcula os valores com base nas movimentações
    const ferramentasAtualizadas = await Promise.all(
      ferramentas.map(async (ferramenta) => {
        const movimentacoes = await prisma.movimentacaoFerramenta.findMany({
          where: { ferramentaId: ferramenta.id }
        });

        let emUso = 0;

        for (const mov of movimentacoes) {
          if (mov.tipoMovimentacao === 'EMPRESTIMO') emUso += mov.quantidade;
          if (mov.tipoMovimentacao === 'DEVOLUCAO') emUso -= mov.quantidade;
          if (mov.tipoMovimentacao === 'TRANSFERENCIA') emUso -= mov.quantidade;
        }

        const quantidadeEmUso = Math.max(0, emUso);
        const quantidadeTotal = ferramenta.quantidadeTotal;
        let status = ferramenta.status as any;
        if (status !== 'PERDIDA' && status !== 'EM_MANUTENCAO') {
          status = quantidadeEmUso > 0 ? 'EM_USO' : 'DISPONIVEL';
        }

        return {
          ...ferramenta,
          quantidadeEmUso,
          quantidadeTotal,
          status,
        };
      })
    );

    logger.info({ total: ferramentasAtualizadas.length }, 'Ferramentas encontradas');
    return NextResponse.json({ ferramentas: ferramentasAtualizadas });
  } catch (error: any) {
    logger.error({ err: error }, 'Erro ao buscar ferramentas');
    return NextResponse.json(
      { erro: 'Erro ao buscar ferramentas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ferramentas
 * Cria uma nova ferramenta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, categoria, quantidadeTotal, localizacaoAtual, observacoes } = body;

    const categoriasValidas = [
      'ELETRICA', 'FIBRA', 'MEDICAO', 'SEGURANCA', 'REDE', 'FERRAMENTAS_MANUAIS', 'OUTROS'
    ];
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      logger.warn({ body }, 'Nome inválido ao criar ferramenta');
      return NextResponse.json(
        { erro: 'Nome é obrigatório e deve ter pelo menos 3 caracteres.' },
        { status: 400 }
      );
    }
    if (!categoria || !categoriasValidas.includes(categoria)) {
      logger.warn({ body }, 'Categoria inválida ao criar ferramenta');
      return NextResponse.json(
        { erro: 'Categoria é obrigatória e deve ser válida.' },
        { status: 400 }
      );
    }
    if (quantidadeTotal !== undefined && (isNaN(quantidadeTotal) || quantidadeTotal < 1)) {
      logger.warn({ body }, 'Quantidade total inválida ao criar ferramenta');
      return NextResponse.json(
        { erro: 'Quantidade total deve ser um número positivo.' },
        { status: 400 }
      );
    }

    logger.info({ nome, categoria, quantidadeTotal }, 'Criando nova ferramenta');
    const ferramenta = await prisma.ferramenta.create({
      data: {
        nome,
        categoria,
        quantidadeTotal: quantidadeTotal || 1,
        localizacaoAtual: localizacaoAtual || 'Almoxarifado',
        observacoes,
      },
    });

    logger.info({ id: ferramenta.id }, 'Ferramenta criada com sucesso');
    return NextResponse.json({ ferramenta }, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error }, 'Erro ao criar ferramenta');
    return NextResponse.json(
      { erro: 'Erro ao criar ferramenta' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ferramentas
 * Atualiza uma ferramenta
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...dados } = body;

    if (!id) {
      return NextResponse.json(
        { erro: 'ID da ferramenta e obrigatorio' },
        { status: 400 }
      );
    }

    const ferramenta = await prisma.ferramenta.update({
      where: { id },
      data: dados,
    });

    return NextResponse.json({ ferramenta });
  } catch (error: any) {
    console.error('Erro ao atualizar ferramenta:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar ferramenta' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ferramentas
 * Deleta uma ferramenta
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { erro: 'ID da ferramenta e obrigatorio' },
        { status: 400 }
      );
    }

    await prisma.ferramenta.delete({
      where: { id },
    });

    return NextResponse.json({ mensagem: 'Ferramenta deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar ferramenta:', error);
    return NextResponse.json(
      { erro: 'Erro ao deletar ferramenta' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ferramentas
 * Recalibra contagens e status com base no histórico de movimentações
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (!session || role !== 'ADMIN') {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      );
    }
    const body = await request.json().catch(() => ({}));
    if (!body || (body.action !== 'recalibrar' && body.action !== 'reset')) {
      return NextResponse.json(
        { erro: 'Ação inválida. Use { action: "recalibrar" }.' },
        { status: 400 }
      );
    }
    if (body.action === 'reset') {
      const deleted = await prisma.movimentacaoFerramenta.deleteMany({});
      await prisma.ferramenta.updateMany({
        data: { quantidadeEmUso: 0 },
      });
      await prisma.ferramenta.updateMany({
        where: { status: { in: ['EM_USO', 'DISPONIVEL'] } },
        data: { status: 'DISPONIVEL' },
      });
      return NextResponse.json({ mensagem: 'Reset concluído', movimentacoesRemovidas: deleted.count });
    }

    const ferramentas = await prisma.ferramenta.findMany({ select: { id: true, status: true, quantidadeTotal: true } });

    let atualizadas = 0;
    for (const f of ferramentas) {
      const movimentacoes = await prisma.movimentacaoFerramenta.findMany({
        where: { ferramentaId: f.id },
        select: { tipoMovimentacao: true, quantidade: true },
      });

      let emUso = 0;
      let totalDelta = 0; // Não será aplicado diretamente ao quantidadeTotal
      for (const mov of movimentacoes) {
        if (mov.tipoMovimentacao === 'EMPRESTIMO') emUso += mov.quantidade;
        if (mov.tipoMovimentacao === 'DEVOLUCAO') emUso -= mov.quantidade;
        if (mov.tipoMovimentacao === 'TRANSFERENCIA') emUso -= mov.quantidade;
        if (mov.tipoMovimentacao === 'PERDA') totalDelta -= mov.quantidade;
      }

      const quantidadeEmUso = Math.max(0, emUso);
      const quantidadeTotal = Math.max(0, f.quantidadeTotal || 0);

      let status = f.status as any;
      if (status !== 'PERDIDA' && status !== 'EM_MANUTENCAO') {
        status = quantidadeEmUso > 0 ? 'EM_USO' : 'DISPONIVEL';
      }

      await prisma.ferramenta.update({
        where: { id: f.id },
        data: { quantidadeEmUso, quantidadeTotal, status },
      });
      atualizadas += 1;
    }

    return NextResponse.json({ mensagem: 'Recalibração concluída', atualizadas });
  } catch (error: any) {
    console.error('Erro ao recalibrar ferramentas:', error);
    return NextResponse.json(
      { erro: 'Erro ao recalibrar ferramentas' },
      { status: 500 }
    );
  }
}
