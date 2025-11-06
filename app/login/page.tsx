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
      background: 'var(--bg)'
    }}>
      <div style={{
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--card)',
        border: '1px solid var(--input-border)',
        borderRadius: '12px',
        boxShadow: 'var(--card-shadow)',
        padding: 24
      }}>
        <h2 style={{ margin: 0 }}>Entrar</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Entre com email/senha ou Google</p>

        {errorParam && (
          <div style={{ color: 'tomato', fontSize: 12 }}>
            {errorParam}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }}
            required
          />
          <label style={{ fontSize: 12 }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)' }}
            required
          />
          <button type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--button-primary)', color: 'white', cursor: 'pointer' }}>
            Entrar
          </button>
          {status && <div style={{ fontSize: 12, color: 'var(--text-secondary)'}}>{status}</div>}
        </form>

        {/* Mostrar botão Google apenas se configurado */}
        {hasGoogleOAuth && (
          <button
            onClick={() => signIn('google', { callbackUrl: next })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #4285F4',
              background: '#4285F4',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span>Entrar com Google</span>
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <a href="/register" style={{ color: 'var(--link)', textDecoration: 'underline' }}>Ainda não tem cadastro?</a>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
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