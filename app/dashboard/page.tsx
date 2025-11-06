import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard - Visão Geral de Equipamentos',
  description: 'Estatísticas completas e visão geral do estoque de equipamentos',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="page-container">
        <div className="section-card" style={{ textAlign: 'center' }}>
          <h2>Acesso negado</h2>
          <p>Faça login para visualizar a dashboard.</p>
        </div>
      </div>
    );
  }

  // Estatísticas gerais
  const total = await prisma.equipamento.count();
  const disponiveis = await prisma.equipamento.count({ where: { status: 'DISPONIVEL' as any } });
  const emUso = await prisma.equipamento.count({ where: { status: 'EM_USO' as any } });
  const manutencao = await prisma.equipamento.count({ where: { status: 'MANUTENCAO' as any } });
  const saida = await prisma.equipamento.count({ where: { status: 'SAIDA' as any } });
  const reservado = await prisma.equipamento.count({ where: { status: 'RESERVADO' as any } });
  const defeito = await prisma.equipamento.count({ where: { status: 'DEFEITO' as any } });
  const emprestado = await prisma.equipamento.count({ where: { status: 'EMPRESTADO' as any } });
  
  // Estatísticas de tempo
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const equipamentosHoje = await prisma.equipamento.count({ 
    where: { createdAt: { gte: hoje } } 
  });
  
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const equipamentosMes = await prisma.equipamento.count({ 
    where: { createdAt: { gte: inicioMes } } 
  });

  // Equipamentos recentes e com saída
  const recentes = await prisma.equipamento.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 6 
  });
  
  const saidasRecentes = await prisma.equipamento.findMany({ 
    where: { status: 'SAIDA' as any },
    orderBy: { dataSaida: 'desc' }, 
    take: 6
  });

  // Função auxiliar para determinar a classe do badge baseado no status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'badge-success';
      case 'EM_USO': return 'badge-primary';
      case 'EMPRESTADO': return 'badge-primary';
      case 'MANUTENCAO': return 'badge-warning';
      case 'RESERVADO': return 'badge-primary';
      case 'DEFEITO': return 'badge-danger';
      case 'SAIDA': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="page-container">
      {/* Cabeçalho */}
      <div className="section-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>📊 Dashboard - Visão Geral</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-light)' }}>
            Estatísticas completas e resumo de todos os equipamentos
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="section-card" style={{ 
          background: 'linear-gradient(135deg, #ff7a00 0%, #ff9933 100%)', 
          color: 'white',
          border: 'none'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📦 Total de Equipamentos</div>
          <div style={{ fontSize: '36px', fontWeight: 700 }}>{total}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            {equipamentosHoje > 0 && `+${equipamentosHoje} hoje`}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>✅ Disponíveis</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>{disponiveis}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {total > 0 ? `${((disponiveis / total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>🔧 Em Uso</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{emUso}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {total > 0 ? `${((emUso / total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>⚠️ Manutenção</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{manutencao}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {total > 0 ? `${((manutencao / total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Secundárias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📤 Saídas</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{saida}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>� Reservados</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{reservado}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>❌ Com Defeito</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{defeito}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📦 Emprestados</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#06b6d4' }}>{emprestado}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📊 Este Mês</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{equipamentosMes}</div>
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      <div className="section-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Distribuição de Status</h3>
        <div style={{ 
          display: 'flex', 
          height: '40px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {disponiveis > 0 && (
            <div style={{ 
              width: `${(disponiveis / total) * 100}%`, 
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {disponiveis > 0 && `${disponiveis}`}
            </div>
          )}
          {emUso > 0 && (
            <div style={{ 
              width: `${(emUso / total) * 100}%`, 
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {emUso > 0 && `${emUso}`}
            </div>
          )}
          {emprestado > 0 && (
            <div style={{ 
              width: `${(emprestado / total) * 100}%`, 
              background: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {emprestado > 0 && `${emprestado}`}
            </div>
          )}
          {manutencao > 0 && (
            <div style={{ 
              width: `${(manutencao / total) * 100}%`, 
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {manutencao > 0 && `${manutencao}`}
            </div>
          )}
          {reservado > 0 && (
            <div style={{ 
              width: `${(reservado / total) * 100}%`, 
              background: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {reservado > 0 && `${reservado}`}
            </div>
          )}
          {defeito > 0 && (
            <div style={{ 
              width: `${(defeito / total) * 100}%`, 
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {defeito > 0 && `${defeito}`}
            </div>
          )}
          {saida > 0 && (
            <div style={{ 
              width: `${(saida / total) * 100}%`, 
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {saida > 0 && `${saida}`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '13px' }}>
          <div><span style={{ color: '#22c55e' }}>●</span> Disponíveis ({disponiveis})</div>
          <div><span style={{ color: '#3b82f6' }}>●</span> Em Uso ({emUso})</div>
          <div><span style={{ color: '#06b6d4' }}>●</span> Emprestados ({emprestado})</div>
          <div><span style={{ color: '#f59e0b' }}>●</span> Manutenção ({manutencao})</div>
          <div><span style={{ color: '#8b5cf6' }}>●</span> Reservados ({reservado})</div>
          <div><span style={{ color: '#dc2626' }}>●</span> Com Defeito ({defeito})</div>
          <div><span style={{ color: '#ef4444' }}>●</span> Saídas ({saida})</div>
        </div>
      </div>

      {/* Grid com duas colunas: Entradas Recentes e Saídas Recentes */}
      <div className="grid-2" style={{ marginTop: '24px', gap: '24px' }}>
        {/* Entradas Recentes */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> Entradas Recentes
          </h3>
          {recentes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhum equipamento cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentes.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    Serial: {e.serial || '—'} | MAC: {e.mac || '—'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-light)', 
                    marginTop: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>📅 {new Date(e.dataEntrada).toLocaleDateString('pt-BR')}</span>
                    <span className={`status-badge ${getStatusBadgeClass(e.status)}`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saídas Recentes */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📤</span> Saídas Recentes
          </h3>
          {saidasRecentes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhuma saída registrada ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {saidasRecentes.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
                    📍 Destino: {e.destino || '—'}
                  </div>
                  {/* @ts-expect-error - Prisma Client needs regeneration */}
                  {e.tecnicoResponsavel && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--primary)',
                      padding: '6px 10px',
                      background: 'var(--bg-subtle)',
                      borderRadius: '6px',
                      marginTop: '6px',
                      marginBottom: '6px',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                        {/* @ts-expect-error - Prisma Client needs regeneration */}
                        👤 Técnico: {e.tecnicoResponsavel}
                      </div>
                      {/* @ts-expect-error - Prisma Client needs regeneration */}
                      {e.assinaturaTecnico && (
                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                          {/* @ts-expect-error - Prisma Client needs regeneration */}
                          ✍️ Matrícula/Assinatura: {e.assinaturaTecnico}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-light)', 
                    marginTop: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>📅 {e.dataSaida ? new Date(e.dataSaida).toLocaleDateString('pt-BR') : '—'}</span>
                    <span className="status-badge badge-danger">SAÍDA</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}