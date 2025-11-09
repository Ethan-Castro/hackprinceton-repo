import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  includeTableOfContents?: boolean;
  margin?: number;
}

export interface PdfContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}

export async function generatePdf(
  content: PdfContent,
  options: PdfExportOptions = {}
): Promise<Buffer> {
  const {
    title = content.title,
    author = 'Augment',
    subject = 'Generated Document',
    includeTableOfContents = true,
    margin = 15,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set metadata
  doc.setProperties({
    title,
    subject,
    author,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Cover page
  doc.setFontSize(32);
  doc.setFont(undefined, 'bold');
  const titleLines = doc.splitTextToSize(title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 12;
  });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition + 20);
  doc.text(`By ${author}`, margin, yPosition + 30);

  // Add page
  doc.addPage();
  yPosition = margin;

  // Table of Contents
  if (includeTableOfContents && content.sections.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Table of Contents', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    content.sections.forEach((section, index) => {
      doc.text(`${index + 1}. ${section.title}`, margin + 5, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
  }

  // Content sections
  for (const section of content.sections) {
    // Check if we need a new page
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, margin, yPosition);
    yPosition += 8;

    // Section content
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(section.content, contentWidth);

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 8;
  }

  // Add tables if provided
  if (content.tables && content.tables.length > 0) {
    for (const table of content.tables) {
      if (yPosition > pageHeight - margin - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Table title
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(table.title, margin, yPosition);
      yPosition += 8;

      // Add table
      autoTable(doc, {
        head: [table.headers],
        body: table.rows,
        startY: yPosition,
        margin: margin,
        theme: 'grid',
        headerStyles: {
          fillColor: [66, 133, 244],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [242, 242, 242],
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

export async function downloadPdf(
  content: PdfContent,
  filename: string = 'document.pdf',
  options?: PdfExportOptions
) {
  const pdf = await generatePdf(content, options);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
