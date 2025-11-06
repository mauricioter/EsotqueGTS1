import { NextResponse } from 'next/server';
import { listUsuariosSheets, appendUsuarioSheets } from '@/app/services/sheetsUsers';
import { listUsuariosLocal, appendUsuarioLocal, validarCPF } from '@/app/services/localUsers';

export async function GET() {
  try {
    const usuarios = await listUsuariosSheets();
    return NextResponse.json(usuarios);
  } catch (e) {
    const usuarios = await listUsuariosLocal();
    return NextResponse.json(usuarios, { headers: { 'x-data-source': 'local' } });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nomeCompleto, numero, email, cpf } = body || {};

  if (!nomeCompleto || !email || !cpf) {
    return NextResponse.json({ error: 'Campos obrigatórios: nomeCompleto, email, cpf' }, { status: 400 });
  }
  if (typeof nomeCompleto !== 'string' || nomeCompleto.trim().length < 3) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }
  if (!validarCPF(String(cpf))) {
    return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
  }

  // Tenta Google Sheets primeiro; se falhar, usa local
  try {
    const existentes = await listUsuariosSheets();
    const dup = existentes.find(u => u.email === email || u.cpf.replace(/\D/g, '') === String(cpf).replace(/\D/g, ''));
    if (dup) return NextResponse.json({ error: 'Usuário já existe (email ou CPF)' }, { status: 409 });
    const created = await appendUsuarioSheets({ nomeCompleto, numero: String(numero || ''), email, cpf });
    return NextResponse.json(created);
  } catch (e) {
    const existentesLocal = await listUsuariosLocal();
    const dupLocal = existentesLocal.find(u => u.email === email || u.cpf.replace(/\D/g, '') === String(cpf).replace(/\D/g, ''));
    if (dupLocal) return NextResponse.json({ error: 'Usuário já existe (email ou CPF) no local' }, { status: 409 });
    const created = await appendUsuarioLocal({ nomeCompleto, numero: String(numero || ''), email, cpf });
    return NextResponse.json(created, { headers: { 'x-data-source': 'local' } });
  }
}