import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Configuração da API
const API_CONFIG = {
  // Use caminho relativo para evitar CORS no dev; override via NEXT_PUBLIC_API_URL em produção
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
};

// Interface para resposta de erro padronizada
interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    // Adicionar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Log da requisição (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    // Log da resposta (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Resposta ${response.status} para ${response.config.url}`);
    }
    
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Tratamento de erros de rede
    if (!error.response) {
      console.error('[API] Erro de rede:', error.message);
      
      // Tentar novamente em caso de erro de rede
      if (originalRequest && !originalRequest._retry && API_CONFIG.retryAttempts > 0) {
        originalRequest._retry = true;
        
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
        
        try {
          return await api(originalRequest);
        } catch (retryError) {
          console.error('[API] Falha ao tentar novamente:', retryError);
        }
      }
      
      throw new Error('Erro de conexão. Verifique se o servidor está disponível.');
    }

    const { response } = error;
    const errorData = response.data;

    // Tratamento de erros HTTP específicos
    switch (response.status) {
      case 400:
        console.warn('[API] Requisição inválida:', errorData);
        throw new Error(errorData?.error || errorData?.message || 'Requisição inválida');
        
      case 401:
        console.warn('[API] Não autorizado');
        throw new Error('Você não tem permissão para realizar esta ação');
        
      case 404:
        console.warn('[API] Recurso não encontrado:', response.config.url);
        throw new Error('Recurso não encontrado');
        
      case 422:
        console.warn('[API] Erro de validação:', errorData);
        throw new Error(errorData?.error || errorData?.message || 'Dados inválidos');
        
      case 500:
        console.error('[API] Erro interno do servidor:', errorData);
        throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        
      default:
        console.error('[API] Erro não tratado:', response.status, errorData);
        throw new Error(errorData?.error || errorData?.message || 'Erro ao processar requisição');
    }
  }
);

// Função auxiliar para requisições com retry automático
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>(config);
    return response.data;
  } catch (error) {
    // O erro já foi tratado pelo interceptor
    throw error;
  }
}

export default api;
