import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ApproveButton from './ApproveButton';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== 'ADMIN') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Acesso negado</h2>
        <p>Você precisa ser ADMIN para acessar esta página.</p>
      </div>
    );
  }

  const pendentes = await prisma.user.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });

  

  return (
    <div style={{ padding: 24 }}>
      <h2>Administração de Usuários</h2>
      {pendentes.length === 0 ? (
        <p>Não há usuários pendentes.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendentes.map((u) => (
            <div key={u.id} style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 12 }}>
              <div><strong>{u.name}</strong> — {u.email}</div>
              <div>CPF: {u.cpf} | Número: {u.numero ?? '-'}</div>
              <ApproveButton userId={u.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}