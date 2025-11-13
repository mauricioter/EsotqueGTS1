import { NextRequest, NextResponse } from 'next/server';
import { testarConexaoIXC } from '@/lib/ixcsoft';

/**
 * GET /api/ixc/test
 * Testa conexao com IXC Soft
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Iniciando teste de conexao IXC');
    const resultado = await testarConexaoIXC();
    console.log('[API] Resultado:', resultado);
    
    return NextResponse.json(resultado, {
      status: resultado.sucesso ? 200 : 400,
    });
  } catch (error: any) {
    console.error('[API] Erro capturado:', error);
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: error.message || 'Erro ao testar conexao IXC' 
      },
      { status: 400 }
    );
  }
}
