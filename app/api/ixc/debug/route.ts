import { NextRequest, NextResponse } from 'next/server';

const IXC_API_URL = process.env.IXC_API_URL || '';
const IXC_API_TOKEN = process.env.IXC_API_TOKEN || '';

/**
 * GET /api/ixc/debug
 * Testa diferentes formatos de autenticacao do IXC
 */
export async function GET(request: NextRequest) {
  const resultados = [];

  // Teste 1: GET com token na query string
  try {
    console.log('\n=== TESTE 1: GET com token na query ===');
    const url1 = `${IXC_API_URL}/su_oss_chamado?token=${IXC_API_TOKEN}&qtype=listar&maxresult=1`;
    console.log('URL:', url1.replace(IXC_API_TOKEN, '***TOKEN***'));
    
    const res1 = await fetch(url1);
    console.log('Status:', res1.status);
    
    resultados.push({
      metodo: 'GET com token na query',
      status: res1.status,
      sucesso: res1.ok,
    });
  } catch (error: any) {
    resultados.push({
      metodo: 'GET com token na query',
      erro: error.message,
    });
  }

  // Teste 2: POST com form-urlencoded
  try {
    console.log('\n=== TESTE 2: POST com form-urlencoded ===');
    const url2 = `${IXC_API_URL}/su_oss_chamado`;
    console.log('URL:', url2);
    
    const formData = new URLSearchParams();
    formData.append('token', IXC_API_TOKEN);
    formData.append('qtype', 'listar');
    formData.append('maxresult', '1');
    
    const res2 = await fetch(url2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    console.log('Status:', res2.status);
    
    resultados.push({
      metodo: 'POST com form-urlencoded',
      status: res2.status,
      sucesso: res2.ok,
    });
  } catch (error: any) {
    resultados.push({
      metodo: 'POST com form-urlencoded',
      erro: error.message,
    });
  }

  // Teste 3: POST com JSON
  try {
    console.log('\n=== TESTE 3: POST com JSON ===');
    const url3 = `${IXC_API_URL}/su_oss_chamado`;
    console.log('URL:', url3);
    
    const res3 = await fetch(url3, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: IXC_API_TOKEN,
        qtype: 'listar',
        maxresult: 1,
      }),
    });
    console.log('Status:', res3.status);
    
    resultados.push({
      metodo: 'POST com JSON',
      status: res3.status,
      sucesso: res3.ok,
    });
  } catch (error: any) {
    resultados.push({
      metodo: 'POST com JSON',
      erro: error.message,
    });
  }

  return NextResponse.json({
    mensagem: 'Testes de autenticacao concluidos',
    config: {
      url: IXC_API_URL,
      token_format: IXC_API_TOKEN.split(':')[0] + ':***',
    },
    resultados,
  });
}
