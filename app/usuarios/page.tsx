'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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

  if (authStatus === 'loading') {
    return <div style={{ padding: 24 }}>Carregando...</div>;
  }

  const role = (session as any)?.role;
  if (!session || role !== 'ADMIN') {
    return (
      <div style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
        <h2>Acesso negado</h2>
        <p>Você precisa ser <strong>ADMIN</strong> para cadastrar usuários por esta página.</p>
        <div style={{ marginTop: 20 }}>
          <Link href="/">Voltar para a página inicial</Link>
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

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', padding: 16 }}>
      <h1>Cadastrar Usuário</h1>
      <p>Registre novos usuários com nome completo, número, email e CPF.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
      <div style={{ marginTop: 20 }}>
        <Link href="/">Voltar para a página inicial</Link>
      </div>
    </div>
  );
}