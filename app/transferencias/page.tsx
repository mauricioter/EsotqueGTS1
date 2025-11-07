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

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TransferenciasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');
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

      // Carregar técnicos
      const resTecnicos = await axios.get('/api/admin/users');
      const tecnicosAtivos = resTecnicos.data.filter(
        (u: Usuario) => (u.role === 'OPERATOR' || u.role === 'ADMIN') && u.name !== session?.user?.name
      );
      setTecnicos(tecnicosAtivos);
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
          <h2>⛔ Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <Link href="/home" className="btn-voltar">Voltar para Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="transferencias-container">
      <div className="header">
        <Link href="/home" className="btn-voltar">← Voltar</Link>
        <h1>🔄 Transferir Equipamento</h1>
        <p className="subtitle">Transfira equipamentos do estoque para técnicos</p>
      </div>

      <div className="transferencia-card">
        <form onSubmit={handleTransferir}>
          <div className="form-group">
            <label>📦 Selecione o Equipamento</label>
            <select
              value={equipamentoSelecionado}
              onChange={(e) => setEquipamentoSelecionado(e.target.value)}
              required
            >
              <option value="">-- Escolha um equipamento --</option>
              {equipamentos.map((eq) => (
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
            <label>👤 Selecione o Técnico</label>
            <select
              value={tecnicoSelecionado}
              onChange={(e) => setTecnicoSelecionado(e.target.value)}
              required
            >
              <option value="">-- Escolha um técnico --</option>
              {tecnicos.map((tec) => (
                <option key={tec.id} value={tec.id}>
                  {tec.name} ({tec.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>✍️ Assinatura do Técnico</label>
            <p className="info-text">O técnico deve assinar abaixo confirmando o recebimento</p>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
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
              🗑️ Limpar Assinatura
            </button>
          </div>

          {mensagem && (
            <div className={`mensagem ${mensagem.includes('✅') ? 'sucesso' : 'erro'}`}>
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            className="btn-transferir"
            disabled={loading || !equipamentoSelecionado || !tecnicoSelecionado || !assinatura}
          >
            {loading ? '⏳ Transferindo...' : '🚀 Transferir Equipamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
