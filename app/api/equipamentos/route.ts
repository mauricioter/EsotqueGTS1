import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { StatusEquipamento } from '@prisma/client';

export async function GET() {
  try {
    const equipamentos = await prisma.equipamento.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(equipamentos, { status: 200 });
  } catch (error) {
    console.error('Falha ao listar equipamentos:', error);
    return NextResponse.json({ error: 'Falha ao listar equipamentos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Sem permissão para cadastrar equipamentos' }, { status: 403 });
    }

    const body = await req.json();

    // Validação básica
    if (!body.nome || !body.status) {
      return NextResponse.json({ error: 'Nome e status são obrigatórios' }, { status: 400 });
    }

    // Garante que o status é um valor válido do enum
    if (!Object.values(StatusEquipamento).includes(body.status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const novoEquipamento = await prisma.equipamento.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        serial: body.serial,
        mac: body.mac,
        status: body.status as StatusEquipamento,
        destino: body.destino,
        dataEntrada: body.dataEntrada ? new Date(body.dataEntrada) : new Date(),
      },
    });

    return NextResponse.json(novoEquipamento, { status: 201 });
  } catch (error) {
    console.error('Falha ao criar equipamento:', error);
    return NextResponse.json({ error: 'Falha ao criar equipamento' }, { status: 500 });
  }
}