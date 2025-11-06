import { google } from 'googleapis';

type Equipamento = {
  id: string;
  nome?: string;
  serial?: string;
  mac?: string;
  destino?: string;
  status?: string;
  dataEntrada?: string;
  dataSaida?: string | null;
};

const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Equipamentos';
const RANGE_DATA = `${SHEET_NAME}!A2:H`;

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Credenciais do Google Sheets ausentes. Configure GOOGLE_SHEETS_CLIENT_EMAIL e GOOGLE_SHEETS_PRIVATE_KEY.');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID não configurado.');
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId };
}

export async function listEquipamentos(): Promise<Equipamento[]> {
  const { sheets, spreadsheetId } = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE_DATA,
  });

  const values = res.data.values || [];
  return values.map((row) => ({
    id: row[0],
    nome: row[1],
    serial: row[2],
    mac: row[3],
    destino: row[4],
    status: row[5] || 'disponivel',
    dataEntrada: row[6],
    dataSaida: row[7] || null,
  }));
}

export async function appendEquipamento(item: Equipamento): Promise<void> {
  const { sheets, spreadsheetId } = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        item.id,
        item.nome || '',
        item.serial || '',
        item.mac || '',
        item.destino || '',
        item.status || 'disponivel',
        item.dataEntrada || new Date().toISOString(),
        item.dataSaida || '',
      ]],
    },
  });
}

export async function updateEquipamentoById(id: string, updates: Partial<Equipamento>): Promise<void> {
  const { sheets, spreadsheetId } = getSheets();
  const current = await listEquipamentos();
  const rowIndex = current.findIndex((e) => String(e.id) === String(id));
  if (rowIndex === -1) throw new Error('Equipamento não encontrado');

  const baseRowNumber = 2; // A2 é a primeira linha de dados
  const targetRow = baseRowNumber + rowIndex;

  const merged: Equipamento = { ...current[rowIndex], ...updates };

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${targetRow}:H${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        merged.id,
        merged.nome || '',
        merged.serial || '',
        merged.mac || '',
        merged.destino || '',
        merged.status || 'disponivel',
        merged.dataEntrada || current[rowIndex].dataEntrada || new Date().toISOString(),
        merged.dataSaida || '',
      ]],
    },
  });
}

export async function deleteEquipamentoById(id: string): Promise<void> {
  const { sheets, spreadsheetId } = getSheets();
  const current = await listEquipamentos();
  const rowIndex = current.findIndex((e) => String(e.id) === String(id));
  if (rowIndex === -1) throw new Error('Equipamento não encontrado');

  const baseRowNumber = 2; // A2 é a primeira linha de dados
  const targetRowIndexZeroBased = (baseRowNumber - 1) + rowIndex; // zero-based

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: undefined,
              dimension: 'ROWS',
              startIndex: targetRowIndexZeroBased,
              endIndex: targetRowIndexZeroBased + 1,
            },
          },
        },
      ],
    },
  });
}