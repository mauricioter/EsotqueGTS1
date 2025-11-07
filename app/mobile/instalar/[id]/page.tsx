'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import './instalacao.css';

interface Equipamento {
  id: string;
  nome: string;
  serial?: string;
  marca?: string;
  modelo?: string;
}

export default function InstalarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const equipamentoId = params?.id as string;

  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [etapa, setEtapa] = useState(1);
  const [fotoSerial, setFotoSerial] = useState('');
  const [fotoInstalado, setFotoInstalado] = useState('');
  const [assinaturaCliente, setAssinaturaCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const videoSerialRef = useRef<HTMLVideoElement>(null);
  const canvasSerialRef = useRef<HTMLCanvasElement>(null);
  const videoInstaladoRef = useRef<HTMLVideoElement>(null);
  const canvasInstaladoRef = useRef<HTMLCanvasElement>(null);
  const canvasAssinaturaRef = useRef<HTMLCanvasElement>(null);

  const [streamSerial, setStreamSerial] = useState<MediaStream | null>(null);
  const [streamInstalado, setStreamInstalado] = useState<MediaStream | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && equipamentoId) {
      carregarEquipamento();
    }

    return () => {
      // Cleanup streams
      if (streamSerial) streamSerial.getTracks().forEach(track => track.stop());
      if (streamInstalado) streamInstalado.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, equipamentoId, router]);

  const carregarEquipamento = async () => {
    try {
      const response = await axios.get(`/api/equipamentos/${equipamentoId}`);
      setEquipamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipamento:', error);
      setMensagem('❌ Erro ao carregar equipamento');
    }
  };

  // ETAPA 1: Foto do Serial
  const abrirCameraSerial = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStreamSerial(stream);
      if (videoSerialRef.current) {
        videoSerialRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera');
    }
  };

  const tirarFotoSerial = () => {
    if (videoSerialRef.current && canvasSerialRef.current) {
      const canvas = canvasSerialRef.current;
      const video = videoSerialRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        setFotoSerial(canvas.toDataURL('image/jpeg'));
        
        // Parar stream
        if (streamSerial) {
          streamSerial.getTracks().forEach(track => track.stop());
          setStreamSerial(null);
        }
      }
    }
  };

  const refazerFotoSerial = () => {
    setFotoSerial('');
    abrirCameraSerial();
  };

  // ETAPA 3: Foto do Instalado
  const abrirCameraInstalado = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStreamInstalado(stream);
      if (videoInstaladoRef.current) {
        videoInstaladoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera');
    }
  };

  const tirarFotoInstalado = () => {
    if (videoInstaladoRef.current && canvasInstaladoRef.current) {
      const canvas = canvasInstaladoRef.current;
      const video = videoInstaladoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        setFotoInstalado(canvas.toDataURL('image/jpeg'));
        
        // Parar stream
        if (streamInstalado) {
          streamInstalado.getTracks().forEach(track => track.stop());
          setStreamInstalado(null);
        }
      }
    }
  };

  const refazerFotoInstalado = () => {
    setFotoInstalado('');
    abrirCameraInstalado();
  };

  // ETAPA 4: Assinatura do Cliente
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasAssinaturaRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasAssinaturaRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasAssinaturaRef.current) {
      setAssinaturaCliente(canvasAssinaturaRef.current.toDataURL());
    }
  };

  const limparAssinatura = () => {
    const canvas = canvasAssinaturaRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaCliente('');
  };

  // Finalizar Instalação
  const finalizarInstalacao = async () => {
    if (!fotoSerial || !fotoInstalado || !assinaturaCliente || !endereco.trim()) {
      setMensagem('❌ Preencha todos os campos!');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      await axios.post('/api/mobile/instalar', {
        equipamentoId,
        fotoSerial,
        fotoInstalado,
        assinaturaCliente,
        endereco,
      });

      setMensagem('✅ Instalação concluída com sucesso!');
      setTimeout(() => {
        router.push('/mobile');
      }, 2000);
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao finalizar instalação';
      setMensagem('❌ ' + msg);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !equipamento) {
    return (
      <div className="instalar-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="instalar-container">
      <div className="header">
        <Link href="/mobile" className="btn-voltar">← Voltar</Link>
        <h1>🚀 Instalar Equipamento</h1>
        <p className="equipment-name">{equipamento.nome}</p>
      </div>

      <div className="progress-bar">
        <div className={`step ${etapa >= 1 ? 'active' : ''}`}>1</div>
        <div className={`line ${etapa >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${etapa >= 2 ? 'active' : ''}`}>2</div>
        <div className={`line ${etapa >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${etapa >= 3 ? 'active' : ''}`}>3</div>
        <div className={`line ${etapa >= 4 ? 'active' : ''}`}></div>
        <div className={`step ${etapa >= 4 ? 'active' : ''}`}>4</div>
      </div>

      {/* ETAPA 1: Foto do Serial */}
      {etapa === 1 && (
        <div className="etapa-card">
          <h2>📸 Passo 1: Foto do Serial</h2>
          <p>Tire uma foto do número de série do equipamento</p>

          {!fotoSerial ? (
            <div className="camera-container">
              <video ref={videoSerialRef} autoPlay playsInline className="camera-preview" />
              <canvas ref={canvasSerialRef} style={{ display: 'none' }} />
              
              {!streamSerial ? (
                <button onClick={abrirCameraSerial} className="btn-camera">
                  📷 Abrir Câmera
                </button>
              ) : (
                <button onClick={tirarFotoSerial} className="btn-foto">
                  📸 Tirar Foto
                </button>
              )}
            </div>
          ) : (
            <div className="foto-preview">
              <img src={fotoSerial} alt="Foto do Serial" />
              <button onClick={refazerFotoSerial} className="btn-refazer">
                🔄 Tirar Outra Foto
              </button>
              <button onClick={() => setEtapa(2)} className="btn-proximo">
                ➡️ Próximo
              </button>
            </div>
          )}
        </div>
      )}

      {/* ETAPA 2: Confirmar início da instalação */}
      {etapa === 2 && (
        <div className="etapa-card">
          <h2>🔧 Passo 2: Iniciar Instalação</h2>
          <p>Confirme que você está pronto para iniciar a instalação</p>
          
          <div className="info-box">
            <p>✅ Foto do serial tirada</p>
            <p>🔨 Equipamento: {equipamento.nome}</p>
            {equipamento.serial && <p>📝 Serial: {equipamento.serial}</p>}
          </div>

          <button onClick={() => setEtapa(3)} className="btn-iniciar">
            🚀 Iniciar Instalação
          </button>
          <button onClick={() => setEtapa(1)} className="btn-voltar-etapa">
            ← Voltar
          </button>
        </div>
      )}

      {/* ETAPA 3: Foto do Instalado */}
      {etapa === 3 && (
        <div className="etapa-card">
          <h2>📸 Passo 3: Foto do Equipamento Instalado</h2>
          <p>Tire uma foto do equipamento já instalado</p>

          {!fotoInstalado ? (
            <div className="camera-container">
              <video ref={videoInstaladoRef} autoPlay playsInline className="camera-preview" />
              <canvas ref={canvasInstaladoRef} style={{ display: 'none' }} />
              
              {!streamInstalado ? (
                <button onClick={abrirCameraInstalado} className="btn-camera">
                  📷 Abrir Câmera
                </button>
              ) : (
                <button onClick={tirarFotoInstalado} className="btn-foto">
                  📸 Tirar Foto
                </button>
              )}
            </div>
          ) : (
            <div className="foto-preview">
              <img src={fotoInstalado} alt="Foto do Instalado" />
              <button onClick={refazerFotoInstalado} className="btn-refazer">
                🔄 Tirar Outra Foto
              </button>
              <button onClick={() => setEtapa(4)} className="btn-proximo">
                ➡️ Próximo
              </button>
            </div>
          )}
          
          <button onClick={() => setEtapa(2)} className="btn-voltar-etapa">
            ← Voltar
          </button>
        </div>
      )}

      {/* ETAPA 4: Assinatura do Cliente + Endereço */}
      {etapa === 4 && (
        <div className="etapa-card">
          <h2>✍️ Passo 4: Finalizar</h2>
          
          <div className="form-group">
            <label>📍 Endereço da Instalação</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Digite o endereço completo"
              className="input-endereco"
            />
          </div>

          <div className="form-group">
            <label>✍️ Assinatura do Cliente</label>
            <p className="info-text">Cliente deve assinar abaixo confirmando a instalação</p>
            <canvas
              ref={canvasAssinaturaRef}
              width={600}
              height={200}
              className="canvas-assinatura"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <button onClick={limparAssinatura} className="btn-limpar">
              🗑️ Limpar Assinatura
            </button>
          </div>

          {mensagem && (
            <div className={`mensagem ${mensagem.includes('✅') ? 'sucesso' : 'erro'}`}>
              {mensagem}
            </div>
          )}

          <button
            onClick={finalizarInstalacao}
            className="btn-finalizar"
            disabled={loading || !assinaturaCliente || !endereco.trim()}
          >
            {loading ? '⏳ Finalizando...' : '✅ Finalizar Instalação'}
          </button>
          
          <button onClick={() => setEtapa(3)} className="btn-voltar-etapa">
            ← Voltar
          </button>
        </div>
      )}
    </div>
  );
}
