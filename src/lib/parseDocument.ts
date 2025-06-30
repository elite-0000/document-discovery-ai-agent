import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import XLSX from 'xlsx';
// TODO: Add pptx-parser or similar for PPTX support

export async function parseDocument(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop()?.toLowerCase();

    console.log(`Parsing document: ${file.name}, extension: ${ext}, size: ${arrayBuffer.byteLength} bytes`);

    if (ext === 'pdf') {
      try {
        // Convert ArrayBuffer to Buffer for pdf-parse
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF with options for better compatibility
        const data = await pdfParse(buffer, {
          // Normalize whitespace and handle special characters
          normalizeWhitespace: true,
          // Set a reasonable page limit to avoid memory issues
          max: 100
        });

        if (!data.text || data.text.trim().length === 0) {
          throw new Error('PDF appears to be empty or contains only images/scanned content');
        }

        console.log(`Successfully parsed PDF: ${data.numpages} pages, ${data.text.length} characters`);

        return {
          text: data.text,
          metadata: {
            pages: data.numpages,
            info: data.info || {},
            version: data.version || 'unknown'
          }
        };
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }
    }

    if (ext === 'docx') {
      try {
        const { value } = await mammoth.extractRawText({
          buffer: Buffer.from(arrayBuffer)
        });

        if (!value || value.trim().length === 0) {
          throw new Error('DOCX appears to be empty');
        }

        console.log(`Successfully parsed DOCX: ${value.length} characters`);

        return {
          text: value,
          metadata: {
            wordCount: value.split(/\s+/).length
          }
        };
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        throw new Error(`Failed to parse DOCX: ${docxError instanceof Error ? docxError.message : 'Unknown error'}`);
      }
    }

    if (ext === 'xlsx') {
      try {
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('XLSX appears to be empty or corrupted');
        }

        // Extract tables as text
        let text = '';
        let totalCells = 0;

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const csvData = XLSX.utils.sheet_to_csv(sheet);
          text += `Sheet: ${sheetName}\n${csvData}\n\n`;

          // Count cells for metadata
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
          totalCells += (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
        });

        if (!text || text.trim().length === 0) {
          throw new Error('XLSX appears to be empty');
        }

        console.log(`Successfully parsed XLSX: ${workbook.SheetNames.length} sheets, ${totalCells} cells`);

        return {
          text,
          metadata: {
            sheets: workbook.SheetNames.length,
            sheetNames: workbook.SheetNames,
            totalCells
          }
        };
      } catch (xlsxError) {
        console.error('XLSX parsing error:', xlsxError);
        throw new Error(`Failed to parse XLSX: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`);
      }
    }

    if (ext === 'pptx') {
      // Placeholder for PPTX parsing - return a helpful message
      console.log('PPTX parsing not yet implemented');
      return {
        text: '[PPTX parsing not implemented yet. Please convert to PDF or another supported format.]',
        metadata: {
          note: 'PPTX support coming soon'
        }
      };
    }

    throw new Error(`Unsupported file type: ${ext}. Supported formats: PDF, DOCX, XLSX`);

  } catch (error) {
    console.error('Document parsing error:', error);

    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while parsing document');
    }
  }
}