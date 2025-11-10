import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      return NextResponse.json({
        message: 'Se o email existir em nossa base, você receberá instruções para recuperar sua senha.',
      });
    }

    // Gera token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salva o token no banco (você precisa adicionar esses campos no schema do Prisma)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Configuração do email (você precisa configurar as variáveis de ambiente)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Link de recuperação
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${resetToken}`;

    // Template do email
    const mailOptions = {
      from: `"GTSNet Estoque" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperação de Senha - GTSNet Estoque',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #F97316;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #F97316;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GTSNet Estoque</h1>
            </div>
            <div class="content">
              <h2>Recuperação de Senha</h2>
              <p>Olá, ${user.name}!</p>
              <p>Você solicitou a recuperação de senha para sua conta no GTSNet Estoque.</p>
              <p>Clique no botão abaixo para redefinir sua senha:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </p>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>
              <p><strong>Este link é válido por 1 hora.</strong></p>
              <p>Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá inalterada.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GTSNet. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Envia o email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Se o email existir em nossa base, você receberá instruções para recuperar sua senha.',
    });
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
