'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Instalacao {
  id: string;
  tecnicoNome: string;
  clienteNome: string;
  clienteEndereco: string;
  equipamento: string;
  numeroSerie: string;
  fotos: string[];
  assinaturaCliente?: string;
  latitude?: number;
  longitude?: number;
  status: 'em_andamento' | 'concluida' | 'pendente';
  observacoes?: string;
  dataInicio: string;
  dataConclusao?: string;
}

export default function InstalacoesPage() {
  const [instalacoes, setInstalacoes] = useState<Instalacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const router = useRouter();

  const carregarInstalacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instalacoes');
      const data = await response.json();
      setInstalacoes(data.instalacoes || []);
    } catch (error) {
      console.error('Erro ao carregar instalações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarInstalacoes();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarInstalacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const instalacoesFiltradas = instalacoes.filter((instalacao) => {
    if (filtroStatus === 'todas') return true;
    return instalacao.status === filtroStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      em_andamento: 'bg-blue-100 text-blue-800',
      concluida: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      pendente: 'Pendente',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instalações</h1>
            <p className="text-gray-600 mt-2">Acompanhe todas as instalações em tempo real</p>
          </div>
          <button
            onClick={carregarInstalacoes}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'todas' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Todas ({instalacoes.length})
            </button>
            <button
              onClick={() => setFiltroStatus('em_andamento')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'em_andamento' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Em Andamento ({instalacoes.filter(i => i.status === 'em_andamento').length})
            </button>
            <button
              onClick={() => setFiltroStatus('concluida')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'concluida' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Concluídas ({instalacoes.filter(i => i.status === 'concluida').length})
            </button>
            <button
              onClick={() => setFiltroStatus('pendente')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'pendente' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pendentes ({instalacoes.filter(i => i.status === 'pendente').length})
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {instalacoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma instalação encontrada</p>
            </div>
          ) : (
            instalacoesFiltradas.map((instalacao) => (
              <div key={instalacao.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{instalacao.clienteNome}</h3>
                      <p className="text-gray-600 mt-1">{instalacao.clienteEndereco}</p>
                    </div>
                    {getStatusBadge(instalacao.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Técnico</p>
                      <p className="font-medium">{instalacao.tecnicoNome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Equipamento</p>
                      <p className="font-medium">{instalacao.equipamento}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Número de Série</p>
                      <p className="font-medium">{instalacao.numeroSerie}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data de Início</p>
                      <p className="font-medium">
                        {new Date(instalacao.dataInicio).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {instalacao.observacoes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Observações</p>
                      <p className="text-gray-700">{instalacao.observacoes}</p>
                    </div>
                  )}

                  {instalacao.fotos && instalacao.fotos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Fotos ({instalacao.fotos.length})</p>
                      <div className="flex gap-2 overflow-x-auto">
                        {instalacao.fotos.map((foto, index) => (
                          <img
                            key={index}
                            src={foto}
                            alt={`Foto ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                            onClick={() => window.open(foto, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {instalacao.assinaturaCliente && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Assinatura do Cliente</p>
                      <img
                        src={instalacao.assinaturaCliente}
                        alt="Assinatura"
                        className="h-24 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  )}

                  {instalacao.latitude && instalacao.longitude && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📍</span>
                      <a
                        href={`https://www.google.com/maps?q=${instalacao.latitude},${instalacao.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Ver localização no mapa
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
