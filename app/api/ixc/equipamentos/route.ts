import { NextRequest, NextResponse } from 'next/server';
import { buscarEquipamentosIXC, mapearEquipamentoIXC } from '@/lib/ixcsoft';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ixc/equipamentos
 * Busca equipamentos do IXC (sem sincronizar)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '100');

    const equipamentos = await buscarEquipamentosIXC(page, perPage);

    return NextResponse.json({
      sucesso: true,
      total: equipamentos.length,
      equipamentos: equipamentos.map(mapearEquipamentoIXC),
    });
  } catch (error: any) {
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
    const page = body.page || 1;
    const perPage = body.per_page || 100;
    const substituir = body.substituir === true; // Se true, atualiza equipamentos existentes

    // Busca equipamentos do IXC
    const equipamentosIXC = await buscarEquipamentosIXC(page, perPage);

    if (equipamentosIXC.length === 0) {
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
            // Atualiza equipamento existente
            await prisma.equipamento.update({
              where: { id: existente.id },
              data: {
                ...dadosMapeados,
                observacoes: `${existente.observacoes || ''}\nAtualizado do IXC em ${new Date().toLocaleString('pt-BR')}`,
              },
            });
            atualizados++;
            detalhes.push(`Atualizado: ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
          } else {
            // Pula equipamento existente
            detalhes.push(`Ignorado (ja existe): ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
          }
        } else {
          // Cria novo equipamento
          await prisma.equipamento.create({
            data: dadosMapeados,
          });
          importados++;
          detalhes.push(`Importado: ${dadosMapeados.nome} (Serial: ${dadosMapeados.serial || 'N/A'})`);
        }
      } catch (error: any) {
        erros++;
        detalhes.push(`Erro ao processar ${ixcEquip.descricao}: ${error.message}`);
        console.error('Erro ao processar equipamento IXC:', error);
      }
    }

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
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: error.message || 'Erro ao sincronizar equipamentos IXC' 
      },
      { status: 500 }
    );
  }
}
