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
  
  // CABEÇALHO
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE ESTOQUE', pageWidth / 2, 15, { align: 'center' });
  
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
  doc.text('📊 RESUMO EXECUTIVO', 14, yPos);
  
  yPos += 10;
  
  // Cards de estatísticas em grid 2x5
  const cardWidth = (pageWidth - 28 - 8) / 2; // 2 colunas com espaçamento
  const cardHeight = 18;
  const gap = 4;
  
  const statsCards = [
    { label: 'Total de Equipamentos', value: stats.total, color: primaryColor },
    { label: 'Disponíveis', value: stats.disponiveis, color: [34, 197, 94] as [number, number, number] },
    { label: 'Em Uso', value: stats.emUso, color: [249, 115, 22] as [number, number, number] },
    { label: 'Manutenção', value: stats.manutencao, color: [245, 158, 11] as [number, number, number] },
    { label: 'Saídas', value: stats.saida, color: [239, 68, 68] as [number, number, number] },
    { label: 'Instalados', value: stats.instalado, color: [16, 185, 129] as [number, number, number] },
    { label: 'Reservados', value: stats.reservado, color: [107, 114, 128] as [number, number, number] },
    { label: 'Com Defeito', value: stats.defeito, color: [220, 38, 38] as [number, number, number] },
    { label: 'Emprestados', value: stats.emprestado, color: [234, 88, 12] as [number, number, number] },
    { label: 'Retornos', value: stats.retorno, color: [249, 115, 22] as [number, number, number] },
  ];
  
  statsCards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 14 + col * (cardWidth + gap);
    const y = yPos + row * (cardHeight + gap);
    
    // Fundo do card
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
    
    // Borda colorida
    doc.setDrawColor(...card.color);
    doc.setLineWidth(1);
    doc.line(x, y, x + cardWidth, y);
    
    // Label
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 3, y + 6);
    
    // Valor
    doc.setTextColor(...card.color);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value.toString(), x + 3, y + 14);
  });
  
  yPos += (Math.ceil(statsCards.length / 2) * (cardHeight + gap)) + 10;
  
  // TABELA DE EQUIPAMENTOS
  doc.addPage();
  yPos = 20;
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('📦 LISTA COMPLETA DE EQUIPAMENTOS', 14, yPos);
  
  yPos += 5;
  
  // Preparar dados para a tabela
  const tableData = equipamentos.map(eq => [
    eq.nome,
    eq.tipo || '-',
    eq.marca || '-',
    eq.serial || '-',
    eq.status,
    new Date(eq.dataEntrada).toLocaleDateString('pt-BR'),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Nome', 'Tipo', 'Marca', 'Serial', 'Status', 'Data Entrada']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: grayColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Nome
      1: { cellWidth: 25 }, // Tipo
      2: { cellWidth: 30 }, // Marca
      3: { cellWidth: 30 }, // Serial
      4: { cellWidth: 35, halign: 'center' }, // Status
      5: { cellWidth: 25, halign: 'center' }, // Data
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Rodapé em cada página
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${currentPage} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      doc.text(
        'Sistema de Gerenciamento GTS - Relatório Confidencial',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    },
  });
  
  // ANÁLISE POR TIPO
  doc.addPage();
  yPos = 20;
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('📈 ANÁLISE POR TIPO DE EQUIPAMENTO', 14, yPos);
  
  yPos += 10;
  
  // Agrupar por tipo
  const porTipo = equipamentos.reduce((acc, eq) => {
    const tipo = eq.tipo || 'Sem tipo';
    if (!acc[tipo]) acc[tipo] = 0;
    acc[tipo]++;
    return acc;
  }, {} as Record<string, number>);
  
  const tipoData = Object.entries(porTipo)
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, count]) => [
      tipo,
      count.toString(),
      `${((count / stats.total) * 100).toFixed(1)}%`
    ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tipo de Equipamento', 'Quantidade', 'Percentual']],
    body: tipoData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: grayColor,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // ANÁLISE POR MARCA
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('🏢 ANÁLISE POR MARCA', 14, finalY);
  
  // Agrupar por marca
  const porMarca = equipamentos.reduce((acc, eq) => {
    const marca = eq.marca || 'Sem marca';
    if (!acc[marca]) acc[marca] = 0;
    acc[marca]++;
    return acc;
  }, {} as Record<string, number>);
  
  const marcaData = Object.entries(porMarca)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15) // Top 15 marcas
    .map(([marca, count]) => [
      marca,
      count.toString(),
      `${((count / stats.total) * 100).toFixed(1)}%`
    ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Marca', 'Quantidade', 'Percentual']],
    body: marcaData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: grayColor,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Salvar PDF
  const nomeArquivo = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
};
