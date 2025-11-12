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
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <span>Controle total do estoque</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Interface rápida e eficiente</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>Relatórios e estatísticas</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
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
              <svg className="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Erro de autenticação. Tente novamente.</span>
            </div>
          )}

          {status && (
            <div className={`alert ${status.includes('Falha') || status.includes('Erro') ? 'alert-error' : 'alert-info'}`}>
              <svg className="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {status.includes('Falha') || status.includes('Erro') ? (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </>
                ) : (
                  <>
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </>
                )}
              </svg>
              <span>{status}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
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
              <Link href="/recuperar-senha" className="forgot-password-link">
                Esqueci minha senha
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spinner-small" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                  </svg>
                  Entrar
                </>
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