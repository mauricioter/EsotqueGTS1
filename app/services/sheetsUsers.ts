import { google } from 'googleapis';

export type Usuario = {
  id: string;
  nomeCompleto: string;
  numero: string;
  email: string;
  cpf: string;
  dataCadastro: string;
};

const SHEET_NAME = process.env.USUARIOS_SHEET_NAME || 'Usuarios';

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('Credenciais do Google não configuradas');
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheets() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID não configurado');
  return { sheets, spreadsheetId };
}

export async function listUsuariosSheets(): Promise<Usuario[]> {
  const { sheets, spreadsheetId } = await getSheets();
  const range = `${SHEET_NAME}!A:F`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = res.data.values || [];
  // Espera cabeçalho: id | nomeCompleto | numero | email | cpf | dataCadastro
  const rows = values.slice(1);
  return rows.map((r) => ({
    id: r[0],
    nomeCompleto: r[1],
    numero: r[2],
    email: r[3],
    cpf: r[4],
    dataCadastro: r[5],
  }));
}

export async function appendUsuarioSheets(data: Omit<Usuario, 'id' | 'dataCadastro'>): Promise<Usuario> {
  const { sheets, spreadsheetId } = await getSheets();
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const now = new Date().toISOString();
  const valores = [[id, data.nomeCompleto, data.numero, data.email, data.cpf, now]];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: 'RAW',
    requestBody: { values: valores },
  });
  return { id, dataCadastro: now, ...data };
}