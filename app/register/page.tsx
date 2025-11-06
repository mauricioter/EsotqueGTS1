'use client';

import React, { useState } from 'react';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

export default function RegisterPage() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!validarEmail(email)) {
      setStatus('Email inválido');
      return;
    }
    if (!validarCPF(cpf)) {
      setStatus('CPF inválido');
      return;
    }
    if (password !== confirm) {
      setStatus('Senhas não conferem');
      return;
    }
    if (!/^.{6,}$/.test(password)) {
      setStatus('Senha deve ter ao menos 6 caracteres');
      return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setStatus('Senha deve conter letras e números');
      return;
    }

    try {
      setStatus('Cadastrando...');
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto, email, cpf, numero, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Erro ao cadastrar');
        return;
      }
      setStatus('Cadastro realizado! Aguarde aprovação do administrador.');
    } catch (e) {
      setStatus('Erro de rede');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg)',
      padding: 'var(--gap-md)'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: 480, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20, 
        background: 'var(--card)', 
        border: '2px solid var(--primary)', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-lg)', 
        padding: 32 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            margin: '0 auto 16px auto',
            padding: 8,
            boxShadow: 'var(--shadow-md)',
            border: '2px solid var(--primary)'
          }}>
            <img src="/logo.png" alt="GTSnet Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Criar conta</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Cadastre-se para começar</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nome completo</label>
            <input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Seu nome" required style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Número</label>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 123" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CPF</label>
            <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caracteres (letras e números)" required style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirmar senha</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" required style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>

          <button type="submit" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 8 }}>Cadastrar</button>
          {status && <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 12px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-md)' }}>{status}</div>}
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--input-border)' }}>
          <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Já tem conta? Entrar</a>
        </div>
      </div>
    </div>
  );
}