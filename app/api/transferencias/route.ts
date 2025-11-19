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

    const role = (session as any).role;
    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const { equipamentoId, tecnicoId, assinaturaTecnico } = body;

    if (!equipamentoId || !tecnicoId || !assinaturaTecnico) {
      return NextResponse.json(
        { error: 'Dados incompletos: equipamento, técnico e assinatura são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se equipamento existe e está disponível
    const equipamento = await prisma.equipamento.findUnique({
      where: { id: equipamentoId }
    });

    if (!equipamento) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }

    if (equipamento.status !== 'DISPONIVEL') {
      return NextResponse.json(
        { error: 'Equipamento não está disponível para transferência' },
        { status: 400 }
      );
    }

    // Verificar se técnico existe
    const tecnico = await prisma.user.findUnique({
      where: { id: tecnicoId }
    });

    if (!tecnico) {
      return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 });
    }

    // Atualizar equipamento
    const equipamentoAtualizado = await prisma.equipamento.update({
      where: { id: equipamentoId },
      data: {
        status: 'EM_POSSE_DO_TECNICO',
        tecnicoResponsavel: tecnicoId,
        assinaturaTecnico: assinaturaTecnico,
      }
    });

    return NextResponse.json({
      success: true,
      equipamento: equipamentoAtualizado,
      message: `Equipamento transferido para ${tecnico.name}`
    });

  } catch (error: any) {
    console.error('Erro ao transferir equipamento:', error);
    return NextResponse.json(
      { error: 'Erro ao transferir equipamento: ' + error.message },
      { status: 500 }
    );
  }
}
