import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      include: {
        movimentacoes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { nome: 'asc' },
    });

    logger.info({ total: ferramentas.length }, 'Ferramentas encontradas');
    return NextResponse.json({ ferramentas });
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
