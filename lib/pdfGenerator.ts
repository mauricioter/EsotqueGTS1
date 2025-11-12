import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  mac?: string;
  status: string;
  localizacao?: string;
  dataEntrada: string;
  observacoes?: string;
}

interface StatsData {
  total: number;
  disponiveis: number;
  emUso: number;
  manutencao: number;
  saida: number;
  reservado: number;
  defeito: number;
  emprestado: number;
  instalado: number;
  retorno: number;
}

export const gerarRelatorioPDF = (
  equipamentos: Equipamento[],
  stats: StatsData
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Cores do tema
  const primaryColor: [number, number, number] = [249, 115, 22]; // Orange
  const grayColor: [number, number, number] = [55, 65, 81]; // Gray
  const lightGray: [number, number, number] = [243, 244, 246];
  
  // Função auxiliar para adicionar rodapé
  const addFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Pagina ${currentPage} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    doc.text(
      'Sistema de Gerenciamento GTS - Relatorio Confidencial',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  };
  
  // CABEÇALHO
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATORIO DE ESTOQUE', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gerenciamento GTS', pageWidth / 2, 23, { align: 'center' });
  
  // Data de geração
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(9);
  doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, 30, { align: 'center' });
  
  // RESUMO EXECUTIVO
  let yPos = 45;
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO EXECUTIVO', 14, yPos);
  
  yPos += 10;
  
  // Card principal - Total de Equipamentos
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL DE EQUIPAMENTOS NO ESTOQUE', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.total.toString(), pageWidth / 2, yPos + 20, { align: 'center' });
  
  yPos += 35;
  
  // Estatísticas por status - Lista simples
  doc.setTextColor(...grayColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribuicao por Status:', 14, yPos);
  
  yPos += 8;
  
  const statusList = [
    { label: 'Disponiveis', value: stats.disponiveis },
    { label: 'Em Uso', value: stats.emUso },
    { label: 'Instalados', value: stats.instalado },
    { label: 'Manutencao', value: stats.manutencao },
    { label: 'Saidas', value: stats.saida },
    { label: 'Reservados', value: stats.reservado },
    { label: 'Com Defeito', value: stats.defeito },
    { label: 'Emprestados', value: stats.emprestado },
    { label: 'Retornos', value: stats.retorno },
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  statusList.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 14 + col * 65;
    const y = yPos + row * 7;
    
    doc.setTextColor(...grayColor);
    doc.text(`${item.label}:`, x, y);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value.toString(), x + 40, y);
    doc.setFont('helvetica', 'normal');
  });
  
  yPos += Math.ceil(statusList.length / 3) * 7 + 5;
  
  addFooter();
  
  // EQUIPAMENTOS POR MARCA
  doc.addPage();
  yPos = 20;
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTOS POR MARCA', 14, yPos);
  
  yPos += 10;
  
  // Agrupar equipamentos por marca
  const porMarca = equipamentos.reduce((acc, eq) => {
    const marca = eq.marca || 'Sem marca';
    if (!acc[marca]) acc[marca] = [];
    acc[marca].push(eq);
    return acc;
  }, {} as Record<string, Equipamento[]>);
  
  // Ordenar marcas por quantidade (maior para menor)
  const marcasOrdenadas = Object.entries(porMarca)
    .sort((a, b) => b[1].length - a[1].length);
  
  // Para cada marca, criar uma seção
  marcasOrdenadas.forEach(([marca, equipamentos], indexMarca) => {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 60) {
      addFooter();
      doc.addPage();
      yPos = 20;
    }
    
    // Título da marca
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, yPos, pageWidth - 28, 12, 2, 2, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(marca.toUpperCase(), 16, yPos + 8);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text(`(${equipamentos.length} ${equipamentos.length === 1 ? 'equipamento' : 'equipamentos'})`, 
      pageWidth - 16, yPos + 8, { align: 'right' });
    
    yPos += 17;
    
    // Tabela de equipamentos da marca
    const marcaData = equipamentos.map(eq => [
      eq.nome,
      eq.tipo || '-',
      eq.modelo || '-',
      eq.status,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Nome', 'Tipo', 'Modelo', 'Status']],
      body: marcaData,
      theme: 'plain',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: grayColor,
        fontStyle: 'bold',
        fontSize: 9,
        lineWidth: 0.5,
        lineColor: [200, 200, 200],
      },
      bodyStyles: {
        fontSize: 9,
        textColor: grayColor,
        lineWidth: 0.1,
        lineColor: [230, 230, 230],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  });
  
  addFooter();
  
  // LISTA DE TODOS OS SERIAIS
  doc.addPage();
  yPos = 20;
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTA DE SERIAIS', 14, yPos);
  
  yPos += 5;
  
  // Criar tabela com todos os seriais
  const serialData = equipamentos
    .filter(eq => eq.serial && eq.serial.trim() !== '')
    .sort((a, b) => a.serial.localeCompare(b.serial))
    .map(eq => [
      eq.serial,
      eq.nome,
      eq.marca || '-',
      eq.status,
    ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Serial', 'Nome do Equipamento', 'Marca', 'Status']],
    body: serialData.length > 0 ? serialData : [['Nenhum serial cadastrado', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: grayColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      addFooter();
    },
  });
  
  // Adicionar rodapé na última página
  addFooter();
  
  // Salvar PDF
  const nomeArquivo = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
};
