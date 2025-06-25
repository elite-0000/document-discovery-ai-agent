import { NextRequest, NextResponse } from 'next/server'
import { DocumentParser, DocumentChunker } from '@/lib/document-parser'
import { EmbeddingService } from '@/lib/embedding-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Step 1: Parse document
    const parsedContent = await DocumentParser.parseDocument(file)

    // Step 2: Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        status: 'processing',
        metadata: parsedContent.metadata
      })
      .select()
      .single()

    if (docError) {
      throw docError
    }

    // Step 3: Chunk the document
    const chunks = DocumentChunker.chunkDocument(parsedContent.text)

    // Step 4: Generate embeddings and store chunks
    const chunkData = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await EmbeddingService.generateEmbedding(chunk)
      const metadata = DocumentChunker.enhanceChunkMetadata(chunk, i, document)
      
      chunkData.push({
        document_id: document.id,
        content: chunk,
        chunk_index: i,
        embedding,
        metadata
      })
    }

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkData)

    if (chunkError) {
      throw chunkError
    }

    // Step 5: Update document status
    await supabase
      .from('documents')
      .update({
        status: 'completed',
        processed_date: new Date().toISOString(),
        chunk_count: chunks.length
      })
      .eq('id', document.id)

    return NextResponse.json({
      success: true,
      document,
      chunks: chunks.length
    })

  } catch (error) {
    console.error('Document processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}