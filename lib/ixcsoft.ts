/**
 * Servico de integracao com IXC Soft
 * Permite buscar equipamentos, OS e outros dados do IXC
 */

const IXC_API_URL = process.env.IXC_API_URL || '';
const IXC_API_USER = process.env.IXC_API_USER || '';
const IXC_API_PASSWORD = process.env.IXC_API_PASSWORD || '';

interface IXCResponse<T> {
  type: string;
  total: number;
  page: number;
  per_page: number;
  registros: T[];
}

interface IXCEquipamento {
  id: string;
  descricao: string;
  marca?: string;
  modelo?: string;
  serial?: string;
  mac?: string;
  tipo?: string;
  status?: string;
  observacao?: string;
}

interface IXCOrdemServico {
  id: string;
  numero_os: string;
  cliente_id: string;
  cliente_nome: string;
  tecnico_id?: string;
  tecnico_nome?: string;
  status: string;
  data_abertura: string;
  data_fechamento?: string;
  descricao: string;
  equipamentos?: string[];
}

/**
 * Faz requisicao autenticada para API do IXC
 * IXC usa formato: POST com Basic Auth, header customizado e body JSON
 */
async function ixcRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<IXCResponse<T>> {
  if (!IXC_API_URL || !IXC_API_USER || !IXC_API_PASSWORD) {
    throw new Error('Credenciais IXC nao configuradas. Configure IXC_API_URL, IXC_API_USER e IXC_API_PASSWORD no .env.local');
  }

  const url = `${IXC_API_URL}/${endpoint}`;

  // Cria Basic Auth em base64
  const credentials = Buffer.from(`${IXC_API_USER}:${IXC_API_PASSWORD}`).toString('base64');

  // Prepara body com parametros default do IXC
  const body = {
    page: "1",
    rp: "1000",
    sortname: "id",
    sortorder: "desc",
    ...params,
  };

  console.log('[IXC] URL:', url);
  console.log('[IXC] User:', IXC_API_USER);
  console.log('[IXC] Body:', JSON.stringify(body, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'ixcsoft': 'listar',
      },
      body: JSON.stringify(body),
    });

    console.log('[IXC] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IXC] Erro na resposta:', errorText.substring(0, 300));
      
      if (response.status === 401) {
        throw new Error(`Erro de autenticacao (401). Verifique o usuario e senha no .env.local (use as mesmas do painel IXC)`);
      }
      
      throw new Error(`Erro IXC API: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    console.log('[IXC] Resposta recebida com sucesso. Total registros:', data.total || 0);
    return data;
  } catch (error: any) {
    console.error('[IXC] Erro ao conectar:', error.message);
    throw error;
  }
}

/**
 * Busca equipamentos do estoque do IXC
 */
export async function buscarEquipamentosIXC(page = 1, perPage = 100): Promise<IXCEquipamento[]> {
  try {
    const response = await ixcRequest<IXCEquipamento>('equipamentos', {
      page,
      per_page: perPage,
    });

    return response.registros || [];
  } catch (error) {
    console.error('Erro ao buscar equipamentos IXC:', error);
    throw error;
  }
}

/**
 * Busca ordens de servico do IXC
 */
export async function buscarOrdensServicoIXC(
  page = 1,
  perPage = 100,
  filtros?: {
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }
): Promise<IXCOrdemServico[]> {
  try {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };

    if (filtros?.status) params.status = filtros.status;
    if (filtros?.data_inicio) params.data_inicio = filtros.data_inicio;
    if (filtros?.data_fim) params.data_fim = filtros.data_fim;

    const response = await ixcRequest<IXCOrdemServico>('ordens_servico', params);

    return response.registros || [];
  } catch (error) {
    console.error('Erro ao buscar OS IXC:', error);
    throw error;
  }
}

/**
 * Busca um equipamento especifico por serial
 */
export async function buscarEquipamentoPorSerialIXC(serial: string): Promise<IXCEquipamento | null> {
  try {
    const response = await ixcRequest<IXCEquipamento>('equipamentos', {
      qtype: 'serial',
      query: serial,
    });

    return response.registros?.[0] || null;
  } catch (error) {
    console.error('Erro ao buscar equipamento por serial:', error);
    return null;
  }
}

/**
 * Mapeia equipamento IXC para formato do sistema
 */
export function mapearEquipamentoIXC(ixcEquip: IXCEquipamento) {
  return {
    nome: ixcEquip.descricao || 'Equipamento IXC',
    tipo: ixcEquip.tipo || 'IMPORTADO',
    marca: ixcEquip.marca || '',
    modelo: ixcEquip.modelo || '',
    serial: ixcEquip.serial || undefined,
    mac: ixcEquip.mac || undefined,
    descricao: ixcEquip.observacao || `Importado do IXC (ID: ${ixcEquip.id})`,
    status: mapearStatusIXC(ixcEquip.status) as any,
    observacoes: `Origem: IXC Soft | ID: ${ixcEquip.id}`,
  };
}

/**
 * Mapeia status do IXC para status do sistema
 */
function mapearStatusIXC(statusIXC?: string): 'DISPONIVEL' | 'INSTALADO' | 'DEFEITO' | 'EM_POSSE_DO_TECNICO' {
  const mapeamento: Record<string, 'DISPONIVEL' | 'INSTALADO' | 'DEFEITO' | 'EM_POSSE_DO_TECNICO'> = {
    'disponivel': 'DISPONIVEL',
    'em_uso': 'INSTALADO',
    'manutencao': 'DEFEITO',
    'danificado': 'DEFEITO',
    'baixado': 'DEFEITO',
    'em_estoque': 'DISPONIVEL',
  };

  return mapeamento[statusIXC?.toLowerCase() || ''] || 'DISPONIVEL';
}

/**
 * Testa conexao com IXC
 */
export async function testarConexaoIXC(): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    await buscarEquipamentosIXC(1, 1);
    return {
      sucesso: true,
      mensagem: 'Conexao com IXC estabelecida com sucesso',
    };
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao conectar com IXC',
    };
  }
}
