import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nomeCompleto, email, cpf, numero, password } = body || {};

    if (!nomeCompleto || typeof nomeCompleto !== 'string' || nomeCompleto.trim().length < 3) {
      return NextResponse.json({ error: 'Nome completo inválido' }, { status: 400 });
    }
    if (!email || !validarEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (!cpf || !validarCPF(cpf)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter ao menos 6 caracteres' }, { status: 400 });
    }

    // Verificar duplicidade
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    const existingByCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingByCpf) {
      return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 409 });
    }

    const totalUsers = await prisma.user.count();
    const passwordHash = await bcrypt.hash(password, 10);

    const role = totalUsers === 0 ? 'ADMIN' : 'VIEWER';
    const status = totalUsers === 0 ? 'APPROVED' : 'PENDING';

    const user = await prisma.user.create({
      data: {
        name: nomeCompleto,
        email,
        cpf,
        numero,
        passwordHash,
        role: role as any,
        status: status as any,
      },
    });

    return NextResponse.json({ id: user.id, role: user.role, status: user.status });
  } catch (e: any) {
    console.error('Erro registro', e);
    return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
  }
}