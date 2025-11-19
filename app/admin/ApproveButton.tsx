'use client';

import React from 'react';

interface Props {
  userId: string;
}

export default function ApproveButton({ userId }: Props) {
  const approve = async (role: 'VIEWER' | 'OPERATOR' | 'ADMIN') => {
    const res = await fetch('/api/admin/usuarios/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      alert('Falha ao aprovar usuário');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="btn-secondary"
        onClick={() => approve('VIEWER')}
        aria-label="Aprovar como Leitura"
      >
        Aprovar como Leitura
      </button>
      <button
        className="btn-secondary"
        onClick={() => approve('OPERATOR')}
        aria-label="Aprovar como Operador"
      >
        Aprovar como Operador
      </button>
      <button
        className="btn-danger"
        onClick={() => approve('ADMIN')}
        aria-label="Aprovar como Admin"
      >
        Aprovar como Admin
      </button>
    </div>
  );
}