'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import './transferencias.css';

interface Equipamento {
  id: string;
  nome: string;
  serial?: string;
  status: string;
}

interface Tecnico {
  id: string;
  nome: string;
  status: 'ATIVO' | 'INATIVO';
}

export default function TransferenciasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');
  const [buscaEquipamento, setBuscaEquipamento] = useState('');
  const [buscaTecnico, setBuscaTecnico] = useState('');
  const [assinatura, setAssinatura] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session) {
      carregarDados();
    }
  }, [session, status]);

  const carregarDados = async () => {
    try {
      // Carregar equipamentos disponíveis
      const resEquip = await axios.get('/api/equipamentos');
      const disponiveis = resEquip.data.filter((e: Equipamento) => e.status === 'DISPONIVEL');
      setEquipamentos(disponiveis);

      // Carregar técnicos (somente ATIVOS)
      const resTecnicos = await axios.get('/api/tecnicos?status=ATIVO');
      setTecnicos(resTecnicos.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Funções de desenho da assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setAssinatura(canvasRef.current.toDataURL());
    }
  };

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinatura('');
  };

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipamentoSelecionado || !tecnicoSelecionado || !assinatura) {
      setMensagem('❌ Preencha todos os campos e assine!');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      await axios.post('/api/transferencias', {
        equipamentoId: equipamentoSelecionado,
        tecnicoId: tecnicoSelecionado,
        assinaturaTecnico: assinatura,
      });

      setMensagem('✅ Equipamento transferido com sucesso!');
      setEquipamentoSelecionado('');
      setTecnicoSelecionado('');
      limparAssinatura();
      await carregarDados();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao transferir equipamento';
      setMensagem('❌ ' + msg);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="transferencias-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  const role = (session as any)?.role;
  if (role !== 'ADMIN' && role !== 'OPERATOR') {
    return (
      <div className="transferencias-container">
        <div className="error-message">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
            Acesso Negado
          </h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <Link href="/home" className="btn-voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="transferencias-container">
      <div className="header">
        <Link href="/home" className="btn-voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Voltar
        </Link>
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Transferir Equipamento
        </h1>
        <p className="subtitle">Transfira equipamentos do estoque para técnicos</p>
      </div>

      <div className="transferencia-card">
        <form onSubmit={handleTransferir}>
          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 14H4V9h16v10z"/>
              </svg>
              Selecione o Equipamento
            </label>
            <input
              type="text"
              placeholder="Digite para buscar equipamento..."
              value={buscaEquipamento}
              onChange={(e) => setBuscaEquipamento(e.target.value)}
              list="equipamentos-list"
              className="search-input"
            />
            <datalist id="equipamentos-list">
              {equipamentos
                .filter(eq => 
                  eq.nome.toLowerCase().includes(buscaEquipamento.toLowerCase()) ||
                  (eq.serial && eq.serial.toLowerCase().includes(buscaEquipamento.toLowerCase()))
                )
                .map((eq) => (
                  <option key={eq.id} value={`${eq.nome}${eq.serial ? ` (Serial: ${eq.serial})` : ''}`} />
                ))}
            </datalist>
            <select
              value={equipamentoSelecionado}
              onChange={(e) => setEquipamentoSelecionado(e.target.value)}
              required
              style={{ marginTop: '8px' }}
            >
              <option value="">-- Escolha um equipamento --</option>
              {equipamentos
                .filter(eq => 
                  eq.nome.toLowerCase().includes(buscaEquipamento.toLowerCase()) ||
                  (eq.serial && eq.serial.toLowerCase().includes(buscaEquipamento.toLowerCase()))
                )
                .map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome} {eq.serial ? `(Serial: ${eq.serial})` : ''}
                  </option>
                ))}
            </select>
            {equipamentos.length === 0 && (
              <p className="info-text">Nenhum equipamento disponível no momento</p>
            )}
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Selecione o Técnico
            </label>
            <input
              type="text"
              placeholder="Digite para buscar técnico..."
              value={buscaTecnico}
              onChange={(e) => setBuscaTecnico(e.target.value)}
              list="tecnicos-list"
              className="search-input"
            />
            <datalist id="tecnicos-list">
              {tecnicos
                .filter(tec => 
                  tec.nome.toLowerCase().includes(buscaTecnico.toLowerCase())
                )
                .map((tec) => (
                  <option key={tec.id} value={tec.nome} />
                ))}
            </datalist>
            <select
              value={tecnicoSelecionado}
              onChange={(e) => setTecnicoSelecionado(e.target.value)}
              required
              style={{ marginTop: '8px' }}
            >
              <option value="">-- Escolha um técnico --</option>
              {tecnicos
                .filter(tec => 
                  tec.nome.toLowerCase().includes(buscaTecnico.toLowerCase())
                )
                .map((tec) => (
                  <option key={tec.id} value={tec.id}>
                    {tec.nome}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Assinatura do Técnico
            </label>
            <p className="info-text">O técnico deve assinar abaixo confirmando o recebimento</p>
            <canvas
              ref={canvasRef}
              width={800}
              height={220}
              className="canvas-assinatura"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <button
              type="button"
              onClick={limparAssinatura}
              className="btn-limpar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Limpar Assinatura
            </button>
          </div>

          {mensagem && (
            <div className={`mensagem ${mensagem.includes('✅') ? 'sucesso' : 'erro'}`}>
              {mensagem.includes('✅') ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            className="btn-transferir"
            disabled={loading || !equipamentoSelecionado || !tecnicoSelecionado || !assinatura}
          >
            {loading ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Transferindo...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Transferir Equipamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
