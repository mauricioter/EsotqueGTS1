import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST /api/ferramentas/movimentar
 * Registra movimentacao de ferramenta (emprestimo/devolucao)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    if (!session) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json(
        { erro: 'Sem permissão' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      ferramentaId,
      tecnicoId,
      tecnicoNome,
      tipoMovimentacao,
      quantidade,
      dataPrevistaDevolucao,
      motivo,
      observacoes,
    } = body;

    if (!ferramentaId || !tecnicoNome || !tipoMovimentacao) {
      return NextResponse.json(
        { erro: 'Dados obrigatorios faltando' },
        { status: 400 }
      );
    }

    // Validação de data prevista para movimentos definitivos
    const definitivo = tipoMovimentacao === 'TRANSFERENCIA' || tipoMovimentacao === 'PERDA';
    if (definitivo && dataPrevistaDevolucao) {
      return NextResponse.json(
        { erro: 'Movimentações de Transferência ou Perda não devem ter previsão de devolução.' },
        { status: 400 }
      );
    }

    // Busca a ferramenta
    const ferramenta = await prisma.ferramenta.findUnique({
      where: { id: ferramentaId },
    });

    if (!ferramenta) {
      return NextResponse.json(
        { erro: 'Ferramenta nao encontrada' },
        { status: 404 }
      );
    }

    const qtd = quantidade || 1;

    // Valida quantidade disponivel para emprestimo
    if (tipoMovimentacao === 'EMPRESTIMO') {
      const disponiveis = ferramenta.quantidadeTotal - ferramenta.quantidadeEmUso;
      if (qtd > disponiveis) {
        return NextResponse.json(
          { erro: `Apenas ${disponiveis} unidade(s) disponivel(is)` },
          { status: 400 }
        );
      }
    }

    // Cria a movimentacao
    // Em movimentos definitivos, ignorar previsao de devolucao
    const isDefinitivo = tipoMovimentacao === 'TRANSFERENCIA' || tipoMovimentacao === 'PERDA';

    const movimentacao = await prisma.movimentacaoFerramenta.create({
      data: {
        ferramentaId,
        tecnicoId,
        tecnicoNome,
        tipoMovimentacao,
        quantidade: qtd,
        dataPrevistaDevolucao: definitivo ? null : (dataPrevistaDevolucao ? new Date(dataPrevistaDevolucao) : null),
        dataDevolucaoReal: tipoMovimentacao === 'DEVOLUCAO' ? new Date() : null,
        motivo,
        observacoes,
      },
    });

    // Atualiza o status da ferramenta
    let novoStatus = ferramenta.status;
    let novaQuantidadeEmUso = ferramenta.quantidadeEmUso;
    let novaQuantidadeTotal = ferramenta.quantidadeTotal;

    if (tipoMovimentacao === 'EMPRESTIMO') {
      novaQuantidadeEmUso += qtd;
      novoStatus = novaQuantidadeEmUso >= ferramenta.quantidadeTotal ? 'EM_USO' : 'DISPONIVEL'; 
    } else if (tipoMovimentacao === 'TRANSFERENCIA') {
      novaQuantidadeEmUso = Math.max(0, novaQuantidadeEmUso - qtd);
      novaQuantidadeTotal = Math.max(0, novaQuantidadeTotal - qtd);
      novoStatus = novaQuantidadeEmUso > 0 ? 'EM_USO' : 'DISPONIVEL';
    } else if (tipoMovimentacao === 'MANUTENCAO') {
      novoStatus = 'EM_MANUTENCAO';
    } else if (tipoMovimentacao === 'PERDA') { 
      novoStatus = 'PERDIDA';
      novaQuantidadeTotal = Math.max(0, novaQuantidadeTotal - qtd);
      novaQuantidadeEmUso = Math.max(0, novaQuantidadeEmUso - qtd);
    } else if (tipoMovimentacao === 'DEVOLUCAO') {
      novaQuantidadeEmUso = Math.max(0, novaQuantidadeEmUso - qtd);
      novoStatus = novaQuantidadeEmUso > 0 ? 'EM_USO' : 'DISPONIVEL';
    }

    await prisma.ferramenta.update({
      where: { id: ferramentaId },
      data: {
        quantidadeEmUso: novaQuantidadeEmUso,
        quantidadeTotal: novaQuantidadeTotal,
        status: novoStatus,
      },
    });

    return NextResponse.json({
      mensagem: 'Movimentacao registrada com sucesso',
      movimentacao,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar movimentacao:', error);
    return NextResponse.json(
      { erro: 'Erro ao registrar movimentacao' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ferramentas/movimentar
 * Lista historico de movimentacoes
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query params
    const ferramentaIdParam = searchParams.get('ferramentaId');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const openParam = searchParams.get('open');
    const campoParam = searchParams.get('campo');
    const personalParam = searchParams.get('personal');

    // Validação/normalização
    const ferramentaId = ferramentaIdParam !== null ? ferramentaIdParam : undefined;

    const page = pageParam ? Number(pageParam) : 1;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 20;

    if (!Number.isFinite(page) || page < 1) {
      return NextResponse.json(
        { erro: 'Parâmetro "page" inválido. Use um inteiro >= 1.' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { erro: 'Parâmetro "pageSize" inválido. Use um inteiro entre 1 e 100.' },
        { status: 400 }
      );
    }

    const where = {
      ...(ferramentaId !== undefined ? { ferramentaId } : {}),
    };

    const [total, movimentacoes] = await Promise.all([
      prisma.movimentacaoFerramenta.count({ where }),
      prisma.movimentacaoFerramenta.findMany({
        where,
        select: {
          id: true,
          tipoMovimentacao: true,
          quantidade: true,
          dataRetirada: true,
          dataPrevistaDevolucao: true,
          dataDevolucaoReal: true,
          tecnicoNome: true,
          motivo: true,
          observacoes: true,
          ferramentaId: true,
          ferramenta: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Se filtrado por ferramenta, incluir um resumo agregado
    let summary: any | undefined = undefined;
    if (ferramentaId) {
      const allMovs = await prisma.movimentacaoFerramenta.findMany({
        where: { ferramentaId },
        select: {
          tipoMovimentacao: true,
          quantidade: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const sum = (tipo: string) =>
        allMovs.filter(m => m.tipoMovimentacao === tipo).reduce((acc, m) => acc + (m.quantidade || 0), 0);

      const totalEmprestimo = sum('EMPRESTIMO');
      const totalDevolucao = sum('DEVOLUCAO');
      const perdasAcumuladas = sum('PERDA');
      const transferenciasAcumuladas = sum('TRANSFERENCIA');

      summary = {
        emprestimosEmAberto: Math.max(0, totalEmprestimo - totalDevolucao),
        perdasAcumuladas,
        transferenciasAcumuladas,
        ultimaMovimentacaoEm: allMovs[0]?.createdAt || null,
      };
    }

    // Se solicitado "open" (abertos), retornar agrupado por técnico/ferramenta
    let abertos: any[] | undefined = undefined;
    if (openParam === 'true') {
      const allMovs = await prisma.movimentacaoFerramenta.findMany({
        select: {
          tipoMovimentacao: true,
          quantidade: true,
          motivo: true,
          tecnicoNome: true,
          ferramentaId: true,
          ferramenta: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const grupo = new Map<string, { tecnicoNome: string; ferramentaId: string; ferramenta: {id: string; nome: string}; saldo: number }>();
      for (const m of allMovs) {
        const key = `${m.tecnicoNome}::${m.ferramentaId}`;
        if (!grupo.has(key)) {
          grupo.set(key, { tecnicoNome: m.tecnicoNome, ferramentaId: m.ferramentaId, ferramenta: m.ferramenta as any, saldo: 0 });
        }
        const item = grupo.get(key)!;
        if (m.tipoMovimentacao === 'EMPRESTIMO') {
          if (campoParam === 'true') {
            if ((m.motivo || '') === 'LEVADO_PARA_CAMPO') item.saldo += m.quantidade;
          } else if (personalParam === 'true') {
            // pessoal considera transferencias com motivo ENTREGAPESSOAL
            // EMPRESTIMO não entra
          } else {
            item.saldo += m.quantidade;
          }
        }
        if (m.tipoMovimentacao === 'DEVOLUCAO' || m.tipoMovimentacao === 'TRANSFERENCIA' || m.tipoMovimentacao === 'PERDA') {
          item.saldo -= m.quantidade;
        }
      }
      let result = Array.from(grupo.values()).filter(g => g.saldo > 0);

      if (personalParam === 'true') {
        const allTransf = await prisma.movimentacaoFerramenta.findMany({
          select: {
            tipoMovimentacao: true,
            quantidade: true,
            motivo: true,
            tecnicoNome: true,
            ferramentaId: true,
            ferramenta: { select: { id: true, nome: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        const grupoPessoal = new Map<string, { tecnicoNome: string; ferramentaId: string; ferramenta: {id: string; nome: string}; saldo: number }>();
        for (const m of allTransf) {
          const key = `${m.tecnicoNome}::${m.ferramentaId}`;
          if (!grupoPessoal.has(key)) {
            grupoPessoal.set(key, { tecnicoNome: m.tecnicoNome, ferramentaId: m.ferramentaId, ferramenta: m.ferramenta as any, saldo: 0 });
          }
          const item = grupoPessoal.get(key)!;
          if (m.tipoMovimentacao === 'TRANSFERENCIA' && (m.motivo || '') === 'ENTREGA_PESSOAL') item.saldo += m.quantidade;
          if (m.tipoMovimentacao === 'DEVOLUCAO') item.saldo -= m.quantidade;
          if (m.tipoMovimentacao === 'PERDA') item.saldo -= m.quantidade;
        }
        result = Array.from(grupoPessoal.values()).filter(g => g.saldo > 0);
      }

      abertos = result;
    }

    // Resumo global: emprestimos em aberto total
    let summaryAll: any | undefined = undefined;
    if (!ferramentaId) {
      const grouped = await prisma.movimentacaoFerramenta.groupBy({
        by: ['tipoMovimentacao'],
        _sum: { quantidade: true },
      });
      const getSum = (tipo: string) => grouped.find(g => g.tipoMovimentacao === tipo)?._sum?.quantidade || 0;
      const totalEmp = getSum('EMPRESTIMO');
      const totalDev = getSum('DEVOLUCAO');
      const totalTransf = getSum('TRANSFERENCIA');
      const totalPerda = getSum('PERDA');
      summaryAll = {
        emprestimosEmAbertoTotal: Math.max(0, totalEmp - totalDev - totalTransf - totalPerda),
      };
    }

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages,
      movimentacoes,
      ...(summary ? { summary } : {}),
      ...(summaryAll ? { summaryAll } : {}),
      ...(abertos ? { abertos } : {}),
    });
  } catch (error: any) {
    console.error('Erro ao buscar movimentacoes:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar movimentacoes' },
      { status: 500 }
    );
  }
}