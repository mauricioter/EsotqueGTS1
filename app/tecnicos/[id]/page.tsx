'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Tecnico {
  id: string;
  nome: string;
  telefone?: string | null;
  funcao?: string | null;
  status: 'ATIVO' | 'INATIVO';
  observacoes?: string | null;
  createdAt: string;
}

interface UserInfo {
  id: string;
  email?: string | null;
  role?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  status?: string;
  createdAt?: string;
}

export default function TecnicoPerfilPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [movs, setMovs] = useState<any[]>([]);
  const role = (session as unknown as { role?: 'ADMIN' | 'OPERATOR' | 'VIEWER' })?.role;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/tecnicos/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTecnico(data.tecnico);
      setUser(data.user || null);
      const nome = data.tecnico?.nome;
      if (nome) {
        const [eqRes, mvRes] = await Promise.all([
          fetch(`/api/equipamentos?tecnico=${encodeURIComponent(nome)}`),
          fetch(`/api/ferramentas/movimentar?tecnico=${encodeURIComponent(nome)}&pageSize=50`),
        ]);
        if (eqRes.ok) setEquipamentos(await eqRes.json());
        if (mvRes.ok) {
          const mvData = await mvRes.json();
          setMovs(mvData.movimentacoes || []);
        }
      }
    };
    load();
  }, [params.id]);

  if (!tecnico) {
    return (
      <div className="page-container">
        <div className="section-card">Carregando perfil do técnico...</div>
      </div>
    );
  }

  const ultimaAtividade = movs.length
    ? new Date(movs[0].createdAt || movs[0].dataRetirada).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="page-container">
      <div className="section-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0 }}>{tecnico.nome}</h2>
                <span className={`tech-status ${tecnico.status === 'ATIVO' ? 'ok' : 'off'}`}>{tecnico.status}</span>
              </div>
              <div style={{ color: '#6b7280' }}>
                {user?.email || 'Email não informado'} • {tecnico.funcao || 'Função não informada'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/tecnicos/${tecnico.id}/estoque`} className="btn btn-secondary">Ver estoque</Link>
            {role === 'ADMIN' && <Link href="/usuarios" className="btn btn-primary">Editar usuário</Link>}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="section-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Contato</div>
          <div style={{ color: '#374151' }}>Telefone: {tecnico.telefone || '—'}</div>
          <div style={{ color: '#374151' }}>Email: {user?.email || '—'}</div>
          <div style={{ color: '#374151' }}>Equipe: {tecnico.funcao || '—'}</div>
        </div>
        <div className="section-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Status</div>
          <div style={{ color: '#374151' }}>Situação: {tecnico.status}</div>
          <div style={{ color: '#374151' }}>Registro: {new Date(tecnico.createdAt).toLocaleDateString('pt-BR')}</div>
          <div style={{ color: '#374151' }}>Última atividade: {ultimaAtividade || '—'}</div>
        </div>
        <div className="section-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Resumo de estoque</div>
          <div style={{ color: '#374151' }}>Itens: {equipamentos.length}</div>
          <Link href={`/tecnicos/${tecnico.id}/estoque`} className="btn btn-secondary" style={{ marginTop: 8 }}>Abrir estoque</Link>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Histórico de movimentações</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
          {movs.length === 0 ? (
            <div className="empty-state">Nenhuma movimentação</div>
          ) : (
            movs.slice(0, 10).map(m => (
              <div key={m.id} style={{ display: 'contents' }}>
                <div>{m.ferramenta?.nome || 'Ferramenta'}</div>
                <div>{m.tipoMovimentacao}</div>
                <div>{m.quantidade}</div>
                <div>{new Date(m.createdAt).toLocaleString('pt-BR')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}