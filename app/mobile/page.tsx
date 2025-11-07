'use client';'use client';'use client';'use client';'use client';



import React, { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import axios from 'axios';import { useSession } from 'next-auth/react';

import './mobile.css';

import { useRouter } from 'next/navigation';import React, { useState, useEffect } from 'react';

interface Equipamento {

  id: string;import Link from 'next/link';

  nome: string;

  serial?: string;import axios from 'axios';import { useSession } from 'next-auth/react';

  marca?: string;

  modelo?: string;import './mobile.css';

  status: string;

}import { useRouter } from 'next/navigation';import React, { useState, useEffect } from 'react';import { useSession } from 'next-auth/react';



export default function MobilePage() {interface Equipamento {

  const { data: session, status } = useSession();

  const router = useRouter();  id: string;import Link from 'next/link';

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const [loading, setLoading] = useState(true);  nome: string;



  useEffect(() => {  serial?: string;import axios from 'axios';import { useSession } from 'next-auth/react';import { useRouter } from 'next/navigation';

    if (status === 'unauthenticated') {

      router.push('/login');  marca?: string;

      return;

    }  modelo?: string;import './mobile.css';



    if (status === 'authenticated') {  status: string;

      carregarEquipamentos();

    }}import { useRouter } from 'next/navigation';import { useEffect, useState } from 'react';

  }, [status, router]);



  const carregarEquipamentos = async () => {

    try {export default function MobilePage() {interface Equipamento {

      setLoading(true);

      const response = await axios.get('/api/mobile/meus-equipamentos');  const { data: session, status } = useSession();

      setEquipamentos(response.data);

    } catch (error) {  const router = useRouter();  id: string;import Link from 'next/link';import InstallPWA from '../components/InstallPWA';

      console.error('Erro ao carregar equipamentos:', error);

    } finally {  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

      setLoading(false);

    }  const [loading, setLoading] = useState(true);  nome: string;

  };



  if (status === 'loading' || loading) {

    return (  useEffect(() => {  serial?: string;import axios from 'axios';import './mobile.css';

      <div className="mobile-container">

        <div className="loading-container">    if (status === 'unauthenticated') {

          <div className="spinner"></div>

          <p>Carregando...</p>      router.push('/login');  marca?: string;

        </div>

      </div>      return;

    );

  }    }  modelo?: string;import './mobile.css';



  return (

    <div className="mobile-container">

      <div className="mobile-header">    if (status === 'authenticated') {  status: string;

        <Link href="/home" className="btn-back">← Voltar</Link>

        <h1>📦 Meus Equipamentos</h1>      carregarEquipamentos();

        <p className="subtitle">Equipamentos em sua posse</p>

      </div>    }}interface Equipment {



      {equipamentos.length === 0 ? (  }, [status, router]);

        <div className="empty-state">

          <div className="empty-icon">📭</div>

          <h2>Nenhum equipamento</h2>

          <p>Você não possui equipamentos no momento.</p>  const carregarEquipamentos = async () => {

          <p className="info-text">Entre em contato com o administrador para receber equipamentos.</p>

        </div>    try {export default function MobilePage() {interface Equipamento {  id: number;

      ) : (

        <div className="equipamentos-grid">      setLoading(true);

          {equipamentos.map((eq) => (

            <div key={eq.id} className="equipamento-card">      const response = await axios.get('/api/mobile/meus-equipamentos');  const { data: session, status } = useSession();

              <div className="card-header">

                <h3>{eq.nome}</h3>      setEquipamentos(response.data);

                <span className="badge-posse">🔧 Em Posse</span>

              </div>    } catch (error) {  const router = useRouter();  id: string;  nome: string;



              <div className="card-body">      console.error('Erro ao carregar equipamentos:', error);

                {eq.serial && (

                  <div className="info-row">    } finally {  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

                    <span className="label">Serial:</span>

                    <span className="value">{eq.serial}</span>      setLoading(false);

                  </div>

                )}    }  const [loading, setLoading] = useState(true);  nome: string;  status: string;

                {eq.marca && (

                  <div className="info-row">  };

                    <span className="label">Marca:</span>

                    <span className="value">{eq.marca}</span>

                  </div>

                )}  if (status === 'loading' || loading) {

                {eq.modelo && (

                  <div className="info-row">    return (  useEffect(() => {  serial?: string;  serial?: string;

                    <span className="label">Modelo:</span>

                    <span className="value">{eq.modelo}</span>      <div className="mobile-container">

                  </div>

                )}        <div className="loading-container">    if (status === 'unauthenticated') {

              </div>

          <div className="spinner"></div>

              <div className="card-footer">

                <Link           <p>Carregando...</p>      router.push('/login');  marca?: string;  localizacaoAtual?: string;

                  href={`/mobile/instalar/${eq.id}`} 

                  className="btn-instalar"        </div>

                >

                  🚀 Instalar Equipamento      </div>      return;

                </Link>

              </div>    );

            </div>

          ))}  }    }  modelo?: string;  qrCode?: string;

        </div>

      )}

    </div>

  );  return (

}

    <div className="mobile-container">

      <div className="mobile-header">    if (status === 'authenticated') {  status: string;  instalacoes?: Array<{

        <Link href="/home" className="btn-back">← Voltar</Link>

        <h1>📦 Meus Equipamentos</h1>      carregarEquipamentos();

        <p className="subtitle">Equipamentos em sua posse</p>

      </div>    }}    dataInstalacao: string;



      {equipamentos.length === 0 ? (  }, [status, router]);

        <div className="empty-state">

          <div className="empty-icon">📭</div>    endereco?: string;

          <h2>Nenhum equipamento</h2>

          <p>Você não possui equipamentos no momento.</p>  const carregarEquipamentos = async () => {

          <p className="info-text">Entre em contato com o administrador para receber equipamentos.</p>

        </div>    try {export default function MobilePage() {  }>;

      ) : (

        <div className="equipamentos-grid">      setLoading(true);

          {equipamentos.map((eq) => (

            <div key={eq.id} className="equipamento-card">      const response = await axios.get('/api/mobile/meus-equipamentos');  const { data: session, status } = useSession();}

              <div className="card-header">

                <h3>{eq.nome}</h3>      setEquipamentos(response.data);

                <span className="badge-posse">🔧 Em Posse</span>

              </div>    } catch (error) {  const router = useRouter();



              <div className="card-body">      console.error('Erro ao carregar equipamentos:', error);

                {eq.serial && (

                  <div className="info-row">    } finally {  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);export default function MobilePage() {

                    <span className="label">Serial:</span>

                    <span className="value">{eq.serial}</span>      setLoading(false);

                  </div>

                )}    }  const [loading, setLoading] = useState(true);  const { data: session, status } = useSession();

                {eq.marca && (

                  <div className="info-row">  };

                    <span className="label">Marca:</span>

                    <span className="value">{eq.marca}</span>  const router = useRouter();

                  </div>

                )}  if (status === 'loading' || loading) {

                {eq.modelo && (

                  <div className="info-row">    return (  useEffect(() => {  const [equipments, setEquipments] = useState<Equipment[]>([]);

                    <span className="label">Modelo:</span>

                    <span className="value">{eq.modelo}</span>      <div className="mobile-container">

                  </div>

                )}        <div className="loading-container">    if (status === 'unauthenticated') {  const [loading, setLoading] = useState(true);

              </div>

          <div className="spinner"></div>

              <div className="card-footer">

                <Link           <p>Carregando...</p>      router.push('/login');  const [filter, setFilter] = useState<string>('all');

                  href={`/mobile/instalar/${eq.id}`} 

                  className="btn-instalar"        </div>

                >

                  🚀 Instalar Equipamento      </div>      return;  const [error, setError] = useState('');

                </Link>

              </div>    );

            </div>

          ))}  }    }

        </div>

      )}

    </div>

  );  return (  useEffect(() => {

}

    <div className="mobile-container">

      <div className="mobile-header">    if (session) {    if (status === 'unauthenticated') {

        <Link href="/home" className="btn-back">← Voltar</Link>

        <h1>📦 Meus Equipamentos</h1>      carregarEquipamentos();      router.push('/login');

        <p className="subtitle">Equipamentos em sua posse</p>

      </div>    }    } else if (status === 'authenticated') {



      {equipamentos.length === 0 ? (  }, [session, status]);      loadEquipments();

        <div className="empty-state">

          <div className="empty-icon">📭</div>    }

          <h2>Nenhum equipamento</h2>

          <p>Você não possui equipamentos no momento.</p>  const carregarEquipamentos = async () => {  }, [status, router, filter]);

          <p className="info-text">Entre em contato com o administrador para receber equipamentos.</p>

        </div>    try {

      ) : (

        <div className="equipamentos-grid">      setLoading(true);  const loadEquipments = async () => {

          {equipamentos.map((eq) => (

            <div key={eq.id} className="equipamento-card">      const response = await axios.get('/api/mobile/meus-equipamentos');    try {

              <div className="card-header">

                <h3>{eq.nome}</h3>      setEquipamentos(response.data);      setLoading(true);

                <span className="badge-posse">🔧 Em Posse</span>

              </div>    } catch (error) {      setError('');



              <div className="card-body">      console.error('Erro ao carregar equipamentos:', error);      const url = filter === 'all' 

                {eq.serial && (

                  <div className="info-row">    } finally {        ? '/api/mobile/equipamentos'

                    <span className="label">Serial:</span>

                    <span className="value">{eq.serial}</span>      setLoading(false);        : `/api/mobile/equipamentos?status=${filter}`;

                  </div>

                )}    }      

                {eq.marca && (

                  <div className="info-row">  };      const response = await fetch(url);

                    <span className="label">Marca:</span>

                    <span className="value">{eq.marca}</span>      const data = await response.json();

                  </div>

                )}  if (status === 'loading' || loading) {      

                {eq.modelo && (

                  <div className="info-row">    return (      if (response.ok) {

                    <span className="label">Modelo:</span>

                    <span className="value">{eq.modelo}</span>      <div className="mobile-container">        setEquipments(data.equipamentos || []);

                  </div>

                )}        <div className="loading-container">      } else {

              </div>

          <div className="spinner"></div>        setError(data.error || 'Erro ao carregar equipamentos');

              <div className="card-footer">

                <Link           <p>Carregando...</p>      }

                  href={`/mobile/instalar/${eq.id}`} 

                  className="btn-instalar"        </div>    } catch (err) {

                >

                  🚀 Instalar Equipamento      </div>      setError('Erro de conexão');

                </Link>

              </div>    );      console.error(err);

            </div>

          ))}  }    } finally {

        </div>

      )}      setLoading(false);

    </div>

  );  return (    }

}

    <div className="mobile-container">  };

      <div className="mobile-header">

        <Link href="/home" className="btn-back">← Voltar</Link>  const getStatusColor = (status: string) => {

        <h1>📦 Meus Equipamentos</h1>    const colors: Record<string, string> = {

        <p className="subtitle">Equipamentos em sua posse</p>      DISPONIVEL: '#4caf50',

      </div>      EM_USO: '#ff9800',

      EMPRESTADO: '#2196f3',

      {equipamentos.length === 0 ? (      MANUTENCAO: '#f44336',

        <div className="empty-state">      SAIDA: '#9c27b0',

          <div className="empty-icon">📭</div>      RESERVADO: '#00bcd4',

          <h2>Nenhum equipamento</h2>      DEFEITO: '#e91e63',

          <p>Você não possui equipamentos no momento.</p>      INSTALADO: '#ff7a00'

          <p className="info-text">Entre em contato com o administrador para receber equipamentos.</p>    };

        </div>    return colors[status] || '#757575';

      ) : (  };

        <div className="equipamentos-grid">

          {equipamentos.map((eq) => (  const getStatusLabel = (status: string) => {

            <div key={eq.id} className="equipamento-card">    const labels: Record<string, string> = {

              <div className="card-header">      DISPONIVEL: 'Disponível',

                <h3>{eq.nome}</h3>      EM_USO: 'Em Uso',

                <span className="badge-posse">🔧 Em Posse</span>      EMPRESTADO: 'Emprestado',

              </div>      MANUTENCAO: 'Manutenção',

      SAIDA: 'Saída',

              <div className="card-body">      RESERVADO: 'Reservado',

                {eq.serial && (      DEFEITO: 'Defeito',

                  <div className="info-row">      INSTALADO: 'Instalado'

                    <span className="label">Serial:</span>    };

                    <span className="value">{eq.serial}</span>    return labels[status] || status;

                  </div>  };

                )}

                {eq.marca && (  const handleEquipmentClick = (equipmentId: number) => {

                  <div className="info-row">    router.push(`/mobile/instalacao/${equipmentId}`);

                    <span className="label">Marca:</span>  };

                    <span className="value">{eq.marca}</span>

                  </div>  if (status === 'loading' || loading) {

                )}    return (

                {eq.modelo && (      <div className="mobile-loading">

                  <div className="info-row">        <div className="spinner"></div>

                    <span className="label">Modelo:</span>        <p>Carregando...</p>

                    <span className="value">{eq.modelo}</span>      </div>

                  </div>    );

                )}  }

              </div>

  return (

              <div className="card-footer">    <div className="mobile-container">

                <Link       {/* Header */}

                  href={`/mobile/instalar/${eq.id}`}       <header className="mobile-header">

                  className="btn-instalar"        <div className="mobile-header-content">

                >          <img src="/gtsnet-logo.png" alt="GTSnet" className="mobile-logo" />

                  🚀 Instalar Equipamento          <div className="mobile-user-info">

                </Link>            <span className="mobile-welcome">Olá, {session?.user?.name?.split(' ')[0]}</span>

              </div>            <span className="mobile-role">Técnico de Campo</span>

            </div>          </div>

          ))}        </div>

        </div>      </header>

      )}

    </div>      {/* Filter Tabs */}

  );      <div className="mobile-filters">

}        <button 

          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({equipments.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'DISPONIVEL' ? 'active' : ''}`}
          onClick={() => setFilter('DISPONIVEL')}
        >
          Disponível
        </button>
        <button 
          className={`filter-btn ${filter === 'EM_USO' ? 'active' : ''}`}
          onClick={() => setFilter('EM_USO')}
        >
          Em Uso
        </button>
        <button 
          className={`filter-btn ${filter === 'INSTALADO' ? 'active' : ''}`}
          onClick={() => setFilter('INSTALADO')}
        >
          Instalado
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mobile-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Equipment List */}
      <div className="mobile-content">
        {equipments.length === 0 ? (
          <div className="mobile-empty">
            <div className="empty-icon">📦</div>
            <h3>Nenhum equipamento</h3>
            <p>Você não possui equipamentos {filter !== 'all' ? `com status "${getStatusLabel(filter)}"` : 'atribuídos'}</p>
          </div>
        ) : (
          <div className="equipment-grid">
            {equipments.map((equip) => (
              <div 
                key={equip.id} 
                className="equipment-card"
                onClick={() => handleEquipmentClick(equip.id)}
              >
                <div className="equipment-header">
                  <h3>{equip.nome}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(equip.status) }}
                  >
                    {getStatusLabel(equip.status)}
                  </span>
                </div>
                
                {equip.serial && (
                  <div className="equipment-detail">
                    <span className="detail-label">Serial:</span>
                    <span className="detail-value">{equip.serial}</span>
                  </div>
                )}
                
                {equip.localizacaoAtual && (
                  <div className="equipment-detail">
                    <span className="detail-label">📍 Local:</span>
                    <span className="detail-value">{equip.localizacaoAtual}</span>
                  </div>
                )}
                
                {equip.instalacoes && equip.instalacoes.length > 0 && (
                  <div className="equipment-detail">
                    <span className="detail-label">Última instalação:</span>
                    <span className="detail-value">
                      {new Date(equip.instalacoes[0].dataInstalacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                <button className="action-btn">
                  {equip.status === 'DISPONIVEL' ? '📸 Registrar Instalação' : '👁️ Ver Detalhes'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        <button className="nav-btn active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Início</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/mobile/instalacoes')}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Histórico</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/dashboard')}>
          <span className="nav-icon">💻</span>
          <span className="nav-label">Desktop</span>
        </button>
        <button className="nav-btn" onClick={() => router.push('/api/auth/logout')}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sair</span>
        </button>
      </nav>

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
}
