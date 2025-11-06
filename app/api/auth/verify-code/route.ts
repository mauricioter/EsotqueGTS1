import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { email, code } = await request.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o código existe e não expirou
    // @ts-expect-error - Prisma Client cache
    if (!user.verificationCode || !user.codeExpiresAt) {
      return NextResponse.json(
        { error: 'Nenhum código de verificação pendente' },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma Client cache
    if (new Date() > user.codeExpiresAt) {
      return NextResponse.json(
        { error: 'Código de verificação expirado' },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma Client cache
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Código de verificação inválido' },
        { status: 400 }
      );
    }

    // Código válido!
    return NextResponse.json({
      success: true,
      message: 'Código verificado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}
