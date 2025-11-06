'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function UserSidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;
  const status = (session as any)?.status as 'PENDING' | 'APPROVED' | undefined;

  return (
    <>
      {/* Botão flutuante lateral direito - quadradinho moderno */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 999,
          borderRadius: 12,
          width: 48,
          height: 48,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          background: 'var(--card)',
          border: '1px solid var(--input-border)',
          color: 'var(--text)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        title={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Menu lateral direito - estilizado */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : -320,
          width: 280,
          height: '100vh',
          background: 'var(--card)',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          gap: 20,
          borderLeft: '1px solid var(--input-border)'
        }}
      >
          {/* Card do usuário - estilizado */}
          <div style={{
            background: 'var(--primary-subtle)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid var(--primary-light)'
          }}>
            <div style={{
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--primary-dark)',
              fontSize: 14
            }}>
              👤 Usuário atual
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text)',
              marginBottom: 4,
              fontWeight: 500
            }}>
              {session?.user?.name || 'Nome não informado'}
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-light)',
              marginBottom: 8
            }}>
              {session?.user?.email || 'Email não informado'}
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              fontSize: 11,
              marginTop: 8
            }}>
              <span style={{
                background: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                {role || 'Sem papel'}
              </span>
              <span style={{
                background: status === 'APPROVED' ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: status === 'APPROVED' ? 'var(--success)' : 'var(--warning)',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                {status === 'APPROVED' ? '✓ Aprovado' : status === 'PENDING' ? '⏳ Pendente' : 'Sem status'}
              </span>
            </div>
            {status === 'PENDING' && (
              <div style={{
                fontSize: 11,
                color: 'var(--warning)',
                marginTop: 8,
                padding: '8px 12px',
                background: 'var(--warning-bg)',
                borderRadius: 8,
                border: '1px solid var(--warning)'
              }}>
                ⚠️ Aguardando aprovação do administrador
              </div>
            )}
          </div>

          {/* Navegação - estilizada */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link 
              href="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                textDecoration: 'none',
                color: 'var(--text)',
                background: 'transparent',
                border: '1px solid var(--input-border)',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-subtle)';
                e.currentTarget.style.borderColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--input-border)';
                e.currentTarget.style.color = 'var(--text)';
              }}
            >
              📦 Equipamentos
            </Link>
            
            <Link 
              href="/dashboard" 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                textDecoration: 'none',
                color: 'var(--text)',
                background: 'transparent',
                border: '1px solid var(--input-border)',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-subtle)';
                e.currentTarget.style.borderColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--input-border)';
                e.currentTarget.style.color = 'var(--text)';
              }}
            >
              📊 Dashboard
            </Link>

            {role === 'ADMIN' && (
              <>
                <Link 
                  href="/usuarios" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'var(--text)',
                    background: 'transparent',
                    border: '1px solid var(--input-border)',
                    transition: 'all 0.2s ease',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-subtle)';
                    e.currentTarget.style.borderColor = 'var(--primary-light)';
                    e.currentTarget.style.color = 'var(--primary-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--input-border)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                >
                  👥 Usuários
                </Link>
                
                <Link 
                  href="/admin" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'var(--text)',
                    background: 'transparent',
                    border: '1px solid var(--input-border)',
                    transition: 'all 0.2s ease',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-subtle)';
                    e.currentTarget.style.borderColor = 'var(--primary-light)';
                    e.currentTarget.style.color = 'var(--primary-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--input-border)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                >
                  ⚙️ Administração
                </Link>
              </>
            )}
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--danger)',
                background: 'transparent',
                color: 'var(--danger)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                marginTop: 16
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              aria-label="Sair"
            >
              🚪 Sair
            </button>
          </nav>
      </div>
    </>
  );
}