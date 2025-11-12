'use client';

import { useState, useEffect } from 'react';
import './dashboard.css';

interface Equipamento {
  id: string;
  nome: string;
  serial: string | null;
  mac: string | null;
  status: string;
  dataEntrada: string;
  dataSaida: string | null;
  destino: string | null;
  tecnicoResponsavel?: string | null;
  assinaturaTecnico?: string | null;
  tipo?: string | null;
  marca?: string | null;
}

interface Stats {
  total: number;
  disponiveis: number;
  emUso: number;
  manutencao: number;
  saida: number;
  reservado: number;
  defeito: number;
  emprestado: number;
  instalado: number;
  retorno: number;
  equipamentosHoje: number;
  equipamentosMes: number;
  recentes: Equipamento[];
  saidasRecentes: Equipamento[];
  instalacoes: Equipamento[];
  retornos: Equipamento[];
}

export default function DashboardClient() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);
      
      const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    carregarDados();
  };

  const limparFiltro = () => {
    setDataInicio('');
    setDataFim('');
    setTimeout(carregarDados, 100);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'badge-success';
      case 'EM_USO': return 'badge-primary';
      case 'EMPRESTADO': return 'badge-primary';
      case 'MANUTENCAO': return 'badge-warning';
      case 'RESERVADO': return 'badge-primary';
      case 'DEFEITO': return 'badge-danger';
      case 'SAIDA': return 'badge-danger';
      case 'INSTALADO': return 'badge-success';
      case 'RETORNO': return 'badge-primary';
      default: return 'badge-primary';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

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

      {/* Filtro por Período */}
      <div className="section-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📅 Filtrar por Período</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={aplicarFiltro} className="btn-primary">
              🔍 Filtrar
            </button>
            <button onClick={limparFiltro} className="btn-secondary">
              🔄 Limpar
            </button>
          </div>
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
          <div style={{ fontSize: '36px', fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            {stats.equipamentosHoje > 0 && `+${stats.equipamentosHoje} hoje`}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>✅ Disponíveis</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>{stats.disponiveis}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {stats.total > 0 ? `${((stats.disponiveis / stats.total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>🔧 Em Uso</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f97316' }}>{stats.emUso}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {stats.total > 0 ? `${((stats.emUso / stats.total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>

        <div className="section-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>⚠️ Manutenção</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{stats.manutencao}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
            {stats.total > 0 ? `${((stats.manutencao / stats.total) * 100).toFixed(0)}% do estoque` : '0% do estoque'}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas com Período */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📤 Saídas</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{stats.saida}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📥 Instalados</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{stats.instalado}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>🔄 Retornos</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#f97316' }}>{stats.retorno}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📌 Reservados</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#6b7280' }}>{stats.reservado}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>❌ Com Defeito</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{stats.defeito}</div>
        </div>

        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>📦 Emprestados</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ea580c' }}>{stats.emprestado}</div>
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
          {stats.disponiveis > 0 && (
            <div style={{ 
              width: `${(stats.disponiveis / stats.total) * 100}%`, 
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.disponiveis}
            </div>
          )}
          {stats.emUso > 0 && (
            <div style={{ 
              width: `${(stats.emUso / stats.total) * 100}%`, 
              background: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.emUso}
            </div>
          )}
          {stats.emprestado > 0 && (
            <div style={{ 
              width: `${(stats.emprestado / stats.total) * 100}%`, 
              background: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.emprestado}
            </div>
          )}
          {stats.instalado > 0 && (
            <div style={{ 
              width: `${(stats.instalado / stats.total) * 100}%`, 
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.instalado}
            </div>
          )}
          {stats.manutencao > 0 && (
            <div style={{ 
              width: `${(stats.manutencao / stats.total) * 100}%`, 
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.manutencao}
            </div>
          )}
          {stats.reservado > 0 && (
            <div style={{ 
              width: `${(stats.reservado / stats.total) * 100}%`, 
              background: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.reservado}
            </div>
          )}
          {stats.defeito > 0 && (
            <div style={{ 
              width: `${(stats.defeito / stats.total) * 100}%`, 
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.defeito}
            </div>
          )}
          {stats.saida > 0 && (
            <div style={{ 
              width: `${(stats.saida / stats.total) * 100}%`, 
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {stats.saida}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '13px' }}>
          <div><span style={{ color: '#22c55e' }}>●</span> Disponíveis ({stats.disponiveis})</div>
          <div><span style={{ color: '#f97316' }}>●</span> Em Uso ({stats.emUso})</div>
          <div><span style={{ color: '#ea580c' }}>●</span> Emprestados ({stats.emprestado})</div>
          <div><span style={{ color: '#10b981' }}>●</span> Instalados ({stats.instalado})</div>
          <div><span style={{ color: '#f59e0b' }}>●</span> Manutenção ({stats.manutencao})</div>
          <div><span style={{ color: '#6b7280' }}>●</span> Reservados ({stats.reservado})</div>
          <div><span style={{ color: '#dc2626' }}>●</span> Com Defeito ({stats.defeito})</div>
          <div><span style={{ color: '#ef4444' }}>●</span> Saídas ({stats.saida})</div>
        </div>
      </div>

      {/* Grid com quatro colunas: Entradas, Saídas, Instalações e Retornos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {/* Entradas Recentes */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> Entradas Recentes
          </h3>
          {stats.recentes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhum equipamento no período.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentes.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    Serial: {e.serial || '—'}
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
          {stats.saidasRecentes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhuma saída no período.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.saidasRecentes.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    📍 {e.destino || '—'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-light)', 
                    marginTop: '6px'
                  }}>
                    📅 {e.dataSaida ? new Date(e.dataSaida).toLocaleDateString('pt-BR') : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instalações Recentes */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔧</span> Instalações Recentes
          </h3>
          {stats.instalacoes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhuma instalação no período.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.instalacoes.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    📍 {e.destino || '—'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-light)', 
                    marginTop: '6px'
                  }}>
                    📅 {e.dataEntrada ? new Date(e.dataEntrada).toLocaleDateString('pt-BR') : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retornos Recentes */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span> Retornos Recentes
          </h3>
          {stats.retornos.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhum retorno no período.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.retornos.map((e) => (
                <div key={e.id} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{e.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    Serial: {e.serial || '—'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-light)', 
                    marginTop: '6px'
                  }}>
                    📅 {e.dataEntrada ? new Date(e.dataEntrada).toLocaleDateString('pt-BR') : '—'}
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
