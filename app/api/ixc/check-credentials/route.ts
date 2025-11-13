import { NextRequest, NextResponse } from 'next/server';

const IXC_API_URL = process.env.IXC_API_URL || '';
const IXC_API_USER = process.env.IXC_API_USER || '';
const IXC_API_PASSWORD = process.env.IXC_API_PASSWORD || '';

/**
 * GET /api/ixc/check-credentials
 * Verifica as credenciais configuradas
 */
export async function GET(request: NextRequest) {
  const credentials = Buffer.from(`${IXC_API_USER}:${IXC_API_PASSWORD}`).toString('base64');
  
  return NextResponse.json({
    configuracao: {
      url: IXC_API_URL,
      usuario: IXC_API_USER,
      senha_configurada: IXC_API_PASSWORD ? 'Sim (oculta)' : 'Nao',
      senha_tamanho: IXC_API_PASSWORD.length,
      basic_auth_header: `Basic ${credentials}`,
    },
    proximos_passos: [
      '1. Verifique se o usuario e senha estao corretos (mesmos do login do painel IXC)',
      '2. Acesse o IXC: Configuracoes > Configuracoes Gerais > API',
      '3. Verifique se o IP do servidor esta liberado',
      '4. Teste fazer login manual no painel IXC com essas credenciais',
    ],
  });
}
