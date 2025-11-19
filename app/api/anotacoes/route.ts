import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar anotações do usuário
    const anotacoes = await prisma.anotacao.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(anotacoes);
  } catch (error) {
    console.error('Erro ao buscar anotações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar anotações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { texto } = await request.json();

    if (!texto || !texto.trim()) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    // Criar anotação
    const anotacao = await prisma.anotacao.create({
      data: {
        texto: texto.trim(),
        userId: user.id,
      },
    });

    return NextResponse.json(anotacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar anotação' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se a anotação pertence ao usuário
    const anotacao = await prisma.anotacao.findUnique({
      where: { id },
    });

    if (!anotacao) {
      return NextResponse.json({ error: 'Anotação não encontrada' }, { status: 404 });
    }

    if (anotacao.userId !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Deletar anotação
    await prisma.anotacao.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Anotação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir anotação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir anotação' },
      { status: 500 }
    );
  }
}
