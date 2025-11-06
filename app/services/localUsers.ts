import path from 'path';
import { promises as fs } from 'fs';

export type Usuario = {
  id: string;
  nomeCompleto: string;
  numero: string; // telefone ou matrícula
  email: string;
  cpf: string;
  dataCadastro: string;
};

const usersPath = path.join(process.cwd(), 'users.json');

async function ensureFile(): Promise<void> {
  try {
    await fs.access(usersPath);
  } catch {
    await fs.writeFile(usersPath, JSON.stringify({ usuarios: [] }, null, 2), 'utf8');
  }
}

async function readAll(): Promise<Usuario[]> {
  await ensureFile();
  const content = await fs.readFile(usersPath, 'utf8');
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as Usuario[];
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.usuarios)) {
      return parsed.usuarios as Usuario[];
    }
  } catch {}
  return [];
}

async function writeAll(items: Usuario[]): Promise<void> {
  const payload = { usuarios: items };
  await fs.writeFile(usersPath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function listUsuariosLocal(): Promise<Usuario[]> {
  return readAll();
}

export async function appendUsuarioLocal(data: Omit<Usuario, 'id' | 'dataCadastro'>): Promise<Usuario> {
  const items = await readAll();
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const now = new Date().toISOString();
  const novo: Usuario = { id, dataCadastro: now, ...data };
  items.push(novo);
  await writeAll(items);
  return novo;
}

export function validarCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  const calc = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) total += parseInt(base[i], 10) * (factor - i);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calc(clean.slice(0, 9), 10);
  const d2 = calc(clean.slice(0, 10), 11);
  return d1 === parseInt(clean[9], 10) && d2 === parseInt(clean[10], 10);
}