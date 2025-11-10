import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/instalacoes - Listar instalações
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tecnicoId = searchParams.get('tecnicoId');

    const instalacoes = await prisma.instalacao.findMany({
      where: tecnicoId ? { tecnicoId } : {},
      include: {
        equipamento: true,
        tecnico: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(instalacoes);
  } catch (error) {
    console.error('Erro ao buscar instalações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar instalações' },
      { status: 500 }
    );
  }
}

// POST /api/instalacoes - Criar nova instalação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipamentoId, tecnicoId, endereco, latitude, longitude, fotoEquipamento, fotoSerial, fotoLocal, fotosAdicionais, nomeCliente, observacoes } = body;

    if (!equipamentoId || !tecnicoId) {
      return NextResponse.json(
        { error: 'equipamentoId e tecnicoId são obrigatórios' },
        { status: 400 }
      );
    }

    const instalacao = await prisma.instalacao.create({
      data: {
        equipamentoId,
        tecnicoId,
        endereco,
        latitude,
        longitude,
        fotoEquipamento,
        fotoSerial,
        fotoLocal,
        fotosAdicionais: fotosAdicionais || [],
        nomeCliente,
        observacoes,
      },
      include: {
        equipamento: true,
        tecnico: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(instalacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar instalação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar instalação' },
      { status: 500 }
    );
  }
}