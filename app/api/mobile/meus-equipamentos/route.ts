import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = (session as any).userId;

    // Buscar equipamentos em posse do técnico logado
    const equipamentos = await prisma.equipamento.findMany({
      where: {
        status: 'EM_POSSE_DO_TECNICO',
        tecnicoResponsavel: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(equipamentos);

  } catch (error: any) {
    console.error('Erro ao buscar equipamentos do técnico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar equipamentos: ' + error.message },
      { status: 500 }
    );
  }
}
