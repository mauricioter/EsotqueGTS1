/**
 * Configurações de segurança da aplicação
 */

// Configurações de senha
export const PASSWORD_CONFIG = {
  minLength: 6,
  requireLetters: true,
  requireNumbers: true,
  requireSpecialChars: false,
  requireUppercase: false,
} as const;

// Configurações de sessão
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
  updateAge: 24 * 60 * 60, // Atualizar sessão a cada 24 horas
} as const;

// Configurações de rate limiting (para implementação futura)
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // máximo de 100 requisições por janela
} as const;

// Validações
export const VALIDATION = {
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cpfLength: 11,
  nomeMinLength: 3,
  nomeMaxLength: 100,
  serialMaxLength: 50,
  macLength: 17,
  macFormat: /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/,
} as const;

// Headers de segurança
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// Permissões por role
export const PERMISSIONS = {
  ADMIN: {
    canCreateEquipment: true,
    canEditEquipment: true,
    canDeleteEquipment: true,
    canApproveUsers: true,
    canViewUsers: true,
    canEditUsers: true,
    canViewDashboard: true,
  },
  OPERATOR: {
    canCreateEquipment: true,
    canEditEquipment: true,
    canDeleteEquipment: true,
    canApproveUsers: false,
    canViewUsers: false,
    canEditUsers: false,
    canViewDashboard: true,
  },
  VIEWER: {
    canCreateEquipment: false,
    canEditEquipment: false,
    canDeleteEquipment: false,
    canApproveUsers: false,
    canViewUsers: false,
    canEditUsers: false,
    canViewDashboard: true,
  },
} as const;

export type Role = keyof typeof PERMISSIONS;
export type Permission = keyof typeof PERMISSIONS.ADMIN;

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role || !PERMISSIONS[role]) return false;
  return PERMISSIONS[role][permission];
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  return VALIDATION.emailRegex.test(email);
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== VALIDATION.cpfLength) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validar primeiro dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  // Validar segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

/**
 * Valida senha de acordo com as configurações
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`Senha deve ter no mínimo ${PASSWORD_CONFIG.minLength} caracteres`);
  }
  
  if (PASSWORD_CONFIG.requireLetters && !/[a-zA-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra');
  }
  
  if (PASSWORD_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (PASSWORD_CONFIG.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida formato de MAC address
 */
export function validateMAC(mac: string): boolean {
  return VALIDATION.macFormat.test(mac);
}

/**
 * Sanitiza string para prevenir XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < e >
    .trim();
}
