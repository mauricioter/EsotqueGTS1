import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// TODO: Reabilitar quando modelo Instalacao estiver no schema Prisma

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

    // Temporariamente desabilitado - aguardando modelo Instalacao no schema
    return NextResponse.json(
      { error: 'Funcionalidade temporariamente desabilitada. Modelo Instalacao será adicionado em breve.' },
      { status: 503 }
    );

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
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

    // Temporariamente retornando array vazio
    return NextResponse.json({
      success: true,
      instalacoes: [],
      total: 0,
      message: 'Funcionalidade será habilitada em breve'
    });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
