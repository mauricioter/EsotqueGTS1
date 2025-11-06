'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn, signOut } from 'next-auth/react';
import CadastroEquipamento from './components/CadastroEquipamento';
import ListaEquipamentos from './components/ListaEquipamentos';
import SidebarSearch from './components/SidebarSearch';
import UserSidebar from './components/UserSidebar';
import NotesPanel from './components/NotesPanel';
import './index.css';

// Importação dinâmica do ThemeToggle para evitar problemas de hidratação
const ThemeToggle = dynamic(() => import('./components/ThemeToggle'), {
  ssr: false,
  loading: () => <div className="theme-toggle-loading">🌙</div>
});

// Tipos para a pesquisa
interface SearchState {
  query: string;
  field: string;
}

// Componente principal da aplicação
export default function App() {
  const [search, setSearch] = useState<SearchState>({ query: '', field: 'all' });
  const [mounted, setMounted] = useState(false);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query: string, field: string) => {
    setSearch({ query, field });
  };

  if (!mounted || authStatus === 'loading') {
    return (
      <div className="app-container loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar botão para login
  if (!session) {
    return (
      <div className="app-container loading-container">
        <div className="loading-spinner">
          <p>Faça login para continuar</p>
          <button
            className="btn-secondary"
            onClick={() => {
              signIn(undefined, { callbackUrl: '/' });
            }}
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

  return (
    <div className="app-container" suppressHydrationWarning>
      <header className="app-header">
        <div className="app-nav container">
          <div className="header-title">
            <img 
              src="/logo.png" 
              alt="GTSnet Logo" 
              style={{ 
                height: '32px', 
                width: 'auto',
                marginRight: '12px'
              }} 
            />
            Controle de Estoque
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <SidebarSearch onSearch={handleSearch} />
          <NotesPanel />
        </aside>
        
        <main className="main-content">
          <section className="form-section">
            {role === 'ADMIN' || role === 'OPERATOR' ? (
              <CadastroEquipamento />
            ) : (
              <div className="notice" style={{ padding: 12 }}>
                <p>
                  Seu perfil é de <strong>Leitura</strong>. Somente <strong>Operadores</strong> e
                  <strong> Administradores</strong> podem cadastrar/alterar equipamentos.
                </p>
              </div>
            )}
          </section>
          
          <div className="section-divider" />
          
          <section className="list-section">
            <ListaEquipamentos 
              searchQuery={search.query} 
              searchField={search.field} 
            />
          </section>
        </main>
      </div>
      
      {/* UserSidebar agora flutuante à direita */}
      <UserSidebar />
    </div>
  );
}