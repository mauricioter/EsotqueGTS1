"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Footer from '../components/Footer';
import './usuarios.css';

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
    <div className="page-container usuarios-page">
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
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <h1>Gerenciar Usuários</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Lista de Usuários Pendentes */}
      {usuariosPendentes.length > 0 && (
        <div className="section-card pending-section">
          <div className="section-header">
            <div className="header-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <h2>Solicitações Pendentes ({usuariosPendentes.length})</h2>
                <p className="text-muted">Usuários aguardando aprovação</p>
              </div>
            </div>
          </div>
          {loadingUsuarios ? (
            <div className="loading-state">
              <svg className="spinner-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <p>Carregando...</p>
            </div>
          ) : (
            <div className="usuarios-grid">
              {usuariosPendentes.map(usuario => (
                <div key={usuario.id} className="usuario-card pending-card">
                  <div className="card-content">
                    <div className="user-info">
                      <div className="user-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div className="user-details">
                        <h3>{usuario.name}</h3>
                        <p className="user-email">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {usuario.email}
                        </p>
                        {usuario.cpf && (
                          <p className="user-cpf">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            CPF: {usuario.cpf}
                          </p>
                        )}
                        {usuario.numero && (
                          <p className="user-phone">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                            </svg>
                            {usuario.numero}
                          </p>
                        )}
                        <p className="user-date">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Solicitado em: {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => aprovarUsuario(usuario.id)}
                        className="btn-approve"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Aprovar
                      </button>
                      <button 
                        onClick={() => rejeitarUsuario(usuario.id)}
                        className="btn-reject"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Rejeitar
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
      <div className="section-card form-section">
        <div className="section-header">
          <div className="header-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <div>
              <h1>Cadastrar Usuário</h1>
              <p className="text-muted">Registre novos usuários com nome completo, número, email e CPF.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Nome completo
            </label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Ex.: Maria Souza"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Número
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Telefone ou matrícula"
            />
          </div>
          <div className="form-group">
            <label>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@dominio.com"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              CPF
            </label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? (
                <>
                  <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Cadastrar
                </>
              )}
            </button>
            <Link href="/home" className="btn-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </Link>
          </div>
        </form>
        {status && (
          <div className={`status-message ${status.includes('sucesso') ? 'success' : 'error'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {status.includes('sucesso') ? (
                <polyline points="20 6 9 17 4 12"/>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </>
              )}
            </svg>
            {status}
          </div>
        )}
      </div>

      {/* Lista de Usuários Aprovados */}
      {usuariosAprovados.length > 0 && (
        <div className="section-card approved-section">
          <div className="section-header">
            <div className="header-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <h2>Usuários Aprovados ({usuariosAprovados.length})</h2>
                <p className="text-muted">Usuários com acesso ao sistema</p>
              </div>
            </div>
          </div>
          <div className="usuarios-grid approved-grid">
            {usuariosAprovados.map(usuario => (
              <div key={usuario.id} className="usuario-card approved-card">
                <div className="user-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="user-details">
                  <h3>{usuario.name}</h3>
                  <p className="user-email">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {usuario.email}
                  </p>
                  {usuario.cpf && (
                    <p className="user-cpf">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      CPF: {usuario.cpf}
                    </p>
                  )}
                </div>
                <div className="user-role">
                  <span className={`role-badge ${usuario.role.toLowerCase()}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {usuario.role === 'ADMIN' ? (
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      ) : (
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      )}
                    </svg>
                    {usuario.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}