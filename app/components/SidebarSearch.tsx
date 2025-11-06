'use client';

import React, { useState, useCallback, useEffect } from 'react';
import './SidebarSearch.css';

interface Props {
  onSearch: (query: string, field: string) => void;
}

// Campos de busca disponíveis
const SEARCH_FIELDS = [
  { value: 'all', label: 'Todos os campos' },
  { value: 'nome', label: 'Nome' },
  { value: 'serial', label: 'Número de Série' },
  { value: 'mac', label: 'Endereço MAC' },
  { value: 'destino', label: 'Local de Destino' },
  { value: 'status', label: 'Status' }
] as const;

// Dicas de busca por campo
const SEARCH_TIPS: Record<string, string> = {
  all: 'Pesquise por qualquer informação do equipamento',
  nome: 'Digite parte do nome do equipamento',
  serial: 'Digite parte do número de série',
  mac: 'Digite parte do endereço MAC (ex: A1:B2)',
  destino: 'Digite parte do local de destino',
  status: 'Pesquise por: disponivel, saida, manutencao, reservado'
};

export default function SidebarSearch({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Função para realizar a busca com debounce
  const performSearch = useCallback((searchQuery: string, searchField: string) => {
    setIsSearching(true);
    onSearch(searchQuery.trim(), searchField);
    
    // Simular pequeno delay para feedback visual
    setTimeout(() => setIsSearching(false), 300);
  }, [onSearch]);

  // Função para lidar com submit do formulário
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(query, field);
  }, [query, field, performSearch]);

  // Função para limpar a busca
  const handleClear = useCallback(() => {
    setQuery('');
    setField('all');
    performSearch('', 'all');
  }, [performSearch]);

  // Função para lidar com mudança no campo de busca
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Busca automática após o usuário digitar (com debounce)
    const timeoutId = setTimeout(() => {
      if (newQuery !== query) {
        performSearch(newQuery, field);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [field, performSearch, query]);

  // Função para lidar com mudança no campo de filtro
  const handleFieldChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value;
    setField(newField);
    performSearch(query, newField);
  }, [query, performSearch]);

  // Buscar ao montar o componente
  useEffect(() => {
    performSearch('', 'all');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Obter dica atual baseada no campo selecionado
  const currentTip = SEARCH_TIPS[field] || SEARCH_TIPS.all;

  // Verificar se há busca ativa
  const hasActiveSearch = query.trim() !== '' || field !== 'all';

  return (
    <aside className="sidebar-search">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Pesquisar Equipamentos</h3>
        <p className="sidebar-subtitle">Encontre equipamentos rapidamente</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="search-query" className="form-label">
            Termo de busca
          </label>
          <div className="search-input-container">
            <input
              id="search-query"
              type="text"
              className="search-input"
              placeholder="Digite para buscar..."
              value={query}
              onChange={handleQueryChange}
              disabled={isSearching}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                title="Limpar busca"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="search-field" className="form-label">
            Buscar por
          </label>
          <select
            id="search-field"
            className="search-select"
            value={field}
            onChange={handleFieldChange}
            disabled={isSearching}
          >
            {SEARCH_FIELDS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="search-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClear}
            disabled={!hasActiveSearch || isSearching}
          >
            Limpar
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="spinner"></span>
                Buscando...
              </>
            ) : (
              'Pesquisar'
            )}
          </button>
        </div>

        <div className="search-info">
          <p className="search-tip">{currentTip}</p>
          
          {hasActiveSearch && (
            <div className="search-stats">
              <span className="search-active-indicator">🔍</span>
              <span className="search-stats-text">Busca ativa</span>
            </div>
          )}
        </div>
      </form>

      {/* Indicador de busca automática */}
      {query && (
        <div className="auto-search-indicator">
          <span className="auto-search-text">Buscando automaticamente...</span>
        </div>
      )}
    </aside>
  );
}
