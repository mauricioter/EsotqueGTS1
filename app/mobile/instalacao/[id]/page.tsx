'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import './instalacao.css';

interface PhotoData {
  file: File | null;
  preview: string;
}

export default function InstalacaoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;

  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [endereco, setEndereco] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Photos
  const [fotoEquipamento, setFotoEquipamento] = useState<PhotoData>({ file: null, preview: '' });
  const [fotoSerial, setFotoSerial] = useState<PhotoData>({ file: null, preview: '' });
  const [fotoLocal, setFotoLocal] = useState<PhotoData>({ file: null, preview: '' });

  // Signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      const response = await fetch(`/api/equipamentos/${equipmentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setEquipment(data);
      } else {
        setError('Equipamento não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setError('GPS não disponível neste dispositivo');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
        setError('');
      },
      (error) => {
        setGpsLoading(false);
        setError('Erro ao capturar localização: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePhotoCapture = (type: 'equipamento' | 'serial' | 'local') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        const photoData = { file, preview };

        switch (type) {
          case 'equipamento':
            setFotoEquipamento(photoData);
            break;
          case 'serial':
            setFotoSerial(photoData);
            break;
          case 'local':
            setFotoLocal(photoData);
            break;
        }
      }
    };

    input.click();
  };

  // Signature Canvas Functions
  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
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
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/mobile/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro no upload');
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!endereco.trim()) {
      setError('Endereço é obrigatório');
      return;
    }

    if (!nomeCliente.trim()) {
      setError('Nome do cliente é obrigatório');
      return;
    }

    if (!fotoEquipamento.file || !fotoSerial.file || !fotoLocal.file) {
      setError('Todas as 3 fotos são obrigatórias');
      return;
    }

    if (!hasSignature) {
      setError('Assinatura do cliente é obrigatória');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Upload photos
      const [urlEquip, urlSerial, urlLocal] = await Promise.all([
        uploadPhoto(fotoEquipamento.file),
        uploadPhoto(fotoSerial.file),
        uploadPhoto(fotoLocal.file),
      ]);

      // Convert signature to base64
      const canvas = canvasRef.current;
      const assinatura = canvas?.toDataURL('image/png') || '';

      // Submit installation
      const response = await fetch('/api/mobile/instalacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipamentoId: parseInt(equipmentId),
          endereco,
          latitude,
          longitude,
          fotoEquipamento: urlEquip,
          fotoSerial: urlSerial,
          fotoLocal: urlLocal,
          assinaturaCliente: assinatura,
          nomeCliente,
          observacoes: observacoes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/mobile');
        }, 2000);
      } else {
        setError(data.error || 'Erro ao registrar instalação');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar instalação');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <h2>Instalação Registrada!</h2>
        <p>Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="instalacao-container">
      {/* Header */}
      <header className="instalacao-header">
        <button className="back-btn" onClick={() => router.back()}>
          ← Voltar
        </button>
        <h1>Registrar Instalação</h1>
      </header>

      {/* Equipment Info */}
      {equipment && (
        <div className="equipment-info">
          <h3>{equipment.nome}</h3>
          {equipment.serial && <p>Serial: {equipment.serial}</p>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="instalacao-form">
        {/* Address */}
        <div className="form-section">
          <label>Endereço da Instalação *</label>
          <textarea
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua, número, bairro, cidade..."
            rows={3}
            required
          />
        </div>

        {/* GPS */}
        <div className="form-section">
          <label>Localização GPS</label>
          <button
            type="button"
            className="gps-btn"
            onClick={captureGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? '📍 Capturando...' : latitude ? '✅ GPS Capturado' : '📍 Capturar Localização'}
          </button>
          {latitude && longitude && (
            <p className="gps-coords">
              Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* Photos */}
        <div className="form-section">
          <label>Fotos * (obrigatórias)</label>
          
          <div className="photo-grid">
            <div className="photo-item">
              <button type="button" onClick={() => handlePhotoCapture('equipamento')} className="photo-btn">
                {fotoEquipamento.preview ? (
                  <img src={fotoEquipamento.preview} alt="Equipamento" />
                ) : (
                  <span>📷 Equipamento</span>
                )}
              </button>
              <span className="photo-label">Equipamento</span>
            </div>

            <div className="photo-item">
              <button type="button" onClick={() => handlePhotoCapture('serial')} className="photo-btn">
                {fotoSerial.preview ? (
                  <img src={fotoSerial.preview} alt="Serial" />
                ) : (
                  <span>📷 Serial</span>
                )}
              </button>
              <span className="photo-label">Número Serial</span>
            </div>

            <div className="photo-item">
              <button type="button" onClick={() => handlePhotoCapture('local')} className="photo-btn">
                {fotoLocal.preview ? (
                  <img src={fotoLocal.preview} alt="Local" />
                ) : (
                  <span>📷 Local</span>
                )}
              </button>
              <span className="photo-label">Local Instalado</span>
            </div>
          </div>
        </div>

        {/* Client Name */}
        <div className="form-section">
          <label>Nome do Cliente *</label>
          <input
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Nome completo do cliente"
            required
          />
        </div>

        {/* Signature */}
        <div className="form-section">
          <label>Assinatura do Cliente *</label>
          <div className="signature-box">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <button type="button" onClick={clearSignature} className="clear-btn">
            🗑️ Limpar Assinatura
          </button>
        </div>

        {/* Notes */}
        <div className="form-section">
          <label>Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre a instalação..."
            rows={3}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? '⏳ Enviando...' : '✅ Registrar Instalação'}
        </button>
      </form>
    </div>
  );
}
