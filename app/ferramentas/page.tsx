'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '../components/ToastProvider';
import './ferramentas.css';
import { TipoMovimentacao } from '@prisma/client';
 

interface Ferramenta {
  id: string;
  nome: string;
  categoria: string;
  quantidadeTotal: number;
  quantidadeEmUso: number;
  status: string;
  localizacaoAtual?: string;
  observacoes?: string;
  movimentacoes?: any[];
}

interface Movimentacao {
  id: string;
  tecnicoNome: string;
  tipoMovimentacao: string;
  quantidade: number;
  dataRetirada: string;
  dataPrevistaDevolucao?: string;
  dataDevolucaoReal?: string;
  motivo?: string;
  observacoes?: string;
  ferramenta: Ferramenta;
}

export default function FerramentasPage() {
  const { showToast } = useToast();
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLocalizacao, setFiltroLocalizacao] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [levadoCampo, setLevadoCampo] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTipo, setPdfTipo] = useState<'tecnico' | 'frota' | 'estoque' | ''>('');
  const [pdfTecnico, setPdfTecnico] = useState<string>('');
  const [pdfVeiculo, setPdfVeiculo] = useState<string>('');
  const [abaAtiva, setAbaAtiva] = useState<'ferramentas' | 'historico'>('ferramentas');

  // Modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [ferramentaEditando, setFerramentaEditando] = useState<Ferramenta | null>(null);

  // Modal de movimentação
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState<Ferramenta | null>(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<string>('EMPRESTIMO');
  const [modalCampoAberto, setModalCampoAberto] = useState(false);
  const [abertosCampo, setAbertosCampo] = useState<{tecnicoNome: string; ferramentaId: string; ferramenta: {id: string; nome: string}; saldo: number}[]>([]);
  const [modalUsoAberto, setModalUsoAberto] = useState(false);
  const [abertosUso, setAbertosUso] = useState<{tecnicoNome: string; ferramentaId: string; ferramenta: {id: string; nome: string}; saldo: number}[]>([]);
  const [modalPessoalAberto, setModalPessoalAberto] = useState(false);
  const [abertosPessoal, setAbertosPessoal] = useState<{tecnicoNome: string; ferramentaId: string; ferramenta: {id: string; nome: string}; saldo: number}[]>([]);
  const KIT_PADRAO = ['Martelo','Furadeira','Alicate','Trena','Lanterna','Chave Philips'];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    const h = setTimeout(() => setBuscaDebounced(busca), 250);
    return () => clearTimeout(h);
  }, [busca]);

  const carregarDados = async () => {
    try {
      const [resFerramentas, resMovimentacoes] = await Promise.all([
        fetch('/api/ferramentas'),
        fetch('/api/ferramentas/movimentar'),
      ]);

      const dataFerramentas = await resFerramentas.json();
      const dataMovimentacoes = await resMovimentacoes.json();

      setFerramentas(dataFerramentas.ferramentas || []);
      setMovimentacoes(dataMovimentacoes.movimentacoes || []);
      setLevadoCampo(
        typeof dataMovimentacoes.summaryAll?.emprestimosEmAbertoTotal === 'number'
          ? dataMovimentacoes.summaryAll.emprestimosEmAbertoTotal
          : null
      );
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}+/gu, '').toLowerCase();
  const ferramentasFiltradas = ferramentas.filter(f => {
    const termo = normalize(buscaDebounced.trim());
    const tokens = termo ? termo.split(/\s+/).filter(Boolean) : [];
    const alvo = [f.nome, f.localizacaoAtual || '', f.observacoes || ''].map(normalize).join(' ');
    const matchBusca = tokens.length === 0 || tokens.every(t => alvo.includes(t));
    const matchCategoria = !filtroCategoria || f.categoria === filtroCategoria;
    const matchStatus = !filtroStatus || f.status === filtroStatus;
    const matchLocalizacao = !filtroLocalizacao || (f.localizacaoAtual || '') === filtroLocalizacao;
    return matchBusca && matchCategoria && matchStatus && matchLocalizacao;
  });

  const compare = (a: any, b: any, field: string) => {
    let va: any = a[field];
    let vb: any = b[field];
    if (field === 'disponiveis') {
      va = (a.quantidadeTotal || 0) - (a.quantidadeEmUso || 0);
      vb = (b.quantidadeTotal || 0) - (b.quantidadeEmUso || 0);
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb);
    }
    return (va || 0) - (vb || 0);
  };

  const onSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const ferramentasOrdenadas = [...ferramentasFiltradas].sort((a, b) => {
    const r = compare(a, b, sortBy);
    return sortDir === 'asc' ? r : -r;
  });

  const totalItens = ferramentas.reduce((sum, f) => sum + (f.quantidadeTotal || 0), 0);
  const emUsoItens = ferramentas.reduce((sum, f) => sum + (f.quantidadeEmUso || 0), 0);
  const disponiveisItens = Math.max(0, totalItens - emUsoItens);
  const totalPages = Math.max(1, Math.ceil(ferramentasOrdenadas.length / pageSize));
  const start = (page - 1) * pageSize;
  const ferramentasPaginadas = ferramentasOrdenadas.slice(start, start + pageSize);

  const levadoParaCampoTotal = (typeof window !== 'undefined' && (window as any).__movResumoAll)
    ? (window as any).__movResumoAll
    : undefined;

  const gerarPDFFerramentas = (preview?: boolean) => {
    const doc = new jsPDF();
    const data = ferramentasOrdenadas.map(f => [
      f.nome,
      (f.categoria || '').replace('_', ' '),
      f.quantidadeTotal || 0,
      f.quantidadeEmUso || 0,
      (f.quantidadeTotal || 0) - (f.quantidadeEmUso || 0),
      (f.status || '').replace('_', ' '),
      f.localizacaoAtual || '-',
    ]);
    autoTable(doc, {
      head: [['Nome', 'Categoria', 'Total', 'Em Uso', 'Disponíveis', 'Status', 'Localização']],
      body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 14 },
    });
    if (preview) {
      doc.output('dataurlnewwindow');
    } else {
      doc.save('ferramentas.pdf');
    }
  };

  const gerarPDFChecklistTecnico = (tecnicoNome: string) => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(16);
    doc.text(`Checklist de Ferramentas - Técnico: ${tecnicoNome}`, 14, 18);
    doc.setFontSize(11);
    doc.text(`Data: ${dataAtual}`, 14, 26);
    autoTable(doc, {
      head: [['Ferramenta', 'Quantidade', 'Conferido']],
      body: KIT_PADRAO.map(item => [item, '', '[  ]']),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [249, 115, 22] },
      startY: 32,
    });
    const y = (doc as any).lastAutoTable.finalY || 32;
    doc.text('Assinatura do Técnico: ____________________________', 14, y + 16);
    doc.text('Responsável: ____________________________', 14, y + 24);
    doc.save(`checklist-tecnico-${tecnicoNome}.pdf`);
  };

  const FROTA_ITENS = ['Estepe', 'Triângulo', 'Macaco', 'Chave de roda', 'Luzes', 'Freios', 'Óleo', 'Água', 'Extintor'];

  const gerarPDFChecklistFrota = (veiculo: string) => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(16);
    doc.text(`Checklist da Frota - Veículo: ${veiculo}`, 14, 18);
    doc.setFontSize(11);
    doc.text(`Data: ${dataAtual}`, 14, 26);
    autoTable(doc, {
      head: [['Item', 'Condição', 'Conferido']],
      body: FROTA_ITENS.map(item => [item, '', '[  ]']),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [249, 115, 22] },
      startY: 32,
    });
    const y = (doc as any).lastAutoTable.finalY || 32;
    doc.text('Assinatura do Técnico: ____________________________', 14, y + 16);
    doc.text('Responsável: ____________________________', 14, y + 24);
    doc.save(`checklist-frota-${veiculo}.pdf`);
  };

  const tecnicosOptions = Array.from(new Set(movimentacoes.map(m => m.tecnicoNome))).filter(Boolean);
  const veiculosOptions = ['Carro 01 - ABC1D23', 'Carro 02 - EFG4H56', 'Carro 03 - IJK7L89'];

  const abrirModalCadastro = (ferramenta?: Ferramenta) => {
    setFerramentaEditando(ferramenta || null);
    setModalAberto(true);
  };

  const abrirModalMovimentacao = (ferramenta: Ferramenta) => {
    setFerramentaSelecionada(ferramenta);
    setModalMovimentacao(true);
  };

  const salvarFerramenta = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const dados = {
      id: ferramentaEditando?.id,
      nome: formData.get('nome'),
      categoria: formData.get('categoria'),
      quantidadeTotal: parseInt(formData.get('quantidadeTotal') as string),
      localizacaoAtual: formData.get('localizacaoAtual'),
      observacoes: formData.get('observacoes'),
    };

    try {
      const method = ferramentaEditando ? 'PUT' : 'POST';
      const res = await fetch('/api/ferramentas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (res.ok) {
        showToast(ferramentaEditando ? 'Ferramenta atualizada!' : 'Ferramenta cadastrada!', 'success');
        setModalAberto(false);
        carregarDados();
      } else {
        showToast('Erro ao salvar ferramenta', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao salvar ferramenta', 'error');
    }
  };

  const registrarMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    let tipoSelecionado = String(formData.get('tipoMovimentacao'));
    const quantidade = parseInt(String(formData.get('quantidade'))) || 1;
    const motivoOriginal = String(formData.get('motivo') || '');

    const dados = {
      ferramentaId: ferramentaSelecionada?.id,
      tecnicoNome: formData.get('tecnicoNome'),
      tipoMovimentacao: tipoSelecionado === 'LEVADO_PARA_CAMPO' ? 'EMPRESTIMO' : (tipoSelecionado === 'ENTREGA_PESSOAL' ? 'TRANSFERENCIA' : tipoSelecionado),
      quantidade,
      dataPrevistaDevolucao: formData.get('dataPrevistaDevolucao') || null,
      motivo: tipoSelecionado === 'LEVADO_PARA_CAMPO' ? 'LEVADO_PARA_CAMPO' : (tipoSelecionado === 'ENTREGA_PESSOAL' ? 'ENTREGA_PESSOAL' : motivoOriginal),
      observacoes: formData.get('observacoes'),
    } as any;

    try {
      const res = await fetch('/api/ferramentas/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const result = await res.json();

      if (res.ok) {
        showToast('Movimentação registrada!', 'success');
        setModalMovimentacao(false);
        carregarDados();
      } else {
        showToast(result.erro || 'Erro ao registrar movimentação', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao registrar movimentação', 'error');
    }
  };

  const abrirModalLevadoCampo = async () => {
    try {
      const res = await fetch('/api/ferramentas/movimentar?open=true&campo=true');
      const data = await res.json();
      if (res.ok) {
        setAbertosCampo(data.abertos || []);
        setModalCampoAberto(true);
      }
    } catch {}
  };

  const abrirModalEmUso = async () => {
    try {
      const res = await fetch('/api/ferramentas/movimentar?open=true');
      const data = await res.json();
      if (res.ok) {
        setAbertosUso(data.abertos || []);
        setModalUsoAberto(true);
      }
    } catch {}
  };

  const abrirModalEstoquePessoal = async () => {
    try {
      const res = await fetch('/api/ferramentas/movimentar?open=true&personal=true');
      const data = await res.json();
      if (res.ok) {
        setAbertosPessoal(data.abertos || []);
        setModalPessoalAberto(true);
      }
    } catch {}
  };

  const deletarFerramenta = async (id: string) => {
    if (!confirm('Deseja realmente deletar esta ferramenta?')) return;

    try {
      const res = await fetch(`/api/ferramentas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Ferramenta deletada!', 'success');
        carregarDados();
      }
    } catch (error) {
      showToast('Erro ao deletar ferramenta', 'error');
    }
  };

  const recalibrarFerramentas = async () => {
    try {
      const res = await fetch('/api/ferramentas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalibrar' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Recalibrado: ${data.atualizadas} ferramenta(s)`, 'success');
        carregarDados();
      } else {
        showToast(data.erro || 'Erro ao recalibrar ferramentas', 'error');
      }
    } catch (error) {
      showToast('Erro ao recalibrar ferramentas', 'error');
    }
  };

  const resetarFerramentas = async () => {
    try {
      const res = await fetch('/api/ferramentas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Histórico limpo (${data.movimentacoesRemovidas})`, 'success');
        carregarDados();
      } else {
        showToast(data.erro || 'Erro ao limpar histórico', 'error');
      }
    } catch (error) {
      showToast('Erro ao limpar histórico', 'error');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="ferramentas-container">
      <div className="ferramentas-header">
        <h1>🛠️ Controle de Ferramentas</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={resetarFerramentas} className="btn-secondary">
            Limpar Histórico
          </button>
          <button onClick={recalibrarFerramentas} className="btn-secondary">
            Recalibrar Status
          </button>
          <button onClick={() => setPdfModalOpen(true)} className="btn-primary" title="Gerar PDF">
            Gerar PDF
          </button>
          <button onClick={() => abrirModalCadastro()} className="btn-primary">
            + Nova Ferramenta
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="abas">
        <button
          className={`aba ${abaAtiva === 'ferramentas' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('ferramentas')}
        >
          Ferramentas ({ferramentas.length})
        </button>
        <button
          className={`aba ${abaAtiva === 'historico' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('historico')}
        >
          Historico ({movimentacoes.length})
        </button>
      </div>

      {/* Aba Ferramentas */}
      {abaAtiva === 'ferramentas' && (
        <>
          <div className="resumo-container">
            <div className="resumo-grid">
              <div className="resumo-card resumo-total">
                <div className="resumo-title">Total de Itens</div>
                <div className="resumo-number">{totalItens}</div>
                <div className="resumo-sub">{ferramentas.length} ferramenta(s)</div>
              </div>
              <div className="resumo-card resumo-em-uso" onClick={abrirModalEmUso} style={{ cursor: 'pointer' }}>
                <div className="resumo-title">Em posse do técnico</div>
                <div className="resumo-number">{emUsoItens}</div>
                <div className="resumo-sub">{ferramentas.filter(f => (f.quantidadeEmUso || 0) > 0).length} técnicos com itens</div>
              </div>
              <div className="resumo-card resumo-campo" onClick={abrirModalLevadoCampo} style={{ cursor: 'pointer' }}>
                <div className="resumo-title">Levado para campo</div>
                <div className="resumo-number">{levadoCampo ?? emUsoItens}</div>
                <div className="resumo-sub">em aberto (para instalar)</div>
              </div>
              <div className="resumo-card resumo-pessoal" onClick={abrirModalEstoquePessoal} style={{ cursor: 'pointer' }}>
                <div className="resumo-title">Estoque pessoal</div>
                <div className="resumo-number">—</div>
                <div className="resumo-sub">entregas para kit</div>
              </div>
              <div className="resumo-card resumo-disponiveis">
                <div className="resumo-title">Disponíveis</div>
                <div className="resumo-number">{disponiveisItens}</div>
                <div className="resumo-sub">{ferramentas.filter(f => (f.quantidadeTotal - f.quantidadeEmUso) > 0).length} com estoque</div>
              </div>
            </div>
          </div>
          {/* Filtros */}
          <div className="filtros">
            <div className="busca-wrapper">
              <span className="busca-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por nome, local ou observação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-busca"
              />
              {busca && (
                <button type="button" className="busca-clear" onClick={() => setBusca('')}>✕</button>
              )}
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todas as categorias</option>
              <option value="ELETRICA">Eletrica</option>
              <option value="FIBRA">Fibra</option>
              <option value="MEDICAO">Medicao</option>
              <option value="SEGURANCA">Seguranca</option>
              <option value="REDE">Rede</option>
              <option value="FERRAMENTAS_MANUAIS">Ferramentas Manuais</option>
              <option value="OUTROS">Outros</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos os status</option>
              <option value="DISPONIVEL">Disponivel</option>
              <option value="EM_USO">Em Uso</option>
              <option value="EM_MANUTENCAO">Em Manutencao</option>
              <option value="PERDIDA">Perdida</option>
            </select>
            <select
              value={filtroLocalizacao}
              onChange={(e) => setFiltroLocalizacao(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todas as localizações</option>
              {Array.from(new Set(ferramentas.map(f => f.localizacaoAtual || '')))
                .filter(loc => loc)
                .map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>
          </div>

          {pdfModalOpen && (
            <div className="modal-overlay" onClick={() => setPdfModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Gerar PDF</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (pdfTipo === 'tecnico') {
                    if (!pdfTecnico) return;
                    gerarPDFChecklistTecnico(pdfTecnico);
                  } else if (pdfTipo === 'frota') {
                    if (!pdfVeiculo) return;
                    gerarPDFChecklistFrota(pdfVeiculo);
                  } else if (pdfTipo === 'estoque') {
                    gerarPDFFerramentas(false);
                  }
                  setPdfModalOpen(false);
                }}>
                  <label>
                    Tipo de relatório
                    <select value={pdfTipo} onChange={e => setPdfTipo(e.target.value as any)} required>
                      <option value="">Selecione...</option>
                      <option value="tecnico">Checklist de Equipamentos dos Técnicos</option>
                      <option value="frota">Checklist da Frota de Carros</option>
                      <option value="estoque">Relatório Completo do Estoque</option>
                    </select>
                  </label>
                  {pdfTipo === 'tecnico' && (
                    <label>
                      Técnico
                      <select value={pdfTecnico} onChange={e => setPdfTecnico(e.target.value)} required>
                        <option value="">Selecione o técnico...</option>
                        {tecnicosOptions.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {pdfTipo === 'frota' && (
                    <label>
                      Veículo
                      <select value={pdfVeiculo} onChange={e => setPdfVeiculo(e.target.value)} required>
                        <option value="">Selecione o veículo...</option>
                        {veiculosOptions.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setPdfModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Gerar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="tabela-container tabela-elevada">
            <table className="tabela-ferramentas tabela-moderna">
              <thead>
                <tr>
                <th onClick={() => onSort('nome')} title="Ordenar por nome">Nome {sortBy === 'nome' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('categoria')} title="Ordenar por categoria">Categoria {sortBy === 'categoria' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('quantidadeTotal')} title="Ordenar por total">Total {sortBy === 'quantidadeTotal' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('quantidadeEmUso')} title="Ordenar por em uso">Em Uso {sortBy === 'quantidadeEmUso' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('disponiveis')} title="Ordenar por disponíveis">Disponíveis {sortBy === 'disponiveis' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('status')} title="Ordenar por status">Status {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => onSort('localizacaoAtual')} title="Ordenar por localização">Localização {sortBy === 'localizacaoAtual' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ferramentasPaginadas.map((f) => {
                  const disponiveis = f.quantidadeTotal - f.quantidadeEmUso;
                  return (
                    <tr key={f.id} className="linha-item">
                      <td><strong>{f.nome}</strong></td>
                      <td>{f.categoria.replace('_', ' ')}</td>
                      <td>{f.quantidadeTotal}</td>
                      <td>{f.quantidadeEmUso}</td>
                      <td className={disponiveis === 0 ? 'text-red' : 'text-green'}>
                        {disponiveis}
                      </td>
                      <td>
                        <span className={`badge badge-${f.status.toLowerCase().replace('_', '-')}`}>
                          {f.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{f.localizacaoAtual || '-'}</td>
                      <td className="acoes">
                        <button onClick={() => abrirModalMovimentacao(f)} className="btn-acao btn-movimentar" title="Movimentar">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M12 4v16"/></svg>
                        </button>
                        <button onClick={() => abrirModalCadastro(f)} className="btn-acao btn-editar" title="Editar">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                        </button>
                        <button onClick={() => deletarFerramenta(f.id)} className="btn-acao btn-deletar" title="Deletar">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination-bar">
              <div className="pagination-left">
                <button className="btn-icon" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} title="Anterior">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span className="pagination-info">Página {page} de {totalPages}</span>
                <button className="btn-icon" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} title="Próxima">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div className="pagination-right">
                <label className="pagination-select-label">
                  Itens por página
                  <div className="pagination-select-wrap">
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="select-filtro pagination-select">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="cards-ferramentas">
            {ferramentasPaginadas.map(f => {
              const disponiveis = f.quantidadeTotal - f.quantidadeEmUso;
              return (
                <div key={f.id} className="card-item">
                  <div className="card-header">
                    <div className="card-title">{f.nome}</div>
                    <span className={`badge badge-${f.status.toLowerCase().replace('_', '-')}`}>{f.status.replace('_', ' ')}</span>
                  </div>
                  <div className="card-body">
                    <div className="spec"><strong>Categoria:</strong> {f.categoria.replace('_', ' ')}</div>
                    <div className="spec"><strong>Total:</strong> {f.quantidadeTotal}</div>
                    <div className="spec"><strong>Em posse:</strong> {f.quantidadeEmUso}</div>
                    <div className="spec"><strong>Disponíveis:</strong> <span className={disponiveis === 0 ? 'text-red' : 'text-green'}>{disponiveis}</span></div>
                    <div className="spec"><strong>Localização:</strong> {f.localizacaoAtual || '-'}</div>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => abrirModalMovimentacao(f)} className="btn-acao btn-movimentar" title="Movimentar">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M12 4v16"/></svg>
                    </button>
                    <button onClick={() => abrirModalCadastro(f)} className="btn-acao btn-editar" title="Editar">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </button>
                    <button onClick={() => deletarFerramenta(f.id)} className="btn-acao btn-deletar" title="Deletar">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Aba Historico */}
      {abaAtiva === 'historico' && (
        <div className="historico-container">
          {movimentacoes.map((mov) => {
            const atrasado = mov.dataPrevistaDevolucao &&
              !mov.dataDevolucaoReal &&
              new Date(mov.dataPrevistaDevolucao) < new Date();

            return (
              <div key={mov.id} className={`card-movimentacao ${atrasado ? 'atrasado' : ''}`}>
                <div className="mov-header">
                  <span className={`badge badge-${mov.tipoMovimentacao.toLowerCase()}`}>
                    {mov.tipoMovimentacao}
                  </span>
                  {atrasado && <span className="badge badge-atrasado">ATRASADO</span>}
                </div>
                <div className="mov-body">
                  <p><strong>Ferramenta:</strong> {mov.ferramenta.nome}</p>
                  <p><strong>Tecnico:</strong> {mov.tecnicoNome}</p>
                  <p><strong>Quantidade:</strong> {mov.quantidade}</p>
                  <p><strong>Data retirada:</strong> {new Date(mov.dataRetirada).toLocaleString('pt-BR')}</p>
                  {mov.dataPrevistaDevolucao && (
                    <p><strong>Previsao devolucao:</strong> {new Date(mov.dataPrevistaDevolucao).toLocaleDateString('pt-BR')}</p>
                  )}
                  {mov.dataDevolucaoReal && (
                    <p><strong>Devolvido em:</strong> {new Date(mov.dataDevolucaoReal).toLocaleString('pt-BR')}</p>
                  )}
                  {mov.motivo && <p><strong>Motivo:</strong> {mov.motivo}</p>}
                  {mov.observacoes && <p><strong>Obs:</strong> {mov.observacoes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{ferramentaEditando ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h2>
            <form onSubmit={salvarFerramenta}>
              <label>
                Nome*
                <input
                  type="text"
                  name="nome"
                  defaultValue={ferramentaEditando?.nome}
                  required
                />
              </label>
              <label>
                Categoria*
                <select
                  name="categoria"
                  defaultValue={ferramentaEditando?.categoria}
                  required
                >
                  <option value="ELETRICA">Eletrica</option>
                  <option value="FIBRA">Fibra</option>
                  <option value="MEDICAO">Medicao</option>
                  <option value="SEGURANCA">Seguranca</option>
                  <option value="REDE">Rede</option>
                  <option value="FERRAMENTAS_MANUAIS">Ferramentas Manuais</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </label>
              <label>
                Quantidade Total*
                <input
                  type="number"
                  name="quantidadeTotal"
                  defaultValue={ferramentaEditando?.quantidadeTotal || 1}
                  min="1"
                  required
                />
              </label>
              <label>
                Localizacao Atual
                <input
                  type="text"
                  name="localizacaoAtual"
                  defaultValue={ferramentaEditando?.localizacaoAtual || 'Almoxarifado'}
                />
              </label>
              <label>
                Observacoes
                <textarea
                  name="observacoes"
                  defaultValue={ferramentaEditando?.observacoes}
                  rows={3}
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimentação */}
      {modalMovimentacao && ferramentaSelecionada && (
        <div className="modal-overlay" onClick={() => setModalMovimentacao(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Movimentar: {ferramentaSelecionada.nome}</h2>
            <p className="info-disponiveis">
              Disponiveis: <strong>{ferramentaSelecionada.quantidadeTotal - ferramentaSelecionada.quantidadeEmUso}</strong>
            </p>
            <form onSubmit={registrarMovimentacao}>
              <label>
                Tipo de Movimentacao*
                <select
                  name="tipoMovimentacao"
                  required
                  value={tipoMovimentacao}
                  onChange={e => setTipoMovimentacao(e.target.value)}
                >
                  <option value="EMPRESTIMO">Emprestimo</option>
                  <option value="LEVADO_PARA_CAMPO">Levado para campo</option>
                  <option value="ENTREGA_PESSOAL">Entrega para técnico (estoque pessoal)</option>
                  <option value="DEVOLUCAO">Devolucao</option>
                  <option value="MANUTENCAO">Manutencao</option>
                  <option value="PERDA">Perda</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select> 
              </label>
              <label>
                Nome do Tecnico*
                <input type="text" name="tecnicoNome" required />
              </label>
              <label>
                Quantidade*
                <input
                  type="number"
                  name="quantidade"
                  defaultValue="1"
                  min="1"
                  max={ferramentaSelecionada.quantidadeTotal - ferramentaSelecionada.quantidadeEmUso}
                  required
                />
              </label> 
              {tipoMovimentacao !== "PERDA" && tipoMovimentacao !== "TRANSFERENCIA" && (
            <label>
              Previsao de Devolucao
              <input type="date" name="dataPrevistaDevolucao" />
            </label>
          )}
              <label>
                Motivo
                <input type="text" name="motivo" placeholder="Ex: Instalacao, Manutencao..." />
              </label>
              <label>
                Observacoes
                <textarea name="observacoes" rows={2} />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModalMovimentacao(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalPessoalAberto && (
        <div className="modal-overlay" onClick={() => setModalPessoalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Estoque pessoal - por técnico</h2>
            {abertosPessoal.length === 0 ? (
              <p className="info-disponiveis">Nenhum item entregue</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {abertosPessoal.map((item, idx) => (
                  <div key={`${item.tecnicoNome}-${item.ferramentaId}-${idx}`} className="card-movimentacao">
                    <div className="mov-header">
                      <span className="badge badge-reservado">ESTOQUE PESSOAL</span>
                      <span className="badge">Qtd: {item.saldo}</span>
                    </div>
                    <div className="mov-body">
                      <p><strong>Técnico:</strong> {item.tecnicoNome}</p>
                      <p><strong>Ferramenta:</strong> {item.ferramenta.nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalPessoalAberto(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {modalUsoAberto && (
        <div className="modal-overlay" onClick={() => setModalUsoAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Em posse do técnico</h2>
            {abertosUso.length === 0 ? (
              <p className="info-disponiveis">Nenhum item em uso</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {abertosUso.map((item, idx) => (
                  <div key={`${item.tecnicoNome}-${item.ferramentaId}-${idx}`} className="card-movimentacao">
                    <div className="mov-header">
                      <span className="badge badge-em-uso">EM POSSE DO TÉCNICO</span>
                      <span className="badge">Qtd: {item.saldo}</span>
                    </div>
                    <div className="mov-body">
                      <p><strong>Técnico:</strong> {item.tecnicoNome}</p>
                      <p><strong>Ferramenta:</strong> {item.ferramenta.nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalUsoAberto(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Levado para Campo */}
      {modalCampoAberto && (
        <div className="modal-overlay" onClick={() => setModalCampoAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Levado para campo - por técnico</h2>
            {abertosCampo.length === 0 ? (
              <p className="info-disponiveis">Nenhum item em aberto</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {abertosCampo.map((item, idx) => (
                  <div key={`${item.tecnicoNome}-${item.ferramentaId}-${idx}`} className="card-movimentacao">
                    <div className="mov-header">
                      <span className="badge badge-emprestimo">EMPRESTIMO</span>
                      <span className="badge">Qtd: {item.saldo}</span>
                    </div>
                    <div className="mov-body">
                      <p><strong>Técnico:</strong> {item.tecnicoNome}</p>
                      <p><strong>Ferramenta:</strong> {item.ferramenta.nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalCampoAberto(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
