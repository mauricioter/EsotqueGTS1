import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/mobile/instalacoes - Registrar nova instalação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      equipamentoId,
      endereco,
      latitude,
      longitude,
      fotoEquipamento,
      fotoSerial,
      fotoLocal,
      fotosAdicionais,
      assinaturaCliente,
      nomeCliente,
      observacoes
    } = body;

    if (!equipamentoId) {
      return NextResponse.json(
        { error: 'ID do equipamento é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário para pegar o ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar instalação
    const instalacao = await prisma.instalacao.create({
      data: {
        equipamentoId,
        tecnicoId: user.id,
        endereco,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        fotoEquipamento,
        fotoSerial,
        fotoLocal,
        fotosAdicionais: fotosAdicionais || [],
        assinaturaCliente,
        nomeCliente,
        observacoes
      },
      include: {
        equipamento: true,
        tecnico: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Atualizar status do equipamento para INSTALADO
    await prisma.equipamento.update({
      where: { id: equipamentoId },
      data: {
        status: 'INSTALADO',
        localizacaoAtual: endereco || `${latitude}, ${longitude}`
      }
    });

    return NextResponse.json({
      success: true,
      instalacao,
      message: 'Instalação registrada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao registrar instalação:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar instalação' },
      { status: 500 }
    );
  }
}

// GET /api/mobile/instalacoes - Listar instalações do técnico
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const instalacoes = await prisma.instalacao.findMany({
      where: { tecnicoId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        equipamento: {
          select: {
            id: true,
            nome: true,
            serial: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      instalacoes,
      total: instalacoes.length
    });

  } catch (error) {
    console.error('Erro ao buscar instalações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar instalações' },
      { status: 500 }
    );
  }
}
