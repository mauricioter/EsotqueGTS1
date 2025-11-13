import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ferramentas/movimentar
 * Registra movimentacao de ferramenta (emprestimo/devolucao)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ferramentaId,
      tecnicoId,
      tecnicoNome,
      tipoMovimentacao,
      quantidade,
      dataPrevistaDevolucao,
      motivo,
      observacoes,
    } = body;

    if (!ferramentaId || !tecnicoNome || !tipoMovimentacao) {
      return NextResponse.json(
        { erro: 'Dados obrigatorios faltando' },
        { status: 400 }
      );
    }

    // Busca a ferramenta
    const ferramenta = await prisma.ferramenta.findUnique({
      where: { id: ferramentaId },
    });

    if (!ferramenta) {
      return NextResponse.json(
        { erro: 'Ferramenta nao encontrada' },
        { status: 404 }
      );
    }

    const qtd = quantidade || 1;

    // Valida quantidade disponivel para emprestimo
    if (tipoMovimentacao === 'EMPRESTIMO') {
      const disponiveis = ferramenta.quantidadeTotal - ferramenta.quantidadeEmUso;
      if (qtd > disponiveis) {
        return NextResponse.json(
          { erro: `Apenas ${disponiveis} unidade(s) disponivel(is)` },
          { status: 400 }
        );
      }
    }

    // Cria a movimentacao
    const movimentacao = await prisma.movimentacaoFerramenta.create({
      data: {
        ferramentaId,
        tecnicoId,
        tecnicoNome,
        tipoMovimentacao,
        quantidade: qtd,
        dataPrevistaDevolucao: dataPrevistaDevolucao ? new Date(dataPrevistaDevolucao) : null,
        dataDevolucaoReal: tipoMovimentacao === 'DEVOLUCAO' ? new Date() : null,
        motivo,
        observacoes,
      },
    });

    // Atualiza o status da ferramenta
    let novoStatus = ferramenta.status;
    let novaQuantidadeEmUso = ferramenta.quantidadeEmUso;

    if (tipoMovimentacao === 'EMPRESTIMO') {
      novaQuantidadeEmUso += qtd;
      novoStatus = novaQuantidadeEmUso >= ferramenta.quantidadeTotal ? 'EM_USO' : 'DISPONIVEL';
    } else if (tipoMovimentacao === 'DEVOLUCAO') {
      novaQuantidadeEmUso = Math.max(0, novaQuantidadeEmUso - qtd);
      novoStatus = novaQuantidadeEmUso > 0 ? 'EM_USO' : 'DISPONIVEL';
    } else if (tipoMovimentacao === 'MANUTENCAO') {
      novoStatus = 'EM_MANUTENCAO';
    } else if (tipoMovimentacao === 'PERDA') {
      novoStatus = 'PERDIDA';
    }

    await prisma.ferramenta.update({
      where: { id: ferramentaId },
      data: {
        quantidadeEmUso: novaQuantidadeEmUso,
        status: novoStatus,
      },
    });

    return NextResponse.json({
      mensagem: 'Movimentacao registrada com sucesso',
      movimentacao,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar movimentacao:', error);
    return NextResponse.json(
      { erro: 'Erro ao registrar movimentacao' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ferramentas/movimentar
 * Lista historico de movimentacoes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ferramentaId = searchParams.get('ferramentaId');

    const where: any = {};
    if (ferramentaId) where.ferramentaId = ferramentaId;

    const movimentacoes = await prisma.movimentacaoFerramenta.findMany({
      where,
      include: {
        ferramenta: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ movimentacoes });
  } catch (error: any) {
    console.error('Erro ao buscar movimentacoes:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar movimentacoes' },
      { status: 500 }
    );
  }
}
