import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { StatusEquipamento } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    const url = new URL(req.url);
    const tecnico = url.searchParams.get('tecnico');
    const where: any = {};

    if (tecnico && role === 'ADMIN') {
      where.tecnicoResponsavel = tecnico;
    } else if (session && role !== 'ADMIN') {
      if (session.user?.name) {
        where.tecnicoResponsavel = session.user.name;
      }
    }

    const equipamentos = await prisma.equipamento.findMany({
      where,
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

    // Validar serial duplicado
    if (body.serial) {
      const serialExistente = await prisma.equipamento.findUnique({
        where: { serial: body.serial }
      });
      if (serialExistente) {
        return NextResponse.json({ 
          error: `Serial "${body.serial}" já cadastrado no equipamento "${serialExistente.nome}"` 
        }, { status: 400 });
      }
    }

    // Validar MAC duplicado (apenas se MAC foi fornecido e não está vazio)
    if (body.mac && body.mac.trim() !== '') {
      const macExistente = await prisma.equipamento.findUnique({
        where: { mac: body.mac.trim() }
      });
      if (macExistente) {
        return NextResponse.json({ 
          error: `MAC "${body.mac}" já cadastrado no equipamento "${macExistente.nome}"` 
        }, { status: 400 });
      }
    }

    const novoEquipamento = await prisma.equipamento.create({
      data: {
        nome: body.nome,
        tipo: body.tipo || null,
        marca: body.marca || null,
        modelo: body.modelo || null,
        descricao: body.tipo ? `${body.tipo} - ${body.marca} ${body.modelo}` : body.observacoes,
        serial: body.serial || null,
        mac: body.mac && body.mac.trim() !== '' ? body.mac.trim() : null,
        status: body.status as StatusEquipamento,
        localizacaoAtual: body.localizacao || null,
        observacoes: body.observacoes || null,
      },
    });

    return NextResponse.json(novoEquipamento, { status: 201 });
  } catch (error) {
    console.error('Falha ao criar equipamento:', error);
    return NextResponse.json({ error: 'Falha ao criar equipamento' }, { status: 500 });
  }
}