import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const body = await req.json();
    const { equipamentoId, fotoSerial, fotoInstalado, assinaturaCliente, endereco } = body;

    if (!equipamentoId || !fotoSerial || !fotoInstalado || !assinaturaCliente || !endereco) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se equipamento existe e está em posse do técnico
    const equipamento = await prisma.equipamento.findUnique({
      where: { id: equipamentoId }
    });

    if (!equipamento) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }

    if (equipamento.status !== 'EM_POSSE_DO_TECNICO') {
      return NextResponse.json(
        { error: 'Equipamento não está em posse do técnico' },
        { status: 400 }
      );
    }

    if (equipamento.tecnicoResponsavel !== userId) {
      return NextResponse.json(
        { error: 'Você não é o responsável por este equipamento' },
        { status: 403 }
      );
    }

    // Criar registro de instalação
    const instalacao = await prisma.instalacao.create({
      data: {
        equipamentoId,
        tecnicoId: userId,
        dataInstalacao: new Date(),
        endereco,
        fotoSerial,
        fotoEquipamento: fotoInstalado,
        assinaturaCliente,
      }
    });

    // Atualizar equipamento para INSTALADO
    const equipamentoAtualizado = await prisma.equipamento.update({
      where: { id: equipamentoId },
      data: {
        status: 'INSTALADO',
        localizacaoAtual: endereco,
      }
    });

    return NextResponse.json({
      success: true,
      instalacao,
      equipamento: equipamentoAtualizado,
      message: 'Instalação concluída com sucesso!'
    });

  } catch (error: any) {
    console.error('Erro ao finalizar instalação:', error);
    return NextResponse.json(
      { error: 'Erro ao finalizar instalação: ' + error.message },
      { status: 500 }
    );
  }
}
