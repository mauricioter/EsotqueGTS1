import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Credenciais inválidas ou usuário não aprovado' },
        { status: 401 }
      );
    }

    const senhaValida = user.passwordHash 
      ? await bcrypt.compare(senha, user.passwordHash)
      : false;

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const tokenData = user.id + ':' + Date.now();
    const token = Buffer.from(tokenData).toString('base64');

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nome: user.name,
        email: user.email,
        tipo: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
