import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import XLSX from 'xlsx';
// TODO: Add pptx-parser or similar for PPTX support

export async function parseDocument(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return { text: data.text, metadata: {} };
  }
  if (ext === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return { text: value, metadata: {} };
  }
  if (ext === 'xlsx') {
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    // Extract tables as text
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_csv(sheet);
    });
    return { text, metadata: {} };
  }
  if (ext === 'pptx') {
    // Placeholder for PPTX parsing
    return { text: '[PPTX parsing not implemented]', metadata: {} };
  }
  throw new Error('Unsupported file type');
} 