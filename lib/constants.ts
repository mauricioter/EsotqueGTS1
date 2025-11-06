/**
 * Constantes da aplicação
 */

// Status de equipamentos
export const STATUS_EQUIPAMENTO = {
  DISPONIVEL: 'DISPONIVEL',
  EM_USO: 'EM_USO',
  EMPRESTADO: 'EMPRESTADO',
  MANUTENCAO: 'MANUTENCAO',
  SAIDA: 'SAIDA',
} as const;

export type StatusEquipamento = typeof STATUS_EQUIPAMENTO[keyof typeof STATUS_EQUIPAMENTO];

// Roles de usuário
export const ROLES = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Status de usuário
export const USER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Mensagens de erro comuns
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Você precisa estar logado para acessar este recurso',
  FORBIDDEN: 'Você não tem permissão para realizar esta ação',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação nos dados fornecidos',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  DUPLICATE_ERROR: 'Este registro já existe',
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  PENDING_APPROVAL: 'Sua conta está aguardando aprovação do administrador',
} as const;

// Mensagens de sucesso comuns
export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso!',
  UPDATED: 'Atualizado com sucesso!',
  DELETED: 'Excluído com sucesso!',
  SAVED: 'Salvo com sucesso!',
  APPROVED: 'Aprovado com sucesso!',
  REGISTERED: 'Cadastro realizado com sucesso!',
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts e delays
export const TIMEOUTS = {
  NOTIFICATION: 3000, // 3 segundos
  DEBOUNCE_SEARCH: 500, // 500ms
  REQUEST_TIMEOUT: 10000, // 10 segundos
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Limites de caracteres
export const LIMITS = {
  NOME_MIN: 3,
  NOME_MAX: 100,
  DESCRICAO_MAX: 500,
  SERIAL_MAX: 50,
  MAC_LENGTH: 17,
  CPF_LENGTH: 11,
  PASSWORD_MIN: 6,
  DESTINO_MAX: 100,
} as const;

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  USUARIOS: '/usuarios',
  API: {
    AUTH: '/api/auth',
    EQUIPAMENTOS: '/api/equipamentos',
    USUARIOS: '/api/usuarios',
    REGISTER: '/api/register',
    ADMIN_APPROVE: '/api/admin/usuarios/approve',
  },
} as const;

// Classes CSS de status
export const STATUS_CLASSES = {
  DISPONIVEL: 'status-disponivel',
  EM_USO: 'status-em-uso',
  EMPRESTADO: 'status-emprestado',
  MANUTENCAO: 'status-manutencao',
  SAIDA: 'status-saida',
} as const;

// Cores por status (para uso inline)
export const STATUS_COLORS = {
  DISPONIVEL: '#10b981', // verde
  EM_USO: '#3b82f6', // azul
  EMPRESTADO: '#f59e0b', // laranja
  MANUTENCAO: '#ef4444', // vermelho
  SAIDA: '#6b7280', // cinza
} as const;

// Emojis por status
export const STATUS_EMOJIS = {
  DISPONIVEL: '✅',
  EM_USO: '🔵',
  EMPRESTADO: '🟡',
  MANUTENCAO: '🔧',
  SAIDA: '📤',
} as const;

// Configurações de tema
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Códigos HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAC: /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/,
  SERIAL: /^[A-Z0-9-]+$/i,
} as const;

// Campos de busca disponíveis
export const SEARCH_FIELDS = [
  { value: 'all', label: 'Todos os campos' },
  { value: 'nome', label: 'Nome' },
  { value: 'serial', label: 'Número de Série' },
  { value: 'mac', label: 'Endereço MAC' },
  { value: 'destino', label: 'Local de Destino' },
  { value: 'status', label: 'Status' },
] as const;

// Opções de ordenação
export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Mais recentes' },
  { value: 'createdAt_asc', label: 'Mais antigos' },
  { value: 'nome_asc', label: 'Nome (A-Z)' },
  { value: 'nome_desc', label: 'Nome (Z-A)' },
  { value: 'status_asc', label: 'Status (A-Z)' },
] as const;

// Informações da aplicação
export const APP_INFO = {
  NAME: 'Sistema de Controle de Estoque GTS',
  SHORT_NAME: 'Estoque GTS',
  VERSION: '0.1.0',
  DESCRIPTION: 'Sistema completo de controle e gerenciamento de estoque de equipamentos',
  AUTHOR: 'GTS Sistemas',
  YEAR: 2025,
} as const;

// Links úteis
export const LINKS = {
  GITHUB: 'https://github.com/mauricioter/EsotqueGTS1',
  DOCUMENTATION: '/docs',
  SUPPORT: '/support',
} as const;
