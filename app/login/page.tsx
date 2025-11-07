'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './login.css';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/home';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorParam = params.get('error');
  const hasGoogleOAuth = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Entrando...');
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl: next,
      redirect: false,
    });
    if (res?.error) {
      setStatus(res.error);
      setLoading(false);
    } else if (res?.ok) {
      setStatus('Login realizado! Redirecionando...');
      window.location.href = next;
    } else {
      setStatus('Falha ao entrar');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: next });
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-brand">
        <div className="brand-content">
          <img src="/logo.png" alt="GTSnet" className="brand-logo" />
          <h1>Controle de Estoque</h1>
          <p>Sistema de gerenciamento de equipamentos GTSnet</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <span>Controle total do estoque</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Acesso mobile para técnicos</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Relatórios e estatísticas</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Seguro e confiável</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Bem-vindo de volta!</h2>
            <p>Faça login para acessar o sistema</p>
          </div>

          {errorParam && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>Erro de autenticação. Tente novamente.</span>
            </div>
          )}

          {status && (
            <div className={`alert ${status.includes('Falha') || status.includes('Erro') ? 'alert-error' : 'alert-info'}`}>
              <span className="alert-icon">
                {status.includes('Falha') || status.includes('Erro') ? '⚠️' : 'ℹ️'}
              </span>
              <span>{status}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
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
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {hasGoogleOAuth && (
            <>
              <div className="divider">
                <span>ou</span>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="btn-google"
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
                </svg>
                Continuar com Google
              </button>
            </>
          )}

          <div className="login-footer">
            <p>
              Não tem uma conta?{' '}
              <Link href="/register" className="link-register">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}