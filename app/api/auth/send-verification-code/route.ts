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

    const { email } = await request.json();

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Código expira em 15 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Salvar código no banco
    await prisma.user.update({
      where: { email },
      data: {
        // @ts-ignore
        verificationCode: code,
        // @ts-ignore
        codeExpiresAt: expiresAt
      }
    });

    // Aqui você implementaria o envio real do email
    // Por enquanto, vou apenas logar o código no console (para testes)
    console.log(`🔐 Código de verificação para ${email}: ${code}`);
    console.log(`📧 Em produção, este código seria enviado por email`);

    // TODO: Implementar envio de email real usando Resend, SendGrid, ou similar
    // Exemplo com Resend:
    // await resend.emails.send({
    //   from: 'noreply@seudominio.com',
    //   to: email,
    //   subject: 'Código de Verificação - Alteração de Senha',
    //   html: `
    //     <h2>Código de Verificação</h2>
    //     <p>Seu código de verificação é: <strong>${code}</strong></p>
    //     <p>Este código expira em 15 minutos.</p>
    //   `
    // });

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado por email',
      // Para teste, incluir o código na resposta (remover em produção!)
      debugCode: code
    });

  } catch (error) {
    console.error('Erro ao enviar código:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar código de verificação' },
      { status: 500 }
    );
  }
}
