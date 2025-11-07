'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CadastroEquipamento from '../components/CadastroEquipamento';
import ListaEquipamentos from '../components/ListaEquipamentos';
import SidebarSearch from '../components/SidebarSearch';
import '../equipamentos.css';

interface SearchState {
  query: string;
  field: string;
}

export default function EquipamentosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState<SearchState>({ query: '', field: 'all' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

  const handleSearch = (query: string, field: string) => {
    setSearch({ query, field });
  };

  return (
    <div className="equipamentos-container">
      {/* Header com navegação */}
      <header className="equipamentos-header">
        <div className="header-content">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="header-title">
            <img src="/logo.png" alt="GTSnet" className="header-logo" />
            <h1>Equipamentos</h1>
          </div>

          <nav className="header-nav">
            <Link href="/home" className="nav-link">
              <span className="nav-icon">🏠</span>
              Dashboard
            </Link>
            <Link href="/equipamentos" className="nav-link active">
              <span className="nav-icon">📋</span>
              Equipamentos
            </Link>
            {role === 'ADMIN' && (
              <Link href="/usuarios" className="nav-link">
                <span className="nav-icon">👥</span>
                Usuários
              </Link>
            )}
            <Link href="/mobile" className="nav-link">
              <span className="nav-icon">📱</span>
              Mobile
            </Link>
          </nav>
        </div>
      </header>

      {/* Layout principal */}
      <div className="equipamentos-layout">
        {/* Sidebar de pesquisa */}
        <aside className={`equipamentos-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
          <SidebarSearch onSearch={handleSearch} />
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conteúdo principal */}
        <main className="equipamentos-main">
          {/* Seção de cadastro */}
          <section className="cadastro-section">
            <div className="section-header">
              <h2>
                {role === 'ADMIN' || role === 'OPERATOR' 
                  ? 'Cadastrar Novo Equipamento' 
                  : 'Visualização de Equipamentos'}
              </h2>
              <p>
                {role === 'ADMIN' || role === 'OPERATOR'
                  ? 'Preencha os dados abaixo para adicionar um novo equipamento ao estoque'
                  : 'Você tem permissão apenas para visualizar equipamentos'}
              </p>
            </div>

            {role === 'ADMIN' || role === 'OPERATOR' ? (
              <CadastroEquipamento />
            ) : (
              <div className="no-permission">
                <div className="no-permission-icon">🔒</div>
                <h3>Sem Permissão para Cadastro</h3>
                <p>
                  Seu perfil é de <strong>Leitura</strong>. Somente <strong>Operadores</strong> e
                  <strong> Administradores</strong> podem cadastrar ou editar equipamentos.
                </p>
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="section-divider"></div>

          {/* Seção de listagem */}
          <section className="lista-section">
            <div className="section-header">
              <h2>Todos os Equipamentos</h2>
              <p>Visualize e gerencie todos os equipamentos do estoque</p>
            </div>

            <ListaEquipamentos 
              searchQuery={search.query}
              searchField={search.field}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
