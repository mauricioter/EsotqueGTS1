import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Buscar todos os usuários
    const usuarios = await prisma.user.findMany({
      orderBy: [
        { status: 'asc' }, // PENDING primeiro
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        numero: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }
}
