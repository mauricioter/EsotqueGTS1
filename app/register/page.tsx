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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--card)', border: '1px solid var(--input-border)', borderRadius: 12, boxShadow: 'var(--card-shadow)', padding: 24 }}>
        <h2 style={{ margin: 0 }}>Criar conta</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12 }}>Nome completo</label>
          <input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Seu nome" required style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <label style={{ fontSize: 12 }}>Número</label>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 123" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <label style={{ fontSize: 12 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <label style={{ fontSize: 12 }}>CPF</label>
          <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <label style={{ fontSize: 12 }}>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caracteres (letras e números)" required style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <label style={{ fontSize: 12 }}>Confirmar senha</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" required style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }} />

          <button type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--button-primary)', color: 'white', cursor: 'pointer' }}>Cadastrar</button>
          {status && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{status}</div>}
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <a href="/login" style={{ color: 'var(--link)', textDecoration: 'underline' }}>Já tem conta? Entrar</a>
        </div>
      </div>
    </div>
  );
}