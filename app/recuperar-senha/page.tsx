'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Toast from '../components/Toast';
import '../login/login.css';
import './recuperar-senha.css';

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Por favor, insira seu e-mail', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        showToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
      } else {
        showToast(data.error || 'Erro ao enviar e-mail de recuperação', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao processar solicitação. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <img src="/logo.png" alt="GTSnet" className="brand-logo" />
            <h1>Recuperação de Senha</h1>
            <p>Sistema de gerenciamento de equipamentos GTSnet</p>
            <div className="brand-features">
              <div className="feature-item">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>Sistema seguro</span>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>E-mail de recuperação</span>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Processo rápido e fácil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Recovery Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <Link href="/login" className="back-to-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar ao login
            </Link>

            <div className="login-header">
              <div className="recovery-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <h2>Esqueceu sua senha?</h2>
              <p>
                {emailSent 
                  ? 'E-mail enviado! Verifique sua caixa de entrada e spam.'
                  : 'Não se preocupe! Insira seu e-mail e enviaremos instruções para redefinir sua senha.'
                }
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="form-input"
                    disabled={loading}
                    autoFocus
                  />
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Enviar link de recuperação
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="success-message">
                <div className="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <p>Enviamos um e-mail para <strong>{email}</strong> com instruções para redefinir sua senha.</p>
                <p className="help-text">Não recebeu o e-mail? Verifique sua pasta de spam ou:</p>
                <button 
                  onClick={() => setEmailSent(false)}
                  className="btn-secondary"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            <div className="login-footer">
              <p>Lembrou sua senha? <Link href="/login">Fazer login</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}
