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
    // Estatísticas gerais (sempre sem filtro)
    const total = await prisma.equipamento.count();
    const disponiveis = await prisma.equipamento.count({ where: { status: 'DISPONIVEL' as any } });
    const emUso = await prisma.equipamento.count({ where: { status: 'EM_USO' as any } });
    const manutencao = await prisma.equipamento.count({ where: { status: 'MANUTENCAO' as any } });
    const saida = await prisma.equipamento.count({ where: { status: 'SAIDA' as any } });
    const reservado = await prisma.equipamento.count({ where: { status: 'RESERVADO' as any } });
    const defeito = await prisma.equipamento.count({ where: { status: 'DEFEITO' as any } });
    const emprestado = await prisma.equipamento.count({ where: { status: 'EMPRESTADO' as any } });
    const instalado = await prisma.equipamento.count({ where: { status: 'INSTALADO' as any } });
    const retorno = await prisma.equipamento.count({ where: { status: 'RETORNO' as any } });

    // Estatísticas de tempo
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const equipamentosHoje = await prisma.equipamento.count({ 
      where: { createdAt: { gte: hoje } } 
    });

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const equipamentosMes = await prisma.equipamento.count({ 
      where: { createdAt: { gte: inicioMes } } 
    });

    // Equipamentos recentes (com filtro de período se aplicável)
    const recentes = await prisma.equipamento.findMany({ 
      where: whereDate,
      orderBy: { dataEntrada: 'desc' }, 
      take: 6 
    });

    // Saídas recentes (com filtro de período se aplicável)
    const whereSaida: any = { status: 'SAIDA' as any };
    if (Object.keys(dateFilter).length > 0) {
      whereSaida.dataSaida = dateFilter;
    }

    const saidasRecentes = await prisma.equipamento.findMany({ 
      where: whereSaida,
      orderBy: { dataSaida: 'desc' }, 
      take: 6
    });

    // Instalações recentes (com filtro de período se aplicável)
    const whereInstalacao: any = { status: 'INSTALADO' as any };
    if (Object.keys(dateFilter).length > 0) {
      whereInstalacao.dataEntrada = dateFilter;
    }

    const instalacoes = await prisma.equipamento.findMany({ 
      where: whereInstalacao,
      orderBy: { dataEntrada: 'desc' }, 
      take: 6
    });

    // Retornos recentes (com filtro de período se aplicável)
    const whereRetorno: any = { status: 'RETORNO' as any };
    if (Object.keys(dateFilter).length > 0) {
      whereRetorno.dataEntrada = dateFilter;
    }

    const retornos = await prisma.equipamento.findMany({ 
      where: whereRetorno,
      orderBy: { dataEntrada: 'desc' }, 
      take: 6
    });

    return NextResponse.json({
      total,
      disponiveis,
      emUso,
      manutencao,
      saida,
      reservado,
      defeito,
      emprestado,
      instalado,
      retorno,
      equipamentosHoje,
      equipamentosMes,
      recentes,
      saidasRecentes,
      instalacoes,
      retornos,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
