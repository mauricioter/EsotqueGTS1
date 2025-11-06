'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InstallPWA from '../components/InstallPWA';
import './mobile.css';

interface Equipment {
  id: number;
  nome: string;
  status: string;
  serial?: string;
  localizacaoAtual?: string;
  qrCode?: string;
  instalacoes?: Array<{
    dataInstalacao: string;
    endereco?: string;
  }>;
}

export default function MobilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadEquipments();
    }
  }, [status, router, filter]);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      setError('');
      const url = filter === 'all' 
        ? '/api/mobile/equipamentos'
        : `/api/mobile/equipamentos?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setEquipments(data.equipamentos || []);
      } else {
        setError(data.error || 'Erro ao carregar equipamentos');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DISPONIVEL: '#4caf50',
      EM_USO: '#ff9800',
      EMPRESTADO: '#2196f3',
      MANUTENCAO: '#f44336',
      SAIDA: '#9c27b0',
      RESERVADO: '#00bcd4',
      DEFEITO: '#e91e63',
      INSTALADO: '#ff7a00'
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DISPONIVEL: 'Disponível',
      EM_USO: 'Em Uso',
      EMPRESTADO: 'Emprestado',
      MANUTENCAO: 'Manutenção',
      SAIDA: 'Saída',
      RESERVADO: 'Reservado',
      DEFEITO: 'Defeito',
      INSTALADO: 'Instalado'
    };
    return labels[status] || status;
  };

  const handleEquipmentClick = (equipmentId: number) => {
    router.push(`/mobile/instalacao/${equipmentId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="mobile-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <img src="/gtsnet-logo.png" alt="GTSnet" className="mobile-logo" />
          <div className="mobile-user-info">
            <span className="mobile-welcome">Olá, {session?.user?.name?.split(' ')[0]}</span>
            <span className="mobile-role">Técnico de Campo</span>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="mobile-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({equipments.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'DISPONIVEL' ? 'active' : ''}`}
          onClick={() => setFilter('DISPONIVEL')}
        >
          Disponível
        </button>
        <button 
          className={`filter-btn ${filter === 'EM_USO' ? 'active' : ''}`}
          onClick={() => setFilter('EM_USO')}
        >
          Em Uso
        </button>
        <button 
          className={`filter-btn ${filter === 'INSTALADO' ? 'active' : ''}`}
          onClick={() => setFilter('INSTALADO')}
        >
          Instalado
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mobile-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Equipment List */}
      <div className="mobile-content">
        {equipments.length === 0 ? (
          <div className="mobile-empty">
            <div className="empty-icon">📦</div>
            <h3>Nenhum equipamento</h3>
            <p>Você não possui equipamentos {filter !== 'all' ? `com status "${getStatusLabel(filter)}"` : 'atribuídos'}</p>
          </div>
        ) : (
          <div className="equipment-grid">
            {equipments.map((equip) => (
              <div 
                key={equip.id} 
                className="equipment-card"
                onClick={() => handleEquipmentClick(equip.id)}
              >
                <div className="equipment-header">
                  <h3>{equip.nome}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(equip.status) }}
                  >
                    {getStatusLabel(equip.status)}
                  </span>
                </div>
                
                {equip.serial && (
                  <div className="equipment-detail">
                    <span className="detail-label">Serial:</span>
                    <span className="detail-value">{equip.serial}</span>
                  </div>
                )}
                
                {equip.localizacaoAtual && (
                  <div className="equipment-detail">
                    <span className="detail-label">📍 Local:</span>
                    <span className="detail-value">{equip.localizacaoAtual}</span>
                  </div>
                )}
                
                {equip.instalacoes && equip.instalacoes.length > 0 && (
                  <div className="equipment-detail">
                    <span className="detail-label">Última instalação:</span>
                    <span className="detail-value">
                      {new Date(equip.instalacoes[0].dataInstalacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                <button className="action-btn">
                  {equip.status === 'DISPONIVEL' ? '📸 Registrar Instalação' : '👁️ Ver Detalhes'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        <button className="nav-btn active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Início</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/mobile/instalacoes')}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Histórico</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/dashboard')}>
          <span className="nav-icon">💻</span>
          <span className="nav-label">Desktop</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/api/auth/logout')}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sair</span>
        </button>
      </nav>

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
}
