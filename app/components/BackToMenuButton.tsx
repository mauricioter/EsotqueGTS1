'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function BackToMenuButton() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isHome = pathname === '/';
  if (isHome) return null;

  return (
    <button
      onClick={() => router.push('/')}
      aria-label="Voltar ao menu principal"
      title="Voltar ao menu principal"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 997,
        borderRadius: 10,
        width: 44,
        height: 44,
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      🏠
    </button>
  );
}