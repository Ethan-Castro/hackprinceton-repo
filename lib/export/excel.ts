import ExcelJS from 'exceljs';

export interface ExcelExportOptions {
  sheetName?: string;
  title?: string;
  author?: string;
}

export interface ExcelContent {
  title?: string;
  sheets: Array<{
    name: string;
    headers: string[];
    rows: (string | number | boolean | null)[][];
    columnWidths?: number[];
  }>;
}

export async function generateExcel(
  content: ExcelContent,
  options: ExcelExportOptions = {}
): Promise<Buffer> {
  const {
    sheetName = 'Sheet1',
    title = 'Exported Document',
    author = 'Augment',
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = author;
  workbook.title = title;

  // Add sheets
  for (const sheetData of content.sheets) {
    const worksheet = workbook.addWorksheet(sheetData.name);

    // Add headers
    const headerRow = worksheet.addRow(sheetData.headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4285F4' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    for (const rowData of sheetData.rows) {
      const row = worksheet.addRow(rowData);
      row.alignment = { vertical: 'top', wrapText: true };

      // Alternate row colors
      if (worksheet.rowCount % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    }

    // Set column widths
    if (sheetData.columnWidths) {
      sheetData.columnWidths.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width;
      });
    } else {
      // Auto-size columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? String(cell.value).length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function downloadExcel(
  content: ExcelContent,
  filename: string = 'export.xlsx',
  options?: ExcelExportOptions
) {
  const excel = await generateExcel(content, options);
  const blob = new Blob([excel], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
