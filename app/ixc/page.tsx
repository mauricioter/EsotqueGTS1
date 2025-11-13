'use client';

import { useState } from 'react';
import './ixc.css';

interface ResultadoSync {
  sucesso: boolean;
  mensagem: string;
  importados?: number;
  atualizados?: number;
  erros?: number;
  total?: number;
  detalhes?: string[];
}

export default function IXCSyncPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSync | null>(null);
  const [substituir, setSubstituir] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [testandoConexao, setTestandoConexao] = useState(false);

  const testarConexao = async () => {
    setTestandoConexao(true);
    setResultado(null);
    
    try {
      const response = await fetch('/api/ixc/test');
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao testar conexao com IXC',
      });
    } finally {
      setTestandoConexao(false);
    }
  };

  const sincronizarEquipamentos = async () => {
    if (!confirm(`Deseja sincronizar os equipamentos do IXC?\n\n${substituir ? 'ATENCAO: Equipamentos existentes serao atualizados!' : 'Apenas novos equipamentos serao importados.'}`)) {
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch('/api/ixc/equipamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          substituir,
          page: 1,
          per_page: 1000, // Busca ate 1000 equipamentos
        }),
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao sincronizar equipamentos',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ixc-container">
      <div className="ixc-header">
        <h1>Sincronizacao IXC Soft</h1>
        <p>Importe equipamentos e ordens de servico do IXC para o sistema</p>
      </div>

      <div className="ixc-cards">
        {/* Card de teste de conexao */}
        <div className="ixc-card">
          <h2>Teste de Conexao</h2>
          <p>Verifique se as credenciais do IXC estao configuradas corretamente</p>
          
          <button
            onClick={testarConexao}
            disabled={testandoConexao}
            className="btn-primary"
          >
            {testandoConexao ? 'Testando...' : 'Testar Conexao'}
          </button>
        </div>

        {/* Card de sincronizacao de equipamentos */}
        <div className="ixc-card">
          <h2>Sincronizar Equipamentos</h2>
          <p>Importe equipamentos do estoque do IXC para o sistema local</p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={substituir}
                onChange={(e) => setSubstituir(e.target.checked)}
              />
              <span>Atualizar equipamentos existentes (por serial/MAC)</span>
            </label>
          </div>

          <button
            onClick={sincronizarEquipamentos}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar Equipamentos'}
          </button>
        </div>

        {/* Card de visualizacao de OS */}
        <div className="ixc-card">
          <h2>Ordens de Servico</h2>
          <p>Visualize as OS do IXC (em desenvolvimento)</p>
          
          <button
            disabled
            className="btn-secondary"
          >
            Em breve
          </button>
        </div>
      </div>

      {/* Resultado da operacao */}
      {resultado && (
        <div className={`resultado ${resultado.sucesso ? 'sucesso' : 'erro'}`}>
          <h3>{resultado.sucesso ? '✓ Sucesso' : '✗ Erro'}</h3>
          <p>{resultado.mensagem}</p>

          {resultado.importados !== undefined && (
            <div className="estatisticas">
              <div className="stat">
                <span className="stat-label">Total processado:</span>
                <span className="stat-value">{resultado.total || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Importados:</span>
                <span className="stat-value green">{resultado.importados}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Atualizados:</span>
                <span className="stat-value blue">{resultado.atualizados}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Erros:</span>
                <span className="stat-value red">{resultado.erros}</span>
              </div>
            </div>
          )}

          {resultado.detalhes && resultado.detalhes.length > 0 && (
            <div className="detalhes-section">
              <button
                onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                className="btn-detalhes"
              >
                {mostrarDetalhes ? 'Ocultar' : 'Mostrar'} detalhes ({resultado.detalhes.length})
              </button>

              {mostrarDetalhes && (
                <div className="detalhes-lista">
                  {resultado.detalhes.map((detalhe, index) => (
                    <div key={index} className="detalhe-item">
                      {detalhe}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instrucoes */}
      <div className="instrucoes">
        <h3>Instrucoes</h3>
        <ol>
          <li>Configure as credenciais do IXC no arquivo <code>.env.local</code>:
            <pre>IXC_API_URL=https://seudominio.ixcsoft.com.br/webservice/v1{'\n'}IXC_API_TOKEN=seu_token_aqui</pre>
          </li>
          <li>Teste a conexao clicando no botao "Testar Conexao"</li>
          <li>Se a conexao estiver OK, clique em "Sincronizar Equipamentos"</li>
          <li>Os equipamentos serao importados automaticamente para o sistema</li>
          <li>Equipamentos duplicados (mesmo serial ou MAC) serao ignorados ou atualizados</li>
        </ol>
      </div>
    </div>
  );
}
