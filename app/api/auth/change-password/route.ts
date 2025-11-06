import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, verificationCode } = await request.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar código de verificação
    // @ts-expect-error - Prisma Client needs reload
    if (!user.verificationCode || !user.codeExpiresAt) {
      return NextResponse.json(
        { error: 'Código de verificação não encontrado' },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma Client needs reload
    if (new Date() > user.codeExpiresAt) {
      return NextResponse.json(
        { error: 'Código de verificação expirado' },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma Client needs reload
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Código de verificação inválido' },
        { status: 400 }
      );
    }

    // Verificar senha atual
    if (user.passwordHash) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        );
      }
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar código de verificação
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        passwordHash: hashedPassword,
        // @ts-expect-error - Prisma Client needs reload
        verificationCode: null,
        // @ts-expect-error - Prisma Client needs reload
        codeExpiresAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
