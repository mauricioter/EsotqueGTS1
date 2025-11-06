'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const errorParam = params.get('error');
  const hasGoogleOAuth = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Entrando...');
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl: next,
      redirect: false,
    });
    if (res?.error) {
      setStatus(res.error);
    } else if (res?.ok) {
      setStatus(null);
      window.location.href = next;
    } else {
      setStatus('Falha ao entrar');
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
        maxWidth: 420,
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
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Entrar</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Entre com email/senha ou Google</p>
        </div>

        {errorParam && (
          <div style={{ color: 'tomato', fontSize: 12 }}>
            {errorParam}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ 
                width: '100%',
                padding: '10px 12px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--text)',
                fontSize: 14,
                transition: 'all 0.2s ease'
              }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              style={{ 
                width: '100%',
                padding: '10px 12px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--text)',
                fontSize: 14,
                transition: 'all 0.2s ease'
              }}
              required
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              border: 'none', 
              background: 'var(--primary)', 
              color: 'white', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.2s ease',
              marginTop: 8
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Entrar
          </button>
          {status && <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 12px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-md)' }}>{status}</div>}
        </form>

        {/* Mostrar botão Google apenas se configurado */}
        {hasGoogleOAuth && (
          <button
            onClick={() => signIn('google', { callbackUrl: next })}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #4285F4',
              background: '#4285F4',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#3367D6'}
            onMouseOut={(e) => e.currentTarget.style.background = '#4285F4'}
          >
            <span>Entrar com Google</span>
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--input-border)' }}>
          <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Ainda não tem cadastro?</a>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
          Ao continuar, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
          Carregando...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}