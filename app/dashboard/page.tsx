import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Dashboard de Equipamentos',
  description: 'Visão geral e métricas dos equipamentos',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Acesso negado</h2>
        <p>Faça login para visualizar a dashboard.</p>
      </div>
    );
  }

  const total = await prisma.equipamento.count();
  const disponiveis = await prisma.equipamento.count({ where: { status: 'DISPONIVEL' as any } });
  const emUso = await prisma.equipamento.count({ where: { status: 'EM_USO' as any } });
  const manutencao = await prisma.equipamento.count({ where: { status: 'MANUTENCAO' as any } });

  const recentes = await prisma.equipamento.findMany({ orderBy: { createdAt: 'desc' }, take: 8 });

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard de Equipamentos</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Resumo do estoque e atividades recentes.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{total}</div>
        </div>
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Disponíveis</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{disponiveis}</div>
        </div>
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Em uso</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{emUso}</div>
        </div>
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Manutenção</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{manutencao}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Entradas recentes</h3>
      {recentes.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Sem itens recentes.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {recentes.map((e) => (
            <div key={e.id} style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{e.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Serial: {e.serial || '-'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>MAC: {e.mac || '-'}</div>
              <div style={{ fontSize: 12 }}>Status: {e.status}</div>
              <div style={{ fontSize: 12 }}>Entrada: {new Date(e.dataEntrada).toLocaleString()}</div>
              {e.dataSaida && <div style={{ fontSize: 12 }}>Saída: {new Date(e.dataSaida).toLocaleString()}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}