'use client';

import { useState, useEffect } from 'react';
import './analitico.css';

interface Analytics {
  porMarca: { marca: string; total: number }[];
  porTipo: { tipo: string; total: number }[];
  porStatus: { status: string; total: number }[];
  totalEquipamentos: number;
  insights: {
    marcaMaisPopular: string;
    tipoMaisComum: string;
    taxaDisponibilidade: number;
    taxaUtilizacao: number;
  };
}

export default function AnaliticoPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const analytics = await response.json();
      setData(analytics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
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

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getMaxCount = (items: { total: number }[]) => {
    return Math.max(...items.map(i => i.total), 1);
  };

  return (
    <div className="page-container">
      {/* Cabeçalho */}
      <div className="section-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>📊 Análise de Equipamentos</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-light)' }}>
            Insights detalhados sobre marcas, tipos e distribuição do estoque
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
              className="date-input"
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
              className="date-input"
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

      {/* Cards de Insights */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #ff7a00 0%, #ff9933 100%)' }}>
          <div className="insight-icon">🏆</div>
          <div className="insight-label">Marca Mais Popular</div>
          <div className="insight-value">{data.insights.marcaMaisPopular || 'N/A'}</div>
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' }}>
          <div className="insight-icon">📦</div>
          <div className="insight-label">Tipo Mais Comum</div>
          <div className="insight-value">{data.insights.tipoMaisComum || 'N/A'}</div>
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}>
          <div className="insight-icon">✅</div>
          <div className="insight-label">Taxa de Disponibilidade</div>
          <div className="insight-value">{data.insights.taxaDisponibilidade.toFixed(1)}%</div>
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <div className="insight-icon">🔧</div>
          <div className="insight-label">Taxa de Utilização</div>
          <div className="insight-value">{data.insights.taxaUtilizacao.toFixed(1)}%</div>
        </div>
      </div>

      {/* Análises em Grid */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
        {/* Equipamentos por Marca */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>
            📊 Equipamentos por Marca
          </h3>
          {data.porMarca.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhum dado disponível
            </p>
          ) : (
            <div className="chart-container">
              {data.porMarca.map((item, index) => {
                const percentage = (item.total / data.totalEquipamentos) * 100;
                const maxCount = getMaxCount(data.porMarca);
                const barWidth = (item.total / maxCount) * 100;
                
                return (
                  <div key={index} className="chart-row">
                    <div className="chart-label">
                      {item.marca || 'Sem marca'}
                    </div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ 
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, #ff7a00, #ff9933)`
                        }}
                      >
                        <span className="chart-bar-label">{item.total}</span>
                      </div>
                    </div>
                    <div className="chart-percentage">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Equipamentos por Tipo */}
        <div className="section-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>
            📦 Equipamentos por Tipo
          </h3>
          {data.porTipo.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              Nenhum dado disponível
            </p>
          ) : (
            <div className="chart-container">
              {data.porTipo.map((item, index) => {
                const percentage = (item.total / data.totalEquipamentos) * 100;
                const maxCount = getMaxCount(data.porTipo);
                const barWidth = (item.total / maxCount) * 100;
                
                return (
                  <div key={index} className="chart-row">
                    <div className="chart-label">
                      {item.tipo || 'Sem tipo'}
                    </div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ 
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, #22c55e, #10b981)`
                        }}
                      >
                        <span className="chart-bar-label">{item.total}</span>
                      </div>
                    </div>
                    <div className="chart-percentage">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Distribuição por Status */}
      <div className="section-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>
          🎯 Distribuição por Status
        </h3>
        {data.porStatus.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
            Nenhum dado disponível
          </p>
        ) : (
          <div className="chart-container">
            {data.porStatus.map((item, index) => {
              const percentage = (item.total / data.totalEquipamentos) * 100;
              const maxCount = getMaxCount(data.porStatus);
              const barWidth = (item.total / maxCount) * 100;
              
              const statusColors: Record<string, string> = {
                'DISPONIVEL': 'linear-gradient(90deg, #22c55e, #10b981)',
                'EM_USO': 'linear-gradient(90deg, #f97316, #ea580c)',
                'EMPRESTADO': 'linear-gradient(90deg, #ea580c, #dc2626)',
                'MANUTENCAO': 'linear-gradient(90deg, #f59e0b, #f97316)',
                'RESERVADO': 'linear-gradient(90deg, #6b7280, #4b5563)',
                'DEFEITO': 'linear-gradient(90deg, #dc2626, #b91c1c)',
                'SAIDA': 'linear-gradient(90deg, #ef4444, #dc2626)',
                'INSTALADO': 'linear-gradient(90deg, #22c55e, #16a34a)',
                'RETORNO': 'linear-gradient(90deg, #f97316, #f59e0b)',
              };
              
              return (
                <div key={index} className="chart-row">
                  <div className="chart-label">
                    {item.status}
                  </div>
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{ 
                        width: `${barWidth}%`,
                        background: statusColors[item.status] || 'linear-gradient(90deg, #6b7280, #4b5563)'
                      }}
                    >
                      <span className="chart-bar-label">{item.total}</span>
                    </div>
                  </div>
                  <div className="chart-percentage">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
