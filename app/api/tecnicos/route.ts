import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && (status === 'ATIVO' || status === 'INATIVO')) {
      where.status = status as any;
    }

    const tecnicos = await prisma.tecnico.findMany({
      where,
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        telefone: true,
        funcao: true,
        status: true,
        observacoes: true,
      },
    });

    return NextResponse.json(tecnicos, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar técnicos:', error);
    return NextResponse.json({ error: 'Erro ao listar técnicos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

    const body = await request.json();
    const { nome, telefone, funcao, status, observacoes } = body;

    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }
    const statusVal = status && ['ATIVO', 'INATIVO'].includes(status) ? status : 'ATIVO';

    const tecnico = await prisma.tecnico.create({
      data: {
        nome: nome.trim(),
        telefone,
        funcao,
        status: statusVal as any,
        observacoes,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        funcao: true,
        status: true,
        observacoes: true,
      },
    });

    return NextResponse.json(tecnico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar técnico:', error);
    return NextResponse.json({ error: 'Erro ao criar técnico' }, { status: 500 });
  }
}