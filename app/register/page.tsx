'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '../login/login.css';

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
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);
      setStatus('Cadastrando...');
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto, email, cpf, numero, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Erro ao cadastrar');
        setLoading(false);
        return;
      }
      setStatus('✅ Cadastro realizado! Aguarde aprovação do administrador.');
      setLoading(false);
      
      // Clear form
      setNomeCompleto('');
      setNumero('');
      setEmail('');
      setCpf('');
      setPassword('');
      setConfirm('');
    } catch (e) {
      setStatus('Erro de rede');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-brand">
        <div className="brand-content">
          <img src="/logo.png" alt="GTSnet" className="brand-logo" />
          <h1>Criar Conta</h1>
          <p>Junte-se ao sistema de controle de estoque GTSnet</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Cadastro rápido e seguro</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <span>Aprovação por administrador</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Acesso completo ao sistema</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span>Comece em minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Crie sua conta</h2>
            <p>Preencha os dados abaixo para se cadastrar</p>
          </div>

          {status && (
            <div className={`alert ${status.includes('✅') ? 'alert-success' : status.includes('Erro') || status.includes('inválid') ? 'alert-error' : 'alert-info'}`}>
              <span className="alert-icon">
                {status.includes('✅') ? '✅' : status.includes('Erro') ? '⚠️' : 'ℹ️'}
              </span>
              <span>{status}</span>
            </div>
          )}

          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label htmlFor="nome" className="form-label">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="João da Silva"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero" className="form-label">
                Número de Funcionário
              </label>
              <input
                id="numero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="12345"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cpf" className="form-label">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                required
                className="form-input"
                disabled={loading}
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm" className="form-label">
                Confirmar Senha
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Já tem uma conta?{' '}
              <Link href="/login" className="link-register">
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}