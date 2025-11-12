import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

interface EquipamentoImport {
  nome: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  descricao?: string;
  serial?: string;
  mac?: string;
  status?: string;
  destino?: string;
  tecnicoResponsavel?: string;
  observacoes?: string;
  localizacaoAtual?: string;
}

interface ValidationError {
  linha: number;
  campo: string;
  mensagem: string;
}

// Mapeia status da planilha para enum do banco
const statusMap: Record<string, string> = {
  'disponivel': 'DISPONIVEL',
  'disponível': 'DISPONIVEL',
  'em posse do tecnico': 'EM_POSSE_DO_TECNICO',
  'em posse do técnico': 'EM_POSSE_DO_TECNICO',
  'descartado': 'DESCARTADO',
  'saida': 'SAIDA',
  'saída': 'SAIDA',
  'reservado': 'RESERVADO',
  'defeito': 'DEFEITO',
  'instalado': 'INSTALADO',
  'equipamento de retorno': 'EQUIPAMENTO_DE_RETORNO',
};

function normalizeStatus(status?: string): string {
  if (!status) return 'DISPONIVEL';
  const normalized = status.toLowerCase().trim();
  return statusMap[normalized] || 'DISPONIVEL';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json({ 
        error: 'Não autorizado. Apenas administradores e operadores podem importar equipamentos.' 
      }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Ler o arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel/CSV
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converte para JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Planilha vazia' }, { status: 400 });
    }

    // Validar e normalizar dados
    const equipamentos: EquipamentoImport[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const linha = i + 2; // +2 porque linha 1 é cabeçalho e arrays começam em 0

      // Campo obrigatório: nome
      if (!row.nome && !row.Nome && !row.NOME) {
        errors.push({
          linha,
          campo: 'nome',
          mensagem: 'Nome é obrigatório'
        });
        continue;
      }

      const equipamento: EquipamentoImport = {
        nome: row.nome || row.Nome || row.NOME,
        tipo: row.tipo || row.Tipo || row.TIPO || undefined,
        marca: row.marca || row.Marca || row.MARCA || undefined,
        modelo: row.modelo || row.Modelo || row.MODELO || undefined,
        descricao: row.descricao || row.Descricao || row.descricão || row.Descrição || row.DESCRICAO || undefined,
        serial: row.serial || row.Serial || row.SERIAL || undefined,
        mac: row.mac || row.Mac || row.MAC || undefined,
        status: normalizeStatus(row.status || row.Status || row.STATUS),
        destino: row.destino || row.Destino || row.DESTINO || undefined,
        tecnicoResponsavel: row.tecnicoResponsavel || row.tecnico_responsavel || row['Técnico Responsável'] || row['tecnico responsavel'] || undefined,
        observacoes: row.observacoes || row.Observacoes || row.observações || row.Observações || row.OBSERVACOES || undefined,
        localizacaoAtual: row.localizacaoAtual || row.localizacao_atual || row['Localização Atual'] || row.localizacao || row.Localização || undefined,
      };

      equipamentos.push(equipamento);
    }

    // Se houver erros, retorna para revisão
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false,
        errors,
        message: `${errors.length} erro(s) encontrado(s). Corrija e tente novamente.`
      }, { status: 400 });
    }

    // Verificar duplicatas de serial e mac
    const serialsDuplicados: ValidationError[] = [];
    const macsDuplicados: ValidationError[] = [];

    for (let i = 0; i < equipamentos.length; i++) {
      const eq = equipamentos[i];
      const linha = i + 2;

      // Verificar serial duplicado no banco
      if (eq.serial) {
        const existente = await prisma.equipamento.findUnique({
          where: { serial: eq.serial },
          select: { id: true, nome: true }
        });
        
        if (existente) {
          serialsDuplicados.push({
            linha,
            campo: 'serial',
            mensagem: `Serial '${eq.serial}' já existe no equipamento '${existente.nome}'`
          });
        }
      }

      // Verificar MAC duplicado no banco
      if (eq.mac) {
        const existente = await prisma.equipamento.findUnique({
          where: { mac: eq.mac },
          select: { id: true, nome: true }
        });
        
        if (existente) {
          macsDuplicados.push({
            linha,
            campo: 'mac',
            mensagem: `MAC '${eq.mac}' já existe no equipamento '${existente.nome}'`
          });
        }
      }
    }

    const duplicatas = [...serialsDuplicados, ...macsDuplicados];
    if (duplicatas.length > 0) {
      return NextResponse.json({ 
        success: false,
        errors: duplicatas,
        message: `${duplicatas.length} duplicata(s) encontrada(s). Remova ou altere os valores duplicados.`
      }, { status: 400 });
    }

    // Importar em batch
    const resultado = await prisma.equipamento.createMany({
      data: equipamentos.map(eq => ({
        nome: eq.nome,
        tipo: eq.tipo,
        marca: eq.marca,
        modelo: eq.modelo,
        descricao: eq.descricao,
        serial: eq.serial,
        mac: eq.mac,
        status: eq.status as any,
        destino: eq.destino,
        tecnicoResponsavel: eq.tecnicoResponsavel,
        observacoes: eq.observacoes,
        localizacaoAtual: eq.localizacaoAtual,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `${resultado.count} equipamento(s) importado(s) com sucesso!`,
      count: resultado.count
    });

  } catch (error: any) {
    console.error('Erro ao importar equipamentos:', error);
    return NextResponse.json({ 
      error: 'Erro ao importar equipamentos',
      details: error.message 
    }, { status: 500 });
  }
}

// Rota para baixar modelo de planilha
export async function GET() {
  try {
    // Criar planilha modelo
    const modelo = [
      {
        nome: 'Exemplo Equipamento 1',
        tipo: 'Roteador',
        marca: 'TP-Link',
        modelo: 'Archer C6',
        descricao: 'Roteador dual band',
        serial: 'SN123456',
        mac: '00:11:22:33:44:55',
        status: 'disponivel',
        destino: '',
        tecnicoResponsavel: '',
        observacoes: '',
        localizacaoAtual: 'Estoque Principal'
      },
      {
        nome: 'Exemplo Equipamento 2',
        tipo: 'Switch',
        marca: 'Intelbras',
        modelo: 'SG 2404 QR',
        descricao: 'Switch 24 portas',
        serial: 'SN789012',
        mac: '00:11:22:33:44:66',
        status: 'disponivel',
        destino: '',
        tecnicoResponsavel: '',
        observacoes: '',
        localizacaoAtual: 'Estoque Principal'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(modelo);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipamentos');

    // Configurar largura das colunas
    worksheet['!cols'] = [
      { wch: 25 }, // nome
      { wch: 15 }, // tipo
      { wch: 15 }, // marca
      { wch: 15 }, // modelo
      { wch: 30 }, // descricao
      { wch: 15 }, // serial
      { wch: 20 }, // mac
      { wch: 15 }, // status
      { wch: 20 }, // destino
      { wch: 20 }, // tecnicoResponsavel
      { wch: 30 }, // observacoes
      { wch: 20 }, // localizacaoAtual
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modelo_importacao_equipamentos.xlsx"',
      },
    });

  } catch (error: any) {
    console.error('Erro ao gerar modelo:', error);
    return NextResponse.json({ 
      error: 'Erro ao gerar modelo de planilha',
      details: error.message 
    }, { status: 500 });
  }
}
