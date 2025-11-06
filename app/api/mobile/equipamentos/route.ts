import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/mobile/equipamentos - Buscar equipamentos do técnico logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Buscar equipamentos onde o técnico logado é responsável
    const whereClause: any = {
      tecnicoResponsavel: session.user.name
    };

    if (status) {
      whereClause.status = status;
    }

    const equipamentos = await prisma.equipamento.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        instalacoes: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Última instalação
        }
      } as any
    });

    return NextResponse.json({
      success: true,
      equipamentos,
      total: equipamentos.length
    });

  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar equipamentos' },
      { status: 500 }
    );
  }
}
