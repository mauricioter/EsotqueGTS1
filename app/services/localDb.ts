import path from 'path';
import { promises as fs } from 'fs';

export type Equipamento = {
  id: string;
  nome: string;
  serial?: string | null;
  mac?: string | null;
  destino?: string | null;
  status: string;
  dataEntrada: string;
  dataSaida?: string | null;
};

type DbShape = 'array' | 'object';

const dbPath = path.join(process.cwd(), 'db.json');

async function ensureFile(): Promise<void> {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify([], null, 2), 'utf8');
  }
}

async function readRaw(): Promise<{ shape: DbShape; items: Equipamento[] }> {
  await ensureFile();
  const content = await fs.readFile(dbPath, 'utf8');
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return { shape: 'array', items: parsed as Equipamento[] };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.equipamentos)) {
      return { shape: 'object', items: parsed.equipamentos as Equipamento[] };
    }
  } catch {
    // fall through to default
  }
  return { shape: 'array', items: [] };
}

async function writeRaw(shape: DbShape, items: Equipamento[]): Promise<void> {
  const payload = shape === 'object' ? { equipamentos: items } : items;
  await fs.writeFile(dbPath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function listEquipamentosLocal(): Promise<Equipamento[]> {
  const { items } = await readRaw();
  return items;
}

export async function appendEquipamentoLocal(data: Omit<Equipamento, 'id'>): Promise<Equipamento> {
  const { shape, items } = await readRaw();
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const novo: Equipamento = { id, ...data };
  items.push(novo);
  await writeRaw(shape, items);
  return novo;
}

export async function updateEquipamentoByIdLocal(id: string, data: Partial<Equipamento>): Promise<Equipamento | null> {
  const { shape, items } = await readRaw();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const atual = items[idx];
  const atualizado: Equipamento = { ...atual, ...data, id: atual.id };
  items[idx] = atualizado;
  await writeRaw(shape, items);
  return atualizado;
}

export async function deleteEquipamentoByIdLocal(id: string): Promise<boolean> {
  const { shape, items } = await readRaw();
  const lenBefore = items.length;
  const restantes = items.filter((e) => e.id === id ? false : true);
  const changed = restantes.length !== lenBefore;
  if (changed) {
    await writeRaw(shape, restantes);
  }
  return changed;
}