import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const expectedUser = process.env.AUTH_USERNAME || 'admin';
  const expectedPass = process.env.AUTH_PASSWORD || 'admin';

  if (username === expectedUser && password === expectedPass) {
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set('auth_token', 'ok', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
      sameSite: 'lax',
    });
    return res;
  }

  return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 });
}