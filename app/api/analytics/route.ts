import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dataInicio = searchParams.get('dataInicio');
  const dataFim = searchParams.get('dataFim');

  // Construir filtros de data
  const dateFilter: any = {};
  if (dataInicio) {
    dateFilter.gte = new Date(dataInicio + 'T00:00:00');
  }
  if (dataFim) {
    dateFilter.lte = new Date(dataFim + 'T23:59:59');
  }

  const whereDate = Object.keys(dateFilter).length > 0 ? { dataEntrada: dateFilter } : {};

  try {
    // Buscar todos os equipamentos com filtro de data
    const equipamentos = await prisma.equipamento.findMany({
      where: whereDate,
      select: {
        marca: true,
        tipo: true,
        status: true,
      }
    });

    // Total de equipamentos
    const totalEquipamentos = equipamentos.length;

    // Agrupar por marca
    const marcaMap = new Map<string, number>();
    equipamentos.forEach(eq => {
      const marca = eq.marca || 'Sem marca';
      marcaMap.set(marca, (marcaMap.get(marca) || 0) + 1);
    });
    const porMarca = Array.from(marcaMap.entries())
      .map(([marca, total]) => ({ marca, total }))
      .sort((a, b) => b.total - a.total);

    // Agrupar por tipo
    const tipoMap = new Map<string, number>();
    equipamentos.forEach(eq => {
      const tipo = eq.tipo || 'Sem tipo';
      tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
    });
    const porTipo = Array.from(tipoMap.entries())
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total);

    // Agrupar por status
    const statusMap = new Map<string, number>();
    equipamentos.forEach(eq => {
      const status = eq.status || 'Sem status';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const porStatus = Array.from(statusMap.entries())
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => b.total - a.total);

    // Calcular insights
    const marcaMaisPopular = porMarca.length > 0 ? porMarca[0].marca : 'N/A';
    const tipoMaisComum = porTipo.length > 0 ? porTipo[0].tipo : 'N/A';
    
    const disponiveis = equipamentos.filter(eq => eq.status === 'DISPONIVEL').length;
    const emUso = equipamentos.filter(eq => 
      eq.status === 'EM_USO' as any || 
      eq.status === 'EMPRESTADO' as any || 
      eq.status === 'INSTALADO' as any
    ).length;

    const taxaDisponibilidade = totalEquipamentos > 0 
      ? (disponiveis / totalEquipamentos) * 100 
      : 0;
    
    const taxaUtilizacao = totalEquipamentos > 0 
      ? (emUso / totalEquipamentos) * 100 
      : 0;

    return NextResponse.json({
      porMarca,
      porTipo,
      porStatus,
      totalEquipamentos,
      insights: {
        marcaMaisPopular,
        tipoMaisComum,
        taxaDisponibilidade,
        taxaUtilizacao,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json({ error: 'Erro ao buscar analytics' }, { status: 500 });
  }
}
