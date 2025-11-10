import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('foto') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhuma foto foi enviada' },
        { status: 400 }
      );
    }

    // Converter para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/\s/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'instalacoes');
    const filePath = path.join(uploadDir, fileName);

    // Garantir que o diretório existe
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Retornar URL da foto
    const fotoUrl = `/uploads/instalacoes/${fileName}`;

    return NextResponse.json({
      success: true,
      fotoUrl,
      message: 'Foto enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    return NextResponse.json(
      { error: 'Erro ao processar upload da foto' },
      { status: 500 }
    );
  }
}

// Configuração para aceitar arquivos maiores
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
