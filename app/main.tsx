'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn, signOut } from 'next-auth/react';
import CadastroEquipamento from './components/CadastroEquipamento';
import ListaEquipamentos from './components/ListaEquipamentos';
import SidebarSearch from './components/SidebarSearch';
import UserSidebar from './components/UserSidebar';
import './animations.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Swipe gesture handler
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    // Close sidebar on left swipe
    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleSearch = (query: string, field: string) => {
    setSearch({ query, field });
  };

  if (!mounted || authStatus === 'loading') {
    return (
      <div className="loading-container animate-fade-in">
        <div className="loading-spinner">
          <div className="spinner animate-spin"></div>
          <p className="animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar botão para login
  if (!session) {
    return (
      <div className="loading-container animate-fade-in">
        <div className="loading-spinner">
          <p style={{ marginBottom: '1rem' }}>Faça login para continuar</p>
          <button
            className="btn-primary hover-lift"
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

  type SessionRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';
  const role = (session as { role?: SessionRole } | null)?.role;

  return (
    <div className="app-container" suppressHydrationWarning>
      <header className="app-header">
        <div className="app-nav container">
            <button 
              className="hamburger-menu" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
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
        <aside 
          className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button 
            className="sidebar-close" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          <SidebarSearch onSearch={handleSearch} />
        </aside>
        
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}        <main className="main-content">
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