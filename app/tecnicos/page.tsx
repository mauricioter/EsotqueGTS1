'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Tecnico {
  id: string;
  nome: string;
  telefone?: string;
  funcao?: string;
  status: 'ATIVO' | 'INATIVO';
  observacoes?: string;
}

export default function TecnicosPage() {
  const { data: session, status } = useSession();
  const [lista, setLista] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ nome: string; telefone?: string; funcao?: string; status: 'ATIVO' | 'INATIVO'; observacoes?: string }>({ nome: '', telefone: '', funcao: '', status: 'ATIVO', observacoes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listMenuAberto, setListMenuAberto] = useState<string | null>(null);
  const role = (session as any)?.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' | undefined;

  useEffect(() => {
    if (status === 'authenticated') {
      carregar();
    }
  }, [status]);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tecnicos');
      if (res.ok) {
        setLista(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/tecnicos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setEditingId(null);
          setForm({ nome: '', telefone: '', funcao: '', status: 'ATIVO', observacoes: '' });
          await carregar();
        }
      } else {
        const res = await fetch('/api/tecnicos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setForm({ nome: '', telefone: '', funcao: '', status: 'ATIVO', observacoes: '' });
          await carregar();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const editar = (t: Tecnico) => {
    setEditingId(t.id);
    setForm({ nome: t.nome, telefone: t.telefone, funcao: t.funcao, status: t.status, observacoes: t.observacoes });
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir técnico?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tecnicos/${id}`, { method: 'DELETE' });
      if (res.ok) await carregar();
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="page-container"><div className="section-card text-center">Carregando...</div></div>;
  }
  if (!session || role !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="section-card text-center">
          <h2>Acesso negado</h2>
          <p>Você precisa ser ADMIN para gerenciar técnicos.</p>
          <div className="actions-center" style={{ marginTop: 12 }}>
            <Link href="/home" className="btn btn-secondary">Voltar para Home</Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tech-actions-wrapper')) {
        setListMenuAberto(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setListMenuAberto(null);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2>Gerenciar Técnicos</h2>
          <p className="text-muted">Cadastrar, editar, inativar ou excluir técnicos</p>
        </div>
      </div>

      <div className="section-card">
        <form onSubmit={salvar} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Nome completo</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div>
            <label>Telefone</label>
            <input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <label>Função / Cargo</label>
            <input value={form.funcao || ''} onChange={(e) => setForm({ ...form, funcao: e.target.value })} />
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Observações</label>
            <textarea rows={3} value={form.observacoes || ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ nome: '', telefone: '', funcao: '', status: 'ATIVO', observacoes: '' }); }}>Cancelar</button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Salvar alterações' : 'Cadastrar Técnico'}</button>
          </div>
        </form>
      </div>

      <div className="section-card" style={{ marginTop: 16 }}>
        {lista.length === 0 ? (
          <div className="empty-state text-center">Nenhum técnico cadastrado</div>
        ) : (
          <div className="card-grid">
            {lista.map((t) => (
              <div key={t.id} className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong>{t.nome}</strong>
                    <span className={`status-badge ${t.status === 'ATIVO' ? 'status-disponivel' : 'status-saida'}`}>{t.status}</span>
                  </div>
                  <div className="small-muted">{t.funcao || '—'}</div>
                </div>
                <div className="tech-actions-wrapper" style={{ position: 'relative' }} onMouseLeave={() => setListMenuAberto(null)}>
                  <button
                    className="tech-actions"
                    title="Opções"
                    onClick={() => setListMenuAberto(listMenuAberto === t.id ? null : t.id)}
                  >
                    ⋮
                  </button>
                  {listMenuAberto === t.id && (
                    <div className="tech-actions-menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 10, minWidth: 180, zIndex: 30, padding: 6 }}>
                      <Link href={`/tecnicos/${t.id}`} className="tech-menu-item" onClick={() => setListMenuAberto(null)}>Ver perfil do técnico</Link>
                      <Link href={`/tecnicos/${t.id}/estoque`} className="tech-menu-item" onClick={() => setListMenuAberto(null)}>Ver estoque do técnico</Link>
                      <button className="tech-menu-item" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 600, color: '#1f2937' }} onClick={() => { setListMenuAberto(null); editar(t); }}>Editar usuário</button>
                      <button className="tech-menu-item danger" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 600, color: '#dc2626' }} onClick={() => { setListMenuAberto(null); excluir(t.id); }}>Desativar / Remover técnico</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}