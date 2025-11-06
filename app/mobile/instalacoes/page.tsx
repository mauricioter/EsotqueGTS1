'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../mobile.css';
import './historico.css';

interface Instalacao {
  id: number;
  dataInstalacao: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  fotoEquipamento: string;
  fotoSerial: string;
  fotoLocal: string;
  nomeCliente: string;
  observacoes?: string;
  equipamento: {
    nome: string;
    serial?: string;
  };
}

export default function InstalacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instalacoes, setInstalacoes] = useState<Instalacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInstalacao, setSelectedInstalacao] = useState<Instalacao | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadInstalacoes();
    }
  }, [status, router]);

  const loadInstalacoes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/mobile/instalacoes');
      const data = await response.json();
      
      if (response.ok) {
        setInstalacoes(data.instalacoes || []);
      } else {
        setError(data.error || 'Erro ao carregar instalações');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <button className="back-btn" onClick={() => router.push('/mobile')}>
          ← Voltar
        </button>
        <h1>Histórico de Instalações</h1>
      </header>

      {/* Error */}
      {error && (
        <div className="mobile-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Content */}
      <div className="mobile-content">
        {instalacoes.length === 0 ? (
          <div className="mobile-empty">
            <div className="empty-icon">📋</div>
            <h3>Nenhuma instalação</h3>
            <p>Você ainda não registrou nenhuma instalação</p>
          </div>
        ) : (
          <div className="instalacoes-list">
            {instalacoes.map((inst) => (
              <div 
                key={inst.id} 
                className="instalacao-card"
                onClick={() => setSelectedInstalacao(inst)}
              >
                <div className="instalacao-header">
                  <h3>{inst.equipamento.nome}</h3>
                  <span className="instalacao-date">
                    {formatDate(inst.dataInstalacao)}
                  </span>
                </div>

                {inst.equipamento.serial && (
                  <p className="instalacao-serial">Serial: {inst.equipamento.serial}</p>
                )}

                <p className="instalacao-client">
                  👤 Cliente: {inst.nomeCliente}
                </p>

                {inst.endereco && (
                  <p className="instalacao-address">
                    📍 {inst.endereco}
                  </p>
                )}

                {inst.latitude && inst.longitude && (
                  <p className="instalacao-gps">
                    🌍 GPS: {inst.latitude.toFixed(6)}, {inst.longitude.toFixed(6)}
                  </p>
                )}

                <div className="instalacao-photos">
                  <img src={inst.fotoEquipamento} alt="Equipamento" />
                  <img src={inst.fotoSerial} alt="Serial" />
                  <img src={inst.fotoLocal} alt="Local" />
                </div>

                {inst.observacoes && (
                  <p className="instalacao-obs">
                    💬 {inst.observacoes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedInstalacao && (
        <div className="modal-overlay" onClick={() => setSelectedInstalacao(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedInstalacao(null)}>
              ✕
            </button>

            <h2>{selectedInstalacao.equipamento.nome}</h2>
            <p className="modal-date">{formatDate(selectedInstalacao.dataInstalacao)}</p>

            <div className="modal-section">
              <h3>📋 Informações</h3>
              <p><strong>Cliente:</strong> {selectedInstalacao.nomeCliente}</p>
              {selectedInstalacao.equipamento.serial && (
                <p><strong>Serial:</strong> {selectedInstalacao.equipamento.serial}</p>
              )}
              {selectedInstalacao.endereco && (
                <p><strong>Endereço:</strong> {selectedInstalacao.endereco}</p>
              )}
              {selectedInstalacao.latitude && selectedInstalacao.longitude && (
                <p>
                  <strong>GPS:</strong> {selectedInstalacao.latitude.toFixed(6)}, {selectedInstalacao.longitude.toFixed(6)}
                </p>
              )}
              {selectedInstalacao.observacoes && (
                <p><strong>Observações:</strong> {selectedInstalacao.observacoes}</p>
              )}
            </div>

            <div className="modal-section">
              <h3>📸 Fotos</h3>
              <div className="modal-photos">
                <div className="modal-photo-item">
                  <img src={selectedInstalacao.fotoEquipamento} alt="Equipamento" />
                  <span>Equipamento</span>
                </div>
                <div className="modal-photo-item">
                  <img src={selectedInstalacao.fotoSerial} alt="Serial" />
                  <span>Número Serial</span>
                </div>
                <div className="modal-photo-item">
                  <img src={selectedInstalacao.fotoLocal} alt="Local" />
                  <span>Local Instalado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        <button className="nav-btn" onClick={() => router.push('/mobile')}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Início</span>
        </button>
        <button className="nav-btn active">
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
    </div>
  );
}
