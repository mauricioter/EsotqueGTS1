import { NextRequest, NextResponse } from 'next/server';
import { buscarEquipamentosIXC, mapearEquipamentoIXC } from '@/lib/ixcsoft';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/ixc/equipamentos
 * Busca equipamentos do IXC (sem sincronizar)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '100');

    logger.info({ page, perPage }, 'Buscando equipamentos do IXC');
    const equipamentos = await buscarEquipamentosIXC(page, perPage);
    logger.info({ total: equipamentos.length }, 'Equipamentos IXC encontrados');
    return NextResponse.json({
      sucesso: true,
      total: equipamentos.length,
      equipamentos: equipamentos.map(mapearEquipamentoIXC),
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Erro ao buscar equipamentos IXC');
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: error.message || 'Erro ao buscar equipamentos IXC' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ixc/equipamentos
 * Sincroniza equipamentos do IXC para o banco local
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { page, per_page, substituir } = body;
    page = parseInt(page) || 1;
    per_page = parseInt(per_page) || 100;
    substituir = substituir === true;

    if (isNaN(page) || page < 1) {
      logger.warn({ body }, 'Parâmetro page inválido na sincronização IXC');
      return NextResponse.json({ sucesso: false, mensagem: 'Parâmetro page inválido.' }, { status: 400 });
    }
    if (isNaN(per_page) || per_page < 1 || per_page > 1000) {
      logger.warn({ body }, 'Parâmetro per_page inválido na sincronização IXC');
      return NextResponse.json({ sucesso: false, mensagem: 'Parâmetro per_page inválido (1-1000).' }, { status: 400 });
    }

    // Busca equipamentos do IXC
    logger.info({ page, per_page, substituir }, 'Sincronizando equipamentos do IXC');
    const equipamentosIXC = await buscarEquipamentosIXC(page, per_page);

    if (equipamentosIXC.length === 0) {
      logger.warn('Nenhum equipamento encontrado no IXC');
      return NextResponse.json({
        sucesso: true,
        mensagem: 'Nenhum equipamento encontrado no IXC',
        importados: 0,
        atualizados: 0,
        erros: 0,
      });
    }

    let importados = 0;
    let atualizados = 0;
    let erros = 0;
    const detalhes: string[] = [];

    // Processa cada equipamento
    for (const ixcEquip of equipamentosIXC) {
      try {
        const dadosMapeados = mapearEquipamentoIXC(ixcEquip);
        // Verifica se equipamento ja existe (por serial ou MAC)
        const existente = await prisma.equipamento.findFirst({
          where: {
            OR: [
              { serial: dadosMapeados.serial || undefined },
              { mac: dadosMapeados.mac || undefined },
            ].filter(Boolean),
          },
        });

        if (existente) {
          if (substituir) {
            await prisma.equipamento.update({
              where: { id: existente.id },
              data: {
                ...dadosMapeados,
                observacoes: `${existente.observacoes || ''}\nAtualizado do IXC em ${new Date().toLocaleString('pt-BR')}`,
              },
            });
            atualizados++;
            detalhes.push(`Atualizado: ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
            logger.info({ id: existente.id, nome: dadosMapeados.nome }, 'Equipamento atualizado do IXC');
          } else {
            detalhes.push(`Ignorado (ja existe): ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
            logger.info({ nome: dadosMapeados.nome }, 'Equipamento já existente, ignorado');
          }
        } else {
          const novo = await prisma.equipamento.create({
            data: dadosMapeados,
          });
          importados++;
          detalhes.push(`Importado: ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
          logger.info({ id: novo.id, nome: novo.nome }, 'Novo equipamento importado do IXC');
        }
      } catch (error: any) {
        erros++;
        detalhes.push(`Erro ao processar ${ixcEquip.descricao}: ${error.message}`);
        logger.error({ err: error, equipamento: ixcEquip }, 'Erro ao processar equipamento IXC');
      }
    }

    logger.info({ importados, atualizados, erros, total: equipamentosIXC.length }, 'Sincronização IXC concluída');
    return NextResponse.json({
      sucesso: true,
      mensagem: `Sincronizacao concluida: ${importados} importados, ${atualizados} atualizados, ${erros} erros`,
      importados,
      atualizados,
      erros,
      total: equipamentosIXC.length,
      detalhes,
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Erro ao sincronizar equipamentos IXC');
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: error.message || 'Erro ao sincronizar equipamentos IXC' 
      },
      { status: 500 }
    );
  }
}
