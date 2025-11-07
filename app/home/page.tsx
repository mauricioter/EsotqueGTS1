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
            <span className="user-name">{session.user?.name}</span>
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
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total de Equipamentos</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card stat-disponivel">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Disponíveis</h3>
              <p className="stat-number">{stats.disponivel}</p>
            </div>
          </div>

          <div className="stat-card stat-em-posse">
            <div className="stat-icon">�</div>
            <div className="stat-content">
              <h3>Em Posse do Técnico</h3>
              <p className="stat-number">{stats.emPosseDoTecnico}</p>
            </div>
          </div>

          <div className="stat-card stat-instalado">
            <div className="stat-icon">�</div>
            <div className="stat-content">
              <h3>Instalados</h3>
              <p className="stat-number">{stats.instalado}</p>
            </div>
          </div>

          <div className="stat-card stat-descartado">
            <div className="stat-icon">�️</div>
            <div className="stat-content">
              <h3>Descartados</h3>
              <p className="stat-number">{stats.descartado}</p>
            </div>
          </div>

          <div className="stat-card stat-saida">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <h3>Saída</h3>
              <p className="stat-number">{stats.saida}</p>
            </div>
          </div>

          <div className="stat-card stat-reservado">
            <div className="stat-icon">📌</div>
            <div className="stat-content">
              <h3>Reservados</h3>
              <p className="stat-number">{stats.reservado}</p>
            </div>
          </div>

          <div className="stat-card stat-defeito">
            <div className="stat-icon">⚠️</div>
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
              <div className="action-icon">📋</div>
              <h4>Gerenciar Equipamentos</h4>
              <p>Visualizar, criar e editar equipamentos</p>
            </Link>

            {role === 'ADMIN' && (
              <Link href="/usuarios" className="action-card">
                <div className="action-icon">👥</div>
                <h4>Gerenciar Usuários</h4>
                <p>Visualizar e aprovar usuários</p>
              </Link>
            )}

            <Link href="/mobile" className="action-card">
              <div className="action-icon">📱</div>
              <h4>App Mobile</h4>
              <p>Acesso para técnicos de campo</p>
            </Link>

            <button onClick={fetchStats} className="action-card action-refresh">
              <div className="action-icon">🔄</div>
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
