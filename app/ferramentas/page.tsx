'use client';

import { useState, useEffect } from 'react';
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
  const [abaAtiva, setAbaAtiva] = useState<'ferramentas' | 'historico'>('ferramentas');

  // Modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [ferramentaEditando, setFerramentaEditando] = useState<Ferramenta | null>(null);

  // Modal de movimentação
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState<Ferramenta | null>(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacao>('EMPRESTIMO');

  useEffect(() => {
    carregarDados();
  }, []);

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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ferramentasFiltradas = ferramentas.filter(f => {
    // Busca dinâmica em múltiplos campos
    const termo = busca.toLowerCase();
    const matchBusca =
      f.nome.toLowerCase().includes(termo) ||
      (f.localizacaoAtual || '').toLowerCase().includes(termo) ||
      (f.observacoes || '').toLowerCase().includes(termo);
    const matchCategoria = !filtroCategoria || f.categoria === filtroCategoria;
    const matchStatus = !filtroStatus || f.status === filtroStatus;
    const matchLocalizacao = !filtroLocalizacao || (f.localizacaoAtual || '') === filtroLocalizacao;
    return matchBusca && matchCategoria && matchStatus && matchLocalizacao;
  });

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

    const dados = {
      ferramentaId: ferramentaSelecionada?.id,
      tecnicoNome: formData.get('tecnicoNome'),
      tipoMovimentacao: formData.get('tipoMovimentacao'),
      quantidade: parseInt(formData.get('quantidade') as string) || 1,
      dataPrevistaDevolucao: formData.get('dataPrevistaDevolucao') || null,
      motivo: formData.get('motivo'),
      observacoes: formData.get('observacoes'),
    };

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

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="ferramentas-container">
      <div className="ferramentas-header">
        <h1>🛠️ Controle de Ferramentas</h1>
        <button onClick={() => abrirModalCadastro()} className="btn-primary">
          + Nova Ferramenta
        </button>
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
          {/* Filtros */}
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por nome, local ou observação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-busca"
            />
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

          {/* Tabela */}
          <div className="tabela-container">
            <table className="tabela-ferramentas">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Total</th>
                  <th>Em Uso</th>
                  <th>Disponiveis</th>
                  <th>Status</th>
                  <th>Localizacao</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {ferramentasFiltradas.map((f) => {
                  const disponiveis = f.quantidadeTotal - f.quantidadeEmUso;
                  return (
                    <tr key={f.id}>
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
                        <button
                          onClick={() => abrirModalMovimentacao(f)}
                          className="btn-acao btn-movimentar"
                          title="Movimentar"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => abrirModalCadastro(f)}
                          className="btn-acao btn-editar"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletarFerramenta(f.id)}
                          className="btn-acao btn-deletar"
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                  onChange={e => setTipoMovimentacao(e.target.value as TipoMovimentacao)}
                >
                  <option value="EMPRESTIMO">Emprestimo</option>
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
                  max={ferramentaSelecionada.quantidadeTotal}
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
    </div>
  );
}
