/**
 * Funções utilitárias para a aplicação
 */

/**
 * Formata data para exibição em pt-BR
 */
export function formatarData(data: string | Date, incluirHora = true): string {
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }

    const options: Intl.DateTimeFormatOptions = incluirHora
      ? { dateStyle: 'short', timeStyle: 'short' }
      : { dateStyle: 'short' };

    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata CPF para exibição (000.000.000-00)
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '');
  
  if (numeros.length !== 11) {
    return cpf;
  }

  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF
 */
export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata endereço MAC (AA:BB:CC:DD:EE:FF)
 */
export function formatarMAC(mac: string): string {
  const limpo = mac.replace(/[^a-zA-Z0-9]/g, '');
  
  let formatado = '';
  for (let i = 0; i < limpo.length && i < 12; i += 2) {
    if (i > 0) formatado += ':';
    formatado += limpo.substring(i, i + 2);
  }
  
  return formatado.toUpperCase();
}

/**
 * Valida se uma string é vazia ou contém apenas espaços
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Trunca texto com ellipsis
 */
export function truncarTexto(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
}

/**
 * Gera um ID único simples (para uso em keys do React, não para banco)
 */
export function gerarIdUnico(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce para funções
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Aguarda um tempo específico (útil para delays)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Converte enum de status para texto legível
 */
export function statusParaTexto(status: string): string {
  const mapa: Record<string, string> = {
    DISPONIVEL: 'Disponível',
    EM_USO: 'Em Uso',
    EMPRESTADO: 'Emprestado',
    MANUTENCAO: 'Manutenção',
    SAIDA: 'Saída',
  };
  
  return mapa[status] || status;
}

/**
 * Converte role para texto legível em português
 */
export function roleParaTexto(role: string): string {
  const mapa: Record<string, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    VIEWER: 'Visualizador',
  };
  
  return mapa[role] || role;
}

/**
 * Converte status de usuário para texto legível
 */
export function userStatusParaTexto(status: string): string {
  const mapa: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
  };
  
  return mapa[status] || status;
}

/**
 * Copia texto para a área de transferência
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback para navegadores antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Baixa um arquivo JSON
 */
export function baixarJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formata número com separadores de milhar
 */
export function formatarNumero(numero: number): string {
  return new Intl.NumberFormat('pt-BR').format(numero);
}

/**
 * Calcula porcentagem
 */
export function calcularPorcentagem(valor: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((valor / total) * 100);
}

/**
 * Classifica array de objetos por uma propriedade
 */
export function ordenarPor<T>(
  array: T[],
  propriedade: keyof T,
  ordem: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valorA = a[propriedade];
    const valorB = b[propriedade];
    
    if (valorA < valorB) return ordem === 'asc' ? -1 : 1;
    if (valorA > valorB) return ordem === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Remove duplicatas de um array
 */
export function removerDuplicatas<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Agrupa array de objetos por uma propriedade
 */
export function agruparPor<T>(
  array: T[],
  propriedade: keyof T
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const chave = String(item[propriedade]);
    if (!acc[chave]) {
      acc[chave] = [];
    }
    acc[chave].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
