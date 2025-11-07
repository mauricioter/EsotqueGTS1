import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { StatusEquipamento } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipamento = await prisma.equipamento.findUnique({
      where: { id },
    });

    if (!equipamento) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(equipamento, { status: 200 });
  } catch (error) {
    console.error('Falha ao buscar equipamento:', error);
    return NextResponse.json({ error: 'Falha ao buscar equipamento' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Sem permissão para atualizar equipamentos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Garante que o status é um valor válido do enum, se fornecido
    if (body.status && !Object.values(StatusEquipamento).includes(body.status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Validar serial duplicado (se estiver sendo alterado)
    if (body.serial) {
      const serialExistente = await prisma.equipamento.findUnique({
        where: { serial: body.serial }
      });
      if (serialExistente && serialExistente.id !== id) {
        return NextResponse.json({ 
          error: `Serial "${body.serial}" já cadastrado no equipamento "${serialExistente.nome}"` 
        }, { status: 400 });
      }
    }

    // Validar MAC duplicado (se estiver sendo alterado)
    if (body.mac) {
      const macExistente = await prisma.equipamento.findUnique({
        where: { mac: body.mac }
      });
      if (macExistente && macExistente.id !== id) {
        return NextResponse.json({ 
          error: `MAC "${body.mac}" já cadastrado no equipamento "${macExistente.nome}"` 
        }, { status: 400 });
      }
    }

    const dataToUpdate: any = { ...body };
    if (body.dataSaida) {
      dataToUpdate.dataSaida = new Date(body.dataSaida);
    }

    const equipamentoAtualizado = await prisma.equipamento.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(equipamentoAtualizado, { status: 200 });
  } catch (error) {
    console.error('Falha ao atualizar equipamento:', error);
    // Adicionar verificação de erro do Prisma para "não encontrado"
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar equipamento' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    const role = (session as any)?.role;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Sem permissão para excluir equipamentos' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.equipamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Equipamento excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Falha ao excluir equipamento:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao excluir equipamento' }, { status: 500 });
  }
}