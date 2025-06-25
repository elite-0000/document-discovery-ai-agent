import pdf from 'pdf-parse'
import * as mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export interface ParsedContent {
  text: string
  metadata: {
    pages?: number
    title?: string
    author?: string
    tables?: any[]
    images?: any[]
  }
}

export class DocumentParser {
  static async parseDocument(file: File): Promise<ParsedContent> {
    const fileType = file.type
    const buffer = await file.arrayBuffer()

    switch (fileType) {
      case 'application/pdf':
        return this.parsePDF(buffer)
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDOCX(buffer)
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return this.parseXLSX(buffer)
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return this.parsePPTX(buffer)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private static async parsePDF(buffer: ArrayBuffer): Promise<ParsedContent> {
    try {
      const data = await pdf(Buffer.from(buffer))
      
      return {
        text: data.text,
        metadata: {
          pages: data.numpages,
          title: data.info?.Title,
          author: data.info?.Author,
        }
      }
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error}`)
    }
  }

  private static async parseDOCX(buffer: ArrayBuffer): Promise<ParsedContent> {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      
      return {
        text: result.value,
        metadata: {
          title: 'DOCX Document'
        }
      }
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error}`)
    }
  }

  private static async parseXLSX(buffer: ArrayBuffer): Promise<ParsedContent> {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' })
      let text = ''
      const tables: any[] = []

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Convert sheet data to text
        const sheetText = jsonData.map(row => 
          Array.isArray(row) ? row.join(' | ') : ''
        ).join('\n')
        
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`
        
        // Store structured table data
        tables.push({
          sheetName,
          data: jsonData
        })
      })

      return {
        text,
        metadata: {
          title: 'Excel Spreadsheet',
          tables
        }
      }
    } catch (error) {
      throw new Error(`XLSX parsing failed: ${error}`)
    }
  }

  private static async parsePPTX(buffer: ArrayBuffer): Promise<ParsedContent> {
    try {
      // For now, we'll return a placeholder implementation
      // In production, you'd use a library like pptx2json or similar
      return {
        text: 'PowerPoint content extraction - implementation needed',
        metadata: {
          title: 'PowerPoint Presentation'
        }
      }
    } catch (error) {
      throw new Error(`PPTX parsing failed: ${error}`)
    }
  }
}

export class DocumentChunker {
  static chunkDocument(content: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      
      if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          
          // Create overlap by taking last part of current chunk
          const words = currentChunk.split(' ')
          const overlapWords = Math.min(overlap / 10, words.length)
          currentChunk = words.slice(-overlapWords).join(' ') + ' '
        }
      }
      
      currentChunk += trimmedSentence + '. '
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks.filter(chunk => chunk.length > 50) // Filter out very short chunks
  }

  static enhanceChunkMetadata(chunk: string, index: number, document: any) {
    const wordCount = chunk.split(' ').length
    const hasNumbers = /\d/.test(chunk)
    const hasFinancialTerms = /revenue|cost|profit|expense|budget|financial|earnings|income/.test(chunk.toLowerCase())
    
    return {
      wordCount,
      hasNumbers,
      hasFinancialTerms,
      chunkIndex: index,
      importance: hasFinancialTerms ? 'high' : hasNumbers ? 'medium' : 'low'
    }
  }
}