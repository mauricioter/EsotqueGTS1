'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './equipamentos-new.css';

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  mac?: string;
  status: string;
  localizacao?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EquipamentosPageNew() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    marca: '',
    modelo: '',
    serial: '',
    mac: '',
    status: 'DISPONIVEL',
    localizacao: '',
    observacoes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadEquipamentos();
    }
  }, [status, router]);

  const loadEquipamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipamentos');
      const data = await response.json();
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEquipamento 
        ? `/api/equipamentos/${editingEquipamento.id}`
        : '/api/equipamentos';
      
      const method = editingEquipamento ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadEquipamentos();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar equipamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar equipamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este equipamento?')) return;
    
    try {
      const response = await fetch(`/api/equipamentos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadEquipamentos();
      } else {
        alert('Erro ao excluir equipamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir equipamento');
    }
  };

  const handleEdit = (equipamento: Equipamento) => {
    setEditingEquipamento(equipamento);
    setFormData({
      nome: equipamento.nome,
      tipo: equipamento.tipo,
      marca: equipamento.marca,
      modelo: equipamento.modelo,
      serial: equipamento.serial,
      mac: equipamento.mac || '',
      status: equipamento.status,
      localizacao: equipamento.localizacao || '',
      observacoes: equipamento.observacoes || '',
    });
    setShowModal(true);
  };

  const handleNewEquipamento = () => {
    setEditingEquipamento(null);
    setFormData({
      nome: '',
      tipo: '',
      marca: '',
      modelo: '',
      serial: '',
      mac: '',
      status: 'DISPONIVEL',
      localizacao: '',
      observacoes: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEquipamento(null);
    setFormData({
      nome: '',
      tipo: '',
      marca: '',
      modelo: '',
      serial: '',
      mac: '',
      status: 'DISPONIVEL',
      localizacao: '',
      observacoes: '',
    });
  };

  const filteredEquipamentos = equipamentos.filter(eq => {
    const matchesSearch = 
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: string; label: string; className: string }> = {
      DISPONIVEL: { icon: '✅', label: 'Disponível', className: 'status-disponivel' },
        EM_POSSE_DO_TECNICO: { icon: '�', label: 'Em Posse do Técnico', className: 'status-em-posse' },
      DESCARTADO: { icon: '🗑️', label: 'Descartado', className: 'status-descartado' },
      SAIDA: { icon: '📤', label: 'Saída', className: 'status-saida' },
      RESERVADO: { icon: '📋', label: 'Reservado', className: 'status-reservado' },
      DEFEITO: { icon: '❌', label: 'Com Defeito', className: 'status-defeito' },
        INSTALADO: { icon: '✅', label: 'Instalado', className: 'status-instalado' },
    };

    const badge = badges[status] || badges.DISPONIVEL;
    return (
      <span className={`status-badge ${badge.className}`}>
        <span className="status-icon">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!session) return null;

  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

  return (
    <div className="equipamentos-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <Link href="/home" className="back-button">
              ← Voltar
            </Link>
            <h1>Gerenciar Equipamentos</h1>
          </div>
          <div className="header-right">
            <span className="user-name">{session.user?.name}</span>
            {(role === 'ADMIN' || role === 'OPERATOR') && (
              <button onClick={handleNewEquipamento} className="btn-primary">
                ➕ Novo Equipamento
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome, serial, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos</option>
              <option value="DISPONIVEL">✅ Disponível</option>
                <option value="EM_POSSE_DO_TECNICO">� Em Posse do Técnico</option>
                <option value="INSTALADO">✅ Instalado</option>
              <option value="DESCARTADO">🗑️ Descartado</option>
              <option value="SAIDA">📤 Saída</option>
              <option value="RESERVADO">📋 Reservado</option>
              <option value="DEFEITO">❌ Com Defeito</option>
            </select>
          </div>

          <div className="results-count">
            <span>{filteredEquipamentos.length} equipamento(s) encontrado(s)</span>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="equipamentos-grid">
        {filteredEquipamentos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Nenhum equipamento encontrado</h3>
            <p>
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando um novo equipamento'}
            </p>
            {(role === 'ADMIN' || role === 'OPERATOR') && (
              <button onClick={handleNewEquipamento} className="btn-primary">
                ➕ Cadastrar Equipamento
              </button>
            )}
          </div>
        ) : (
          filteredEquipamentos.map((equipamento) => (
            <div key={equipamento.id} className="equipment-card">
              <div className="card-header">
                <h3>{equipamento.nome}</h3>
                {getStatusBadge(equipamento.status)}
              </div>

              <div className="card-body">
                <div className="card-info">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{equipamento.tipo}</span>
                </div>
                <div className="card-info">
                  <span className="info-label">Marca:</span>
                  <span className="info-value">{equipamento.marca}</span>
                </div>
                <div className="card-info">
                  <span className="info-label">Modelo:</span>
                  <span className="info-value">{equipamento.modelo}</span>
                </div>
                <div className="card-info">
                  <span className="info-label">Serial:</span>
                  <span className="info-value serial">{equipamento.serial}</span>
                </div>
                {equipamento.mac && (
                  <div className="card-info">
                    <span className="info-label">MAC:</span>
                    <span className="info-value">{equipamento.mac}</span>
                  </div>
                )}
                {equipamento.localizacao && (
                  <div className="card-info">
                    <span className="info-label">Localização:</span>
                    <span className="info-value">{equipamento.localizacao}</span>
                  </div>
                )}
              </div>

              {(role === 'ADMIN' || role === 'OPERATOR') && (
                <div className="card-actions">
                  <button 
                    onClick={() => handleEdit(equipamento)} 
                    className="btn-edit"
                    title="Editar"
                  >
                    ✏️ Editar
                  </button>
                  {role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDelete(equipamento.id)} 
                      className="btn-delete"
                      title="Excluir"
                    >
                      🗑️ Excluir
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEquipamento ? '✏️ Editar Equipamento' : '➕ Novo Equipamento'}</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Roteador TP-Link"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    <option value="Roteador">Roteador</option>
                    <option value="Switch">Switch</option>
                    <option value="ONU">ONU</option>
                    <option value="Access Point">Access Point</option>
                    <option value="Modem">Modem</option>
                    <option value="Servidor">Servidor</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ex: TP-Link"
                  />
                </div>

                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ex: TL-WR841N"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Serial *</label>
                  <input
                    type="text"
                    required
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    placeholder="Ex: ABC123456789"
                  />
                </div>

                <div className="form-group">
                  <label>MAC</label>
                  <input
                    type="text"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DISPONIVEL">✅ Disponível</option>
                      <option value="EM_POSSE_DO_TECNICO">� Em Posse do Técnico</option>
                    <option value="DESCARTADO">🗑️ Descartado</option>
                    <option value="SAIDA">📤 Saída</option>
                    <option value="RESERVADO">📋 Reservado</option>
                    <option value="DEFEITO">❌ Com Defeito</option>
                      <option value="INSTALADO">✅ Instalado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Localização</label>
                  <input
                    type="text"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    placeholder="Ex: Estoque - Prateleira A"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEquipamento ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
