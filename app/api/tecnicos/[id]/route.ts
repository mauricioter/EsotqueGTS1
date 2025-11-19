import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await params;
    const tecnico = await prisma.tecnico.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        telefone: true,
        funcao: true,
        status: true,
        observacoes: true,
        createdAt: true,
      },
    });
    if (!tecnico) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 });

    const user = await prisma.user.findFirst({ where: { name: tecnico.nome }, select: { id: true, email: true, role: true, status: true, createdAt: true } });

    return NextResponse.json({ tecnico, user }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar técnico:', error);
    return NextResponse.json({ error: 'Erro ao buscar técnico' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { nome, telefone, funcao, status, observacoes } = body;

    const data: any = {};
    if (nome) data.nome = String(nome).trim();
    if (telefone !== undefined) data.telefone = telefone || null;
    if (funcao !== undefined) data.funcao = funcao || null;
    if (observacoes !== undefined) data.observacoes = observacoes || null;
    if (status && (status === 'ATIVO' || status === 'INATIVO')) data.status = status;

    const tecnico = await prisma.tecnico.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        telefone: true,
        funcao: true,
        status: true,
        observacoes: true,
      },
    });

    return NextResponse.json(tecnico, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar técnico:', error);
    return NextResponse.json({ error: 'Erro ao atualizar técnico' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

    const { id } = await params;
    await prisma.tecnico.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir técnico:', error);
    return NextResponse.json({ error: 'Erro ao excluir técnico' }, { status: 500 });
  }
}