import { NextRequest, NextResponse } from 'next/server';

const IXC_API_URL = process.env.IXC_API_URL || '';
const IXC_API_TOKEN = process.env.IXC_API_TOKEN || '';

/**
 * GET /api/ixc/info
 * Mostra exatamente o que esta sendo enviado para o IXC
 */
export async function GET(request: NextRequest) {
  // Exemplo 1: GET com query string
  const getUrl = `${IXC_API_URL}/su_oss_chamado?token=${IXC_API_TOKEN}&qtype=listar&maxresult=1`;
  
  // Exemplo 2: POST com form-urlencoded
  const formData = new URLSearchParams();
  formData.append('token', IXC_API_TOKEN);
  formData.append('qtype', 'listar');
  formData.append('maxresult', '1');
  
  const postFormBody = formData.toString();
  
  // Exemplo 3: POST com JSON
  const postJsonBody = JSON.stringify({
    token: IXC_API_TOKEN,
    qtype: 'listar',
    maxresult: 1,
  });

  return NextResponse.json({
    mensagem: 'Informacoes da requisicao para o IXC',
    
    metodo_1_GET: {
      metodo: 'GET',
      url: getUrl.replace(IXC_API_TOKEN, '[TOKEN_OCULTO]'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: null,
    },
    
    metodo_2_POST_FORM: {
      metodo: 'POST',
      url: `${IXC_API_URL}/su_oss_chamado`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postFormBody.replace(IXC_API_TOKEN, '[TOKEN_OCULTO]'),
      body_decoded: {
        token: '[TOKEN_OCULTO]',
        qtype: 'listar',
        maxresult: '1',
      },
    },
    
    metodo_3_POST_JSON: {
      metodo: 'POST',
      url: `${IXC_API_URL}/su_oss_chamado`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: postJsonBody.replace(IXC_API_TOKEN, '[TOKEN_OCULTO]'),
      body_parsed: {
        token: '[TOKEN_OCULTO]',
        qtype: 'listar',
        maxresult: 1,
      },
    },

    token_info: {
      formato: IXC_API_TOKEN.includes(':') ? 'ID:HASH' : 'HASH',
      exemplo: IXC_API_TOKEN.split(':')[0] + ':***',
      tamanho_total: IXC_API_TOKEN.length,
    },
  });
}
