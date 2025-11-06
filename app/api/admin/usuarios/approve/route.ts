import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { userId, role: newRole } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
  const roleToSet = newRole && ['ADMIN', 'OPERATOR', 'VIEWER'].includes(newRole) ? newRole : 'VIEWER';
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: 'APPROVED', role: roleToSet as any },
  });
  return NextResponse.json({ id: user.id, status: user.status, role: user.role });
}