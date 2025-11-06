'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import './ListaEquipamentos.css';

// Interface para o equipamento (compatível com a API Prisma)
interface Equipamento {
  id: string;
  nome: string;
  descricao?: string | null;
  serial?: string | null;
  mac?: string | null;
  status: string; // valores como 'DISPONIVEL', 'SAIDA', etc.
  dataEntrada: string;
  dataSaida?: string | null;
  destino?: string | null;
  tecnicoResponsavel?: string | null;
  assinaturaTecnico?: string | null;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Props do componente
interface ListaEquipamentosProps {
  searchQuery?: string;
  searchField?: string;
}

// Estado para o formulário de saída
interface ExitFormState {
  id?: string;
  destino: string;
  tecnicoResponsavel: string;
  assinaturaTecnico: string;
}

export default function ListaEquipamentos({ searchQuery = '', searchField = 'all' }: ListaEquipamentosProps) {
  const [items, setItems] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitForm, setExitForm] = useState<ExitFormState>({ 
    destino: '', 
    tecnicoResponsavel: '', 
    assinaturaTecnico: '' 
  });
  const [error, setError] = useState<string>('');

  // Carregar equipamentos da API
  const loadEquipamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get<Equipamento[]>('/equipamentos');
      setItems(data);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || error.response?.data?.message || 'Erro ao carregar equipamentos';
      setError(mensagemErro);
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito inicial e listener para atualizações
  useEffect(() => {
    loadEquipamentos();

    const handler = () => loadEquipamentos();
    window.addEventListener('equipamento:changed', handler);
    return () => window.removeEventListener('equipamento:changed', handler);
  }, [loadEquipamentos]);

  // Excluir equipamento
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    try {
      await api.delete(`/equipamentos/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      window.dispatchEvent(new Event('equipamento:changed'));
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || error.response?.data?.message || 'Erro ao excluir equipamento';
      alert(mensagemErro);
      console.error('Erro ao excluir equipamento:', error);
    }
  }, []);

  // Registrar saída do equipamento
  const handleRegisterSaida = useCallback(async (id: string) => {
    if (!exitForm.destino.trim() || exitForm.id !== id) {
      alert('Informe o destino da saída antes de confirmar');
      return;
    }

    if (!exitForm.tecnicoResponsavel.trim()) {
      alert('Informe o nome do técnico responsável');
      return;
    }

    if (!exitForm.assinaturaTecnico.trim()) {
      alert('Informe a assinatura/matrícula do técnico');
      return;
    }

    try {
      await api.put(`/equipamentos/${id}`, {
        destino: exitForm.destino.trim(),
        tecnicoResponsavel: exitForm.tecnicoResponsavel.trim(),
        assinaturaTecnico: exitForm.assinaturaTecnico.trim(),
        status: 'SAIDA',
        dataSaida: new Date().toISOString(),
      });

      setExitForm({ destino: '', tecnicoResponsavel: '', assinaturaTecnico: '' });
      loadEquipamentos();
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || error.response?.data?.message || 'Erro ao registrar saída';
      alert(mensagemErro);
      console.error('Erro ao registrar saída:', error);
    }
  }, [exitForm, loadEquipamentos]);

  // Formatar data/horário
  const formatarData = useCallback((dataString: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dataString));
    } catch {
      return dataString;
    }
  }, []);

  // Mapear status para classes CSS
  const getStatusClass = useCallback((status: string) => {
    const map: Record<string, string> = {
      DISPONIVEL: 'status-disponivel',
      SAIDA: 'status-saida',
      MANUTENCAO: 'status-manutencao',
      EM_USO: 'status-em-uso',
      EMPRESTADO: 'status-emprestado',
    };
    return map[status] || 'status-default';
  }, []);

  // Filtragem de itens
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      switch (searchField) {
        case 'nome':
          return item.nome.toLowerCase().includes(query);
        case 'serial':
          return (item.serial || '').toLowerCase().includes(query);
        case 'mac':
          return (item.mac || '').toLowerCase().includes(query);
        case 'destino':
          return (item.destino || '').toLowerCase().includes(query);
        case 'status':
          return item.status.toLowerCase().includes(query);
        default:
          return (
            item.nome.toLowerCase().includes(query) ||
            (item.serial || '').toLowerCase().includes(query) ||
            (item.mac || '').toLowerCase().includes(query) ||
            (item.destino || '').toLowerCase().includes(query) ||
            item.status.toLowerCase().includes(query)
          );
      }
    });
  }, [items, searchQuery, searchField]);

  // Estados de carregamento/erro
  if (loading) {
    return (
      <div className="lista-container">
        <header className="lista-header">
          <h2 className="lista-title">Equipamentos</h2>
          <div className="lista-subtitle">Carregando...</div>
        </header>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-container">
        <header className="lista-header">
          <h2 className="lista-title">Equipamentos</h2>
        </header>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="btn-retry" onClick={loadEquipamentos}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização da tabela
  return (
    <div className="lista-container">
      <header className="lista-header">
        <h2 className="lista-title">Equipamentos</h2>
        <p className="lista-subtitle">
          {filteredItems.length} de {items.length} equipamentos
          {searchQuery && ` (filtrando por: "${searchQuery}")`}
        </p>
      </header>

      <div className="table-wrapper">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Nenhum equipamento encontrado</h3>
            <p>
              {searchQuery ? 'Nenhum equipamento corresponde à sua busca.' : 'Nenhum equipamento cadastrado ainda.'}
            </p>
            {!searchQuery && (
              <p className="empty-suggestion">Cadastre seu primeiro equipamento usando o formulário ao lado.</p>
            )}
          </div>
        ) : (
          <table className="equipamentos-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Serial</th>
                <th>MAC</th>
                <th>Destino</th>
                <th>Técnico</th>
                <th>Status</th>
                <th>Entrada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className={item.status === 'SAIDA' ? 'row-saida' : ''}>
                  <td className="col-nome">{item.nome}</td>
                  <td className="col-serial">{item.serial || '—'}</td>
                  <td className="col-mac">{item.mac || '—'}</td>
                  <td className="col-destino">{item.destino || '—'}</td>
                  <td className="col-tecnico">
                    {item.tecnicoResponsavel ? (
                      <div style={{ fontSize: '13px' }}>
                        <div style={{ fontWeight: 600 }}>{item.tecnicoResponsavel}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                          {item.assinaturaTecnico && `Mat: ${item.assinaturaTecnico}`}
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="col-status">
                    <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="col-data">{formatarData(item.dataEntrada)}</td>
                  <td className="col-acoes">
                    <div className="acoes-container">
                      {exitForm.id === item.id ? (
                        <div className="exit-form-expanded">
                          <div className="exit-form-group">
                            <input
                              type="text"
                              value={exitForm.destino}
                              placeholder="Destino da saída"
                              onChange={e => setExitForm({ ...exitForm, destino: e.target.value })}
                              className="exit-form-input"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={exitForm.tecnicoResponsavel}
                              placeholder="Nome do técnico"
                              onChange={e => setExitForm({ ...exitForm, tecnicoResponsavel: e.target.value })}
                              className="exit-form-input"
                              style={{ marginTop: '8px' }}
                            />
                            <input
                              type="text"
                              value={exitForm.assinaturaTecnico}
                              placeholder="Matrícula/Assinatura do técnico"
                              onChange={e => setExitForm({ ...exitForm, assinaturaTecnico: e.target.value })}
                              className="exit-form-input"
                              style={{ marginTop: '8px' }}
                            />
                          </div>
                          <div className="exit-form-actions">
                            <button className="btn-primary btn-small" onClick={() => handleRegisterSaida(item.id)}>
                              Confirmar
                            </button>
                            <button className="btn-secondary btn-small" onClick={() => setExitForm({ destino: '', tecnicoResponsavel: '', assinaturaTecnico: '' })}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="acoes-botoes">
                          <button
                            className="btn-primary btn-small"
                            onClick={() => setExitForm({ 
                              id: item.id, 
                              destino: item.destino || '', 
                              tecnicoResponsavel: '', 
                              assinaturaTecnico: '' 
                            })}
                            disabled={item.status === 'SAIDA'}
                          >
                            Registrar Saída
                          </button>
                          <button className="btn-delete btn-small" onClick={() => handleDelete(item.id)}>
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}