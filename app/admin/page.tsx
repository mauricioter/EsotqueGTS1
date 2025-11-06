import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ApproveButton from './ApproveButton';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="section-card" style={{ textAlign: 'center' }}>
          <h2>Acesso negado</h2>
          <p>Você precisa ser ADMIN para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const pendentes = await prisma.user.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });

  

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2>Administração de Usuários</h2>
          <p className="text-muted">Aprove usuários pendentes para liberar acesso.</p>
        </div>
      </div>
      {pendentes.length === 0 ? (
        <div className="section-card text-center">Não há usuários pendentes.</div>
      ) : (
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendentes.map((u) => (
            <div key={u.id} className="card" style={{ padding: 12 }}>
              <div><strong>{u.name}</strong> — {u.email}</div>
              <div className="small-muted">CPF: {u.cpf} | Número: {u.numero ?? '-'}</div>
              <div className="actions-center" style={{ marginTop: 8 }}>
                <ApproveButton userId={u.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}