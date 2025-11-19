'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '../components/Footer';
import SettingsModal from '../components/SettingsModal';
import '../home.css';

interface Stats {
  total: number;
  disponivel: number;
  emPosseDoTecnico: number;
  descartado: number;
  saida: number;
  reservado: number;
  defeito: number;
  instalado: number;
  equipamentoDeRetorno: number;
}

interface Equipamento {
  id: string;
  nome: string;
  serial?: string;
  macAddress?: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  status: string;
  descricao?: string;
}

interface Anotacao {
  id: string;
  texto: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session as unknown as { role?: 'ADMIN' | 'OPERATOR' | 'VIEWER' })?.role;
  const [menuAberto, setMenuAberto] = useState(false);
  const [settingsAberto, setSettingsAberto] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [techMenuAberto, setTechMenuAberto] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    disponivel: 0,
    emPosseDoTecnico: 0,
    descartado: 0,
    saida: 0,
    reservado: 0,
    defeito: 0,
    instalado: 0,
    equipamentoDeRetorno: 0,
  });
  const [loading, setLoading] = useState(true);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [movs, setMovs] = useState<any[]>([]);
  const [tecnicosAtivos, setTecnicosAtivos] = useState<{ id: string; nome: string; funcao?: string; telefone?: string; status: string }[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [tituloModal, setTituloModal] = useState('');
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Funções de carregamento
  const carregarAnotacoes = async () => {
    try {
      const response = await fetch('/api/anotacoes');
      if (response.ok) {
        const data = await response.json();
        setAnotacoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const salvarAnotacao = async () => {
    if (!novaAnotacao.trim()) return;

    try {
      const response = await fetch('/api/anotacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: novaAnotacao }),
      });

      if (response.ok) {
        const novaAnotacaoObj = await response.json();
        setAnotacoes([novaAnotacaoObj, ...anotacoes]);
        setNovaAnotacao('');
      }
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
    }
  };

  const excluirAnotacao = async (id: string) => {
    try {
      const response = await fetch(`/api/anotacoes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnotacoes(anotacoes.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/equipamentos');
      const data = await response.json();
      setEquipamentos(data);
      const statsData = {
        total: data.length,
        disponivel: data.filter((e: any) => e.status === 'DISPONIVEL').length,
        emPosseDoTecnico: data.filter((e: any) => e.status === 'EM_POSSE_DO_TECNICO').length,
        descartado: data.filter((e: any) => e.status === 'DESCARTADO').length,
        saida: data.filter((e: any) => e.status === 'SAIDA').length,
        reservado: data.filter((e: any) => e.status === 'RESERVADO').length,
        defeito: data.filter((e: any) => e.status === 'DEFEITO').length,
        instalado: data.filter((e: any) => e.status === 'INSTALADO').length,
        equipamentoDeRetorno: data.filter((e: any) => e.status === 'EQUIPAMENTO_DE_RETORNO').length,
      };
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setLoading(false);
    }
  };

  const fetchMovs = async () => {
    try {
      const res = await fetch('/api/ferramentas/movimentar');
      const data = await res.json();
      setMovs(data.movimentacoes || []);
    } catch (e) {
      console.error('Erro ao buscar movimentações:', e);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
      fetchMovs();
      carregarAnotacoes();
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tech-actions-wrapper')) {
        setTechMenuAberto(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTechMenuAberto(null);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);


  useEffect(() => {
    const loadTecnicos = async () => {
      if (status === 'authenticated' && role === 'ADMIN') {
        try {
          const res = await fetch('/api/tecnicos?status=ATIVO');
          if (res.ok) {
            const lista = await res.json();
            setTecnicosAtivos(lista || []);
          }
        } catch (e) {
          console.error('Erro ao carregar técnicos:', e);
        }
      }
    };
    loadTecnicos();
  }, [status, role]);

  const abrirModal = (status: string, titulo: string) => {
    setFiltroStatus(status);
    setTituloModal(titulo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFiltroStatus('');
    setTituloModal('');
  };

  const equipamentosFiltrados = filtroStatus === 'TODOS' 
    ? equipamentos 
    : equipamentos.filter(e => e.status === filtroStatus);

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'DISPONIVEL': 'Disponível',
      'EM_POSSE_DO_TECNICO': 'Em Posse do Técnico',
      'INSTALADO': 'Instalado',
      'DESCARTADO': 'Descartado',
      'SAIDA': 'Saída',
      'RESERVADO': 'Reservado',
      'DEFEITO': 'Com Defeito',
      'EQUIPAMENTO_DE_RETORNO': 'Equipamento de Retorno'
    };
    return labels[status] || status;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }


  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/logo.png" alt="GTSnet" className="header-logo" />
            <h1>Controle de Estoque GTSnet</h1>
          </div>
          <div className="header-right">
            <div className="profile-menu">
              <button
                className="user-name"
                onClick={() => setMenuAberto(!menuAberto)}
                aria-expanded={menuAberto}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {session.user?.name}
                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {menuAberto && (
                <div className="profile-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => { setSettingsTab('profile'); setSettingsAberto(true); setMenuAberto(false); }}
                  >
                    Meu Perfil
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { setSettingsTab('security'); setSettingsAberto(true); setMenuAberto(false); }}
                  >
                    Alterar Senha
                  </button>
                  <button
                    className="dropdown-item sair"
                    onClick={() => { setMenuAberto(false); signOut(); }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <div className="welcome-section">
          <h2>Bem-vindo, {session.user?.name}!</h2>
          <p className="welcome-subtitle">
            Visão geral do estoque de equipamentos
          </p>
        </div>

        {/* Stats Grid */}
        {role === 'ADMIN' && (
        <div className="stats-grid">
          <div className="stat-card stat-total" onClick={() => abrirModal('TODOS', 'Todos os Equipamentos')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 14H4V9h16v10z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total de Equipamentos</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card stat-disponivel" onClick={() => abrirModal('DISPONIVEL', 'Equipamentos Disponíveis')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Disponíveis</h3>
              <p className="stat-number">{stats.disponivel}</p>
            </div>
          </div>

          <div className="stat-card stat-em-posse" onClick={() => abrirModal('EM_POSSE_DO_TECNICO', 'Em Posse do Técnico')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Em Posse do Técnico</h3>
              <p className="stat-number">{stats.emPosseDoTecnico}</p>
            </div>
          </div>

          <div className="stat-card stat-instalado" onClick={() => abrirModal('INSTALADO', 'Equipamentos Instalados')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Instalados</h3>
              <p className="stat-number">{stats.instalado}</p>
            </div>
          </div>

          <div className="stat-card stat-descartado" onClick={() => abrirModal('DESCARTADO', 'Equipamentos Descartados')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Descartados</h3>
              <p className="stat-number">{stats.descartado}</p>
            </div>
          </div>

          <div className="stat-card stat-saida" onClick={() => abrirModal('SAIDA', 'Equipamentos em Saída')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Saída</h3>
              <p className="stat-number">{stats.saida}</p>
            </div>
          </div>

          <div className="stat-card stat-reservado" onClick={() => abrirModal('RESERVADO', 'Equipamentos Reservados')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Reservados</h3>
              <p className="stat-number">{stats.reservado}</p>
            </div>
          </div>

          <div className="stat-card stat-defeito" onClick={() => abrirModal('DEFEITO', 'Equipamentos com Defeito')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Com Defeito</h3>
              <p className="stat-number">{stats.defeito}</p>
            </div>
          </div>

          <div className="stat-card stat-retorno" onClick={() => abrirModal('EQUIPAMENTO_DE_RETORNO', 'Equipamentos de Retorno')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Equipamento de Retorno</h3>
              <p className="stat-number">{stats.equipamentoDeRetorno}</p>
            </div>
          </div>
        </div>
        )}

        {role !== 'ADMIN' && (
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 14H4V9h16v10z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Estoque Pessoal</h3>
                <p className="stat-number">{equipamentos.filter(e => e.tecnicoResponsavel === session.user?.name).length}</p>
              </div>
            </div>
            <div className="stat-card stat-disponivel">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Retiradas por você</h3>
                <p className="stat-number">{movs.filter(m => m.tipoMovimentacao === 'EMPRESTIMO' && m.tecnicoNome === session.user?.name).length}</p>
              </div>
            </div>
            <div className="stat-card stat-instalado">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Devoluções pendentes</h3>
                <p className="stat-number">{movs.filter(m => m.tecnicoNome === session.user?.name && m.tipoMovimentacao === 'EMPRESTIMO' && !m.dataDevolucaoReal).length}</p>
              </div>
            </div>
          </div>
        )}

        {role === 'ADMIN' && (
          <div className="section-card tech-section">
            <div className="tech-section-header">
              <h3>Técnicos Ativos</h3>
              <Link href="/tecnicos" className="btn btn-secondary">Gerenciar Técnicos</Link>
            </div>
            <div className="tech-list">
              {tecnicosAtivos.length === 0 ? (
                <div className="empty-state text-center">Nenhum técnico ativo</div>
              ) : (
                tecnicosAtivos.map((t, idx) => {
                  const movimentosDoTecnico = movs.filter(m => m.tecnicoNome === t.nome);
                  const ultima = movimentosDoTecnico.length
                    ? new Date(
                        movimentosDoTecnico.reduce((a: any, b: any) => {
                          const da = new Date(a.createdAt || a.dataRetirada);
                          const db = new Date(b.createdAt || b.dataRetirada);
                          return da > db ? a : b;
                        }).createdAt || movimentosDoTecnico[0].dataRetirada
                      ).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  return (
                    <div key={t.id} className={`tech-item ${idx !== 0 ? 'with-divider' : ''}`}>
                      <div className="tech-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="tech-main">
                        <div className="tech-header">
                          <span className="tech-name">{t.nome}</span>
                          <span className={`tech-status ${t.status === 'ATIVO' ? 'ok' : 'off'}`}>{t.status}</span>
                        </div>
                        <div className="tech-meta">
                          {t.funcao && <span className="tech-funcao">{t.funcao}</span>}
                          {ultima && <span className="tech-ultima">Última atividade {ultima}</span>}
                        </div>
                      </div>
                      <div className="tech-actions-wrapper" onMouseLeave={() => setTechMenuAberto(null)}>
                        <button
                          className="tech-actions"
                          title="Opções"
                          onClick={() => setTechMenuAberto(techMenuAberto === t.id ? null : t.id)}
                          aria-expanded={techMenuAberto === t.id}
                        >
                          ⋮
                        </button>
                        {techMenuAberto === t.id && (
                          <div className="tech-actions-menu">
                            <Link href={`/tecnicos/${t.id}`} className="tech-menu-item" onClick={() => setTechMenuAberto(null)}>Ver perfil do técnico</Link>
                            <Link href={`/tecnicos/${t.id}/estoque`} className="tech-menu-item" onClick={() => setTechMenuAberto(null)}>Ver estoque do técnico</Link>
                            {role === 'ADMIN' && (
                              <Link href="/usuarios" className="tech-menu-item" onClick={() => setTechMenuAberto(null)}>Editar usuário</Link>
                            )}
                            <button
                              className="tech-menu-item danger"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/tecnicos/${t.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'INATIVO' }),
                                  });
                                  if (res.ok) {
                                    setTecnicosAtivos(prev => prev.filter(tt => tt.id !== t.id));
                                    setTechMenuAberto(null);
                                  }
                                } catch (e) {
                                  console.error('Erro ao desativar técnico:', e);
                                }
                              }}
                            >
                              Desativar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="actions-grid">
            <Link href="/equipamentos" className="action-card">
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <h4>Gerenciar Equipamentos</h4>
              <p>Visualizar, criar e editar equipamentos</p>
            </Link>

            {(role === 'ADMIN' || role === 'OPERATOR') && (
              <Link href="/transferencias" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <h4>Transferir Equipamentos</h4>
                <p>Transferir equipamentos para técnicos</p>
              </Link>
            )}

            <Link href="/ferramentas" className="action-card">
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <h4>Controle de Ferramentas</h4>
              <p>Gerenciar ferramentas e movimentações</p>
            </Link>

            {role === 'ADMIN' && (
              <Link href="/usuarios" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h4>Gerenciar Usuários</h4>
                <p>Visualizar e aprovar usuários</p>
              </Link>
            )}

            <button onClick={fetchStats} className="action-card action-refresh">
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <h4>Atualizar Dados</h4>
              <p>Recarregar estatísticas</p>
            </button>
          </div>
        </div>

        {/* Anotações Importantes */}
        <div className="anotacoes-section">
          <div className="anotacoes-header">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Anotações Importantes
            </h3>
            <span className="anotacoes-count">{anotacoes.length}</span>
          </div>

          <div className="nova-anotacao">
            <textarea
              value={novaAnotacao}
              onChange={(e) => setNovaAnotacao(e.target.value)}
              placeholder="Digite uma nova anotação importante..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  salvarAnotacao();
                }
              }}
            />
            <button onClick={salvarAnotacao} className="btn-salvar-anotacao" disabled={!novaAnotacao.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m7-7H5"/>
              </svg>
              Salvar Anotação
            </button>
          </div>

          <div className="lista-anotacoes">
            {anotacoes.length === 0 ? (
              <div className="anotacoes-vazio">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>Nenhuma anotação importante ainda</p>
                <span>Adicione lembretes e informações importantes aqui</span>
              </div>
            ) : (
              anotacoes.map((anotacao) => {
                const dataObj = new Date(anotacao.createdAt);
                const data = dataObj.toLocaleDateString('pt-BR');
                const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                <div key={anotacao.id} className="anotacao-item">
                  <div className="anotacao-conteudo">
                    <p>{anotacao.texto}</p>
                    <div className="anotacao-meta">
                      <span className="anotacao-data">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {data}
                      </span>
                      <span className="anotacao-hora">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {hora}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => excluirAnotacao(anotacao.id)} 
                    className="btn-excluir-anotacao"
                    title="Excluir anotação"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Resumo por Status</h3>
          <div className="activity-bars">
            <div className="activity-bar">
              <div className="bar-label">
                <span>Disponíveis</span>
                <span>{stats.disponivel}</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill bar-disponivel" 
                  style={{ width: `${(stats.disponivel / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="activity-bar">
              <div className="bar-label">
                <span>Em Posse do Técnico</span>
                <span>{stats.emPosseDoTecnico}</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill bar-em-posse" 
                  style={{ width: `${(stats.emPosseDoTecnico / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="activity-bar">
              <div className="bar-label">
                <span>Instalados</span>
                <span>{stats.instalado}</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill bar-instalado" 
                  style={{ width: `${(stats.instalado / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="activity-bar">
              <div className="bar-label">
                <span>Descartados</span>
                <span>{stats.descartado}</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill bar-descartado" 
                  style={{ width: `${(stats.descartado / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={settingsAberto} onClose={() => setSettingsAberto(false)} initialTab={settingsTab} />

      {/* Modal de Equipamentos */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{tituloModal}</h2>
              <button className="modal-close" onClick={fecharModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {equipamentosFiltrados.length === 0 ? (
                <div className="modal-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                  <p>Nenhum equipamento encontrado nesta categoria</p>
                </div>
              ) : (
                <div className="equipamentos-lista">
                  {equipamentosFiltrados.map((equip) => (
                    <div key={equip.id} className="equipamento-item">
                      <div className="equipamento-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                        </svg>
                      </div>
                      <div className="equipamento-info">
                        <h3>{equip.nome}</h3>
                        <div className="equipamento-detalhes">
                          {equip.tipo && <span className="detalhe-badge">{equip.tipo}</span>}
                          {equip.marca && <span className="detalhe-badge">{equip.marca}</span>}
                          {equip.modelo && <span className="detalhe-badge">{equip.modelo}</span>}
                        </div>
                        <div className="equipamento-specs">
                          {equip.serial && (
                            <span className="spec-item">
                              <strong>Serial:</strong> {equip.serial}
                            </span>
                          )}
                          {equip.macAddress && (
                            <span className="spec-item">
                              <strong>MAC:</strong> {equip.macAddress}
                            </span>
                          )}
                        </div>
                        <span className={`status-badge status-${equip.status.toLowerCase()}`}>
                          {getStatusLabel(equip.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <p className="modal-count">
                <strong>{equipamentosFiltrados.length}</strong> equipamento(s) encontrado(s)
              </p>
              <Link href="/equipamentos" className="btn-ver-todos" onClick={fecharModal}>
                Ver Página Completa
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
