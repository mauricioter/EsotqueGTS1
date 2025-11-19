'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function EstoqueTecnicoPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tecnico, setTecnico] = useState<any>(null);
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
      const nome = data.tecnico?.nome;
      if (nome) {
        const [eqRes, mvRes] = await Promise.all([
          fetch(`/api/equipamentos?tecnico=${encodeURIComponent(nome)}`),
          fetch(`/api/ferramentas/movimentar?tecnico=${encodeURIComponent(nome)}&pageSize=100`),
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
        <div className="section-card">Carregando estoque do técnico...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{tecnico.nome}</strong>
                <span className={`tech-status ${tecnico.status === 'ATIVO' ? 'ok' : 'off'}`}>{tecnico.status}</span>
              </div>
              <div style={{ color: '#6b7280' }}>{tecnico.funcao || '—'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/tecnicos/${tecnico.id}`} className="btn btn-secondary">Ver perfil</Link>
            {role === 'ADMIN' && <Link href="/equipamentos" className="btn btn-primary">Gerenciar</Link>}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ marginTop: 0 }}>Equipamentos</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Serial</th>
                <th>Status</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">Sem equipamentos</td>
                </tr>
              ) : (
                equipamentos.map(e => (
                  <tr key={e.id}>
                    <td>{e.nome}</td>
                    <td>{e.serial || '—'}</td>
                    <td>{e.status}</td>
                    <td>{e.localizacao || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Ferramentas em uso / histórico</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Ferramenta</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {movs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">Sem registros</td>
                </tr>
              ) : (
                movs.map(m => (
                  <tr key={m.id}>
                    <td>{m.ferramenta?.nome || 'Ferramenta'}</td>
                    <td>{m.tipoMovimentacao}</td>
                    <td>{m.quantidade}</td>
                    <td>{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}