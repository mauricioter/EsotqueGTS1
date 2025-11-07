"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Usuario {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  numero?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

function validarCPF(cpf: string) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  const calc = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) total += parseInt(base[i], 10) * (factor - i);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calc(clean.slice(0, 9), 10);
  const d2 = calc(clean.slice(0, 10), 11);
  return d1 === parseInt(clean[9], 10) && d2 === parseInt(clean[10], 10);
}

export default function UsuariosPage() {
  const { data: session, status: authStatus } = useSession();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  // Carregar lista de usuários
  useEffect(() => {
    if (session && (session as any)?.role === 'ADMIN') {
      carregarUsuarios();
    }
  }, [session]);

  async function carregarUsuarios() {
    try {
      setLoadingUsuarios(true);
      const res = await axios.get('/api/admin/users');
      setUsuarios(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  }

  async function aprovarUsuario(userId: string) {
    try {
      await axios.post('/api/admin/usuarios/approve', { userId, approve: true });
      setStatus('Usuário aprovado com sucesso!');
      await carregarUsuarios();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao aprovar usuário';
      setStatus(msg);
    }
  }

  async function rejeitarUsuario(userId: string) {
    try {
      await axios.post('/api/admin/usuarios/approve', { userId, approve: false });
      setStatus('Usuário rejeitado com sucesso!');
      await carregarUsuarios();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao rejeitar usuário';
      setStatus(msg);
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="page-container">
        <div className="section-card text-center">Carregando...</div>
      </div>
    );
  }

  const role = (session as any)?.role;
  if (!session || role !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="section-card text-center">
          <h2>Acesso negado</h2>
          <p>
            Você precisa ser <strong>ADMIN</strong> para cadastrar usuários por esta página.
          </p>
          <div className="actions-center" style={{ marginTop: 12 }}>
            <Link href="/" className="btn btn-secondary">Voltar para a página inicial</Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!nomeCompleto || !email || !cpf) {
      setStatus('Preencha nome completo, email e CPF.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('Email inválido.');
      return;
    }
    if (!validarCPF(cpf)) {
      setStatus('CPF inválido.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/usuarios', { nomeCompleto, numero, email, cpf });
      if (res.status === 200) {
        setStatus('Usuário cadastrado com sucesso.');
        setNomeCompleto('');
        setNumero('');
        setEmail('');
        setCpf('');
        await carregarUsuarios(); // Recarregar lista
      } else {
        setStatus('Erro ao cadastrar usuário.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Falha ao cadastrar usuário.';
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  const usuariosPendentes = usuarios.filter(u => u.status === 'PENDING');
  const usuariosAprovados = usuarios.filter(u => u.status === 'APPROVED');

  return (
    <div className="page-container">
      {/* Lista de Usuários Pendentes */}
      {usuariosPendentes.length > 0 && (
        <div className="section-card" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h2>⏳ Solicitações Pendentes ({usuariosPendentes.length})</h2>
            <p className="text-muted">Usuários aguardando aprovação</p>
          </div>
          {loadingUsuarios ? (
            <p className="text-center">Carregando...</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {usuariosPendentes.map(usuario => (
                <div key={usuario.id} style={{ 
                  padding: 16, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 8,
                  backgroundColor: '#fff9e6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{usuario.name}</h3>
                      <p style={{ margin: '4px 0', color: '#666' }}>{usuario.email}</p>
                      {usuario.cpf && <p style={{ margin: '4px 0', color: '#666' }}>CPF: {usuario.cpf}</p>}
                      {usuario.numero && <p style={{ margin: '4px 0', color: '#666' }}>Tel: {usuario.numero}</p>}
                      <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
                        Solicitado em: {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => aprovarUsuario(usuario.id)}
                        className="btn btn-primary"
                        style={{ fontSize: 14, padding: '8px 16px' }}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        onClick={() => rejeitarUsuario(usuario.id)}
                        className="btn btn-secondary"
                        style={{ fontSize: 14, padding: '8px 16px' }}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulário de Cadastro Manual */}
      <div className="section-card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="section-header">
          <div>
            <h1>Cadastrar Usuário</h1>
            <p className="text-muted">Registre novos usuários com nome completo, número, email e CPF.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            Nome completo
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Ex.: Maria Souza"
              required
            />
          </label>
          <label>
            Número
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Telefone ou matrícula"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@dominio.com"
              required
            />
          </label>
          <label>
            CPF
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </label>
          <div className="actions-center" style={{ marginTop: 8 }}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
        {status && <p className="text-center" style={{ marginTop: 10 }}>{status}</p>}
        <div className="actions-center" style={{ marginTop: 12 }}>
          <Link href="/" className="btn btn-secondary">Voltar para a página inicial</Link>
        </div>
      </div>

      {/* Lista de Usuários Aprovados */}
      {usuariosAprovados.length > 0 && (
        <div className="section-card" style={{ marginTop: 24 }}>
          <div className="section-header">
            <h2>✅ Usuários Aprovados ({usuariosAprovados.length})</h2>
            <p className="text-muted">Usuários com acesso ao sistema</p>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {usuariosAprovados.map(usuario => (
              <div key={usuario.id} style={{ 
                padding: 12, 
                border: '1px solid #e0e0e0', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{usuario.name}</strong>
                  <span style={{ marginLeft: 12, color: '#666' }}>{usuario.email}</span>
                  {usuario.cpf && <span style={{ marginLeft: 12, color: '#999' }}>CPF: {usuario.cpf}</span>}
                </div>
                <div>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: 4, 
                    backgroundColor: usuario.role === 'ADMIN' ? '#ff7a00' : '#4CAF50',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {usuario.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}