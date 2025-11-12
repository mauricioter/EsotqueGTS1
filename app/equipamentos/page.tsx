'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import { gerarRelatorioPDF } from '@/lib/pdfGenerator';
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
  dataEntrada: string;
  createdAt: string;
  updatedAt: string;
}

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function EquipamentosPageNew() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tipoFilter, setTipoFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

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

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadEquipamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipamentos');
      const data = await response.json();
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      showToast('Erro ao carregar equipamentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Salvando equipamento:', formData);
    console.log('Editando?', editingEquipamento ? 'Sim' : 'Não');
    
    try {
      const url = editingEquipamento 
        ? `/api/equipamentos/${editingEquipamento.id}`
        : '/api/equipamentos';
      
      const method = editingEquipamento ? 'PUT' : 'POST';
      
      console.log('URL:', url, 'Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Equipamento salvo com sucesso:', data);
        await loadEquipamentos();
        handleCloseModal();
        showToast(
          editingEquipamento 
            ? 'Equipamento atualizado com sucesso!' 
            : 'Equipamento cadastrado com sucesso!',
          'success'
        );
      } else {
        const error = await response.json();
        console.error('Erro da API:', error);
        showToast(error.error || 'Erro ao salvar equipamento', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao salvar equipamento: ' + error, 'error');
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
        showToast('Equipamento excluído com sucesso!', 'success');
      } else {
        showToast('Erro ao excluir equipamento', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao excluir equipamento', 'error');
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

  const handleGerarRelatorio = async () => {
    try {
      showToast('Gerando relatório PDF...', 'info');
      
      // Calcular estatísticas
      const stats = {
        total: equipamentos.length,
        disponiveis: equipamentos.filter(e => e.status === 'DISPONIVEL').length,
        emUso: equipamentos.filter(e => e.status === 'EM_USO' || e.status === 'EM_POSSE_DO_TECNICO').length,
        manutencao: equipamentos.filter(e => e.status === 'MANUTENCAO').length,
        saida: equipamentos.filter(e => e.status === 'SAIDA').length,
        reservado: equipamentos.filter(e => e.status === 'RESERVADO').length,
        defeito: equipamentos.filter(e => e.status === 'DEFEITO').length,
        emprestado: equipamentos.filter(e => e.status === 'EMPRESTADO').length,
        instalado: equipamentos.filter(e => e.status === 'INSTALADO').length,
        retorno: equipamentos.filter(e => e.status === 'EQUIPAMENTO_DE_RETORNO').length,
      };
      
      // Gerar PDF
      gerarRelatorioPDF(equipamentos, stats);
      
      showToast('Relatório PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showToast('Erro ao gerar relatório PDF', 'error');
    }
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
    const matchesTipo = tipoFilter === 'ALL' || eq.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Obter lista de tipos únicos dos equipamentos
  const tiposUnicos = Array.from(new Set(equipamentos.map(eq => eq.tipo).filter(Boolean))).sort();

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: React.ReactElement; label: string; className: string }> = {
      DISPONIVEL: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
        label: 'Disponível', 
        className: 'status-disponivel' 
      },
      EM_POSSE_DO_TECNICO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
        label: 'Em Posse do Técnico', 
        className: 'status-em-posse' 
      },
      DESCARTADO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
        label: 'Descartado', 
        className: 'status-descartado' 
      },
      SAIDA: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
        label: 'Saída', 
        className: 'status-saida' 
      },
      RESERVADO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
        label: 'Reservado', 
        className: 'status-reservado' 
      },
      DEFEITO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
        label: 'Com Defeito', 
        className: 'status-defeito' 
      },
      INSTALADO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
        label: 'Instalado', 
        className: 'status-instalado' 
      },
      EQUIPAMENTO_DE_RETORNO: { 
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>,
        label: 'Equipamento de Retorno', 
        className: 'status-equipamento_de_retorno' 
      },
    };

    const badge = badges[status] || badges.DISPONIVEL;
    return (
      <span className={`status-badge ${badge.className}`}>
        <span className="status-icon">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const handleDownloadModelo = async () => {
    try {
      const response = await fetch('/api/equipamentos/import');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelo_importacao_equipamentos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Modelo de planilha baixado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      showToast('Erro ao baixar modelo de planilha', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportErrors([]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      showToast('Selecione um arquivo para importar', 'warning');
      return;
    }

    setImporting(true);
    setImportErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/equipamentos/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        setShowImportModal(false);
        setImportFile(null);
        setImportErrors([]);
        await loadEquipamentos();
      } else {
        setImportErrors(data.errors || []);
        showToast(data.message || 'Erro ao importar equipamentos. Verifique os erros abaixo.', 'error');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      showToast('Erro ao importar equipamentos', 'error');
    } finally {
      setImporting(false);
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

  if (!session) return null;

  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

  return (
    <div className="equipamentos-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <Link href="/home" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </Link>
            <div className="header-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <h1>Gerenciar Equipamentos</h1>
            </div>
          </div>
          <div className="header-right">
            <span className="user-name">{session.user?.name}</span>
            {(role === 'ADMIN' || role === 'OPERATOR') && (
              <>
                <button onClick={() => setShowImportModal(true)} className="btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Importar Planilha
                </button>
                <button onClick={handleNewEquipamento} className="btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Novo Equipamento
                </button>
                <button onClick={handleGerarRelatorio} className="btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Gerar Relatório PDF
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, serial, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Status:
            </label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_POSSE_DO_TECNICO">Em Posse do Técnico</option>
              <option value="INSTALADO">Instalado</option>
              <option value="DESCARTADO">Descartado</option>
              <option value="SAIDA">Saída</option>
              <option value="RESERVADO">Reservado</option>
              <option value="DEFEITO">Com Defeito</option>
              <option value="EQUIPAMENTO_DE_RETORNO">Equipamento de Retorno</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Tipo:
            </label>
            <select 
              value={tipoFilter} 
              onChange={(e) => setTipoFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos os tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
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
            <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <h3>Nenhum equipamento encontrado</h3>
            <p>
              {searchTerm || statusFilter !== 'ALL' || tipoFilter !== 'ALL'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando um novo equipamento'}
            </p>
            {(role === 'ADMIN' || role === 'OPERATOR') && (
              <button onClick={handleNewEquipamento} className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Cadastrar Equipamento
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                  {role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDelete(equipamento.id)} 
                      className="btn-delete"
                      title="Excluir"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                      Excluir
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
              <h2>
                {editingEquipamento ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar Equipamento
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Novo Equipamento
                  </>
                )}
              </h2>
              <button onClick={handleCloseModal} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
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
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EM_POSSE_DO_TECNICO">Em Posse do Técnico</option>
                    <option value="DESCARTADO">Descartado</option>
                    <option value="SAIDA">Saída</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="DEFEITO">Com Defeito</option>
                    <option value="INSTALADO">Instalado</option>
                    <option value="EQUIPAMENTO_DE_RETORNO">Equipamento de Retorno</option>
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

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content modal-import" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Importar Equipamentos em Massa
              </h2>
              <button onClick={() => setShowImportModal(false)} className="btn-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="import-instructions">
              <div className="instruction-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h3>Baixe o modelo de planilha</h3>
                  <p>Use nossa planilha modelo com os campos corretos</p>
                  <button onClick={handleDownloadModelo} className="btn-download">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Baixar Modelo Excel
                  </button>
                </div>
              </div>

              <div className="instruction-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h3>Preencha os dados</h3>
                  <p>Complete a planilha com os dados dos equipamentos</p>
                  <ul className="campo-lista">
                    <li><strong>nome</strong> - Nome do equipamento (obrigatório)</li>
                    <li><strong>tipo</strong> - Tipo do equipamento (ex: Roteador, Switch)</li>
                    <li><strong>marca</strong> - Marca do fabricante</li>
                    <li><strong>modelo</strong> - Modelo do equipamento</li>
                    <li><strong>serial</strong> - Número de série (único)</li>
                    <li><strong>mac</strong> - Endereço MAC (único)</li>
                    <li><strong>status</strong> - Status (disponivel, instalado, etc)</li>
                    <li><strong>localizacaoAtual</strong> - Localização física</li>
                  </ul>
                </div>
              </div>

              <div className="instruction-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h3>Faça upload da planilha</h3>
                  <p>Selecione o arquivo Excel (.xlsx) ou CSV preenchido</p>
                  
                  <div className="file-upload-area">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportFile}
                      id="import-file"
                      className="file-input"
                    />
                    <label htmlFor="import-file" className="file-label">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                      {importFile ? (
                        <>
                          <span className="file-name">{importFile.name}</span>
                          <span className="file-size">
                            {(importFile.size / 1024).toFixed(2)} KB
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Clique para selecionar ou arraste aqui</span>
                          <span className="file-formats">Excel (.xlsx, .xls) ou CSV</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {importErrors.length > 0 && (
              <div className="import-errors">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Erros encontrados ({importErrors.length})
                </h3>
                <div className="errors-list">
                  {importErrors.map((erro, index) => (
                    <div key={index} className="error-item">
                      <span className="error-linha">Linha {erro.linha}</span>
                      <span className="error-campo">{erro.campo}</span>
                      <span className="error-mensagem">{erro.mensagem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowImportModal(false)} 
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleImport}
                disabled={!importFile || importing}
                className="btn-primary"
              >
                {importing ? (
                  <>
                    <span className="spinner-small"></span>
                    Importando...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Importar Equipamentos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <Footer />
    </div>
  );
}
