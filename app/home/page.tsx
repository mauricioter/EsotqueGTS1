'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    disponivel: 0,
    emPosseDoTecnico: 0,
    descartado: 0,
    saida: 0,
    reservado: 0,
    defeito: 0,
    instalado: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/equipamentos');
      const data = await response.json();
      
      const statsData = {
        total: data.length,
        disponivel: data.filter((e: any) => e.status === 'DISPONIVEL').length,
        emPosseDoTecnico: data.filter((e: any) => e.status === 'EM_POSSE_DO_TECNICO').length,
        descartado: data.filter((e: any) => e.status === 'DESCARTADO').length,
        saida: data.filter((e: any) => e.status === 'SAIDA').length,
        reservado: data.filter((e: any) => e.status === 'RESERVADO').length,
        defeito: data.filter((e: any) => e.status === 'DEFEITO').length,
        instalado: data.filter((e: any) => e.status === 'INSTALADO').length,
      };
      
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setLoading(false);
    }
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

  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

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
            <span className="user-name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {session.user?.name}
            </span>
            <button onClick={() => signOut()} className="btn-logout">
              Sair
            </button>
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
        <div className="stats-grid">
          <div className="stat-card stat-total">
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

          <div className="stat-card stat-disponivel">
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

          <div className="stat-card stat-em-posse">
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

          <div className="stat-card stat-instalado">
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

          <div className="stat-card stat-descartado">
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

          <div className="stat-card stat-saida">
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

          <div className="stat-card stat-reservado">
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

          <div className="stat-card stat-defeito">
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
        </div>

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
    </div>
  );
}
