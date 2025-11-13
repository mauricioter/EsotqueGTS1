import { NextRequest, NextResponse } from 'next/server';
import { buscarOrdensServicoIXC } from '@/lib/ixcsoft';

/**
 * GET /api/ixc/ordens-servico
 * Busca ordens de servico do IXC
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '100');
    const status = searchParams.get('status') || undefined;
    const dataInicio = searchParams.get('data_inicio') || undefined;
    const dataFim = searchParams.get('data_fim') || undefined;

    const ordensServico = await buscarOrdensServicoIXC(page, perPage, {
      status,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });

    return NextResponse.json({
      sucesso: true,
      total: ordensServico.length,
      ordens_servico: ordensServico,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: error.message || 'Erro ao buscar ordens de servico IXC' 
      },
      { status: 500 }
    );
  }
}
