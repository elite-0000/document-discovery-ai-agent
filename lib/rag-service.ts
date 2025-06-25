import { supabase } from './supabase'
import { EmbeddingService } from './embedding-service'

export interface SearchResult {
  content: string
  similarity: number
  metadata: any
  document_id: string
  filename: string
}

export class RAGService {
  static async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await EmbeddingService.generateEmbedding(query)
      
      // For now, we'll implement a simple text-based search
      // In production, you would use Supabase's vector similarity search
      const { data: chunks, error } = await supabase
        .from('document_chunks')
        .select(`
          *,
          documents (
            filename,
            file_type
          )
        `)
        .textSearch('content', query)
        .limit(limit)

      if (error) {
        console.error('Search error:', error)
        return []
      }

      // Calculate similarities and format results
      const results: SearchResult[] = chunks?.map(chunk => ({
        content: chunk.content,
        similarity: 0.8, // Mock similarity score
        metadata: chunk.metadata || {},
        document_id: chunk.document_id,
        filename: chunk.documents?.filename || 'Unknown'
      })) || []

      return results.sort((a, b) => b.similarity - a.similarity)
    } catch (error) {
      console.error('RAG search failed:', error)
      return []
    }
  }

  static async generateResponse(query: string, context: SearchResult[]): Promise<string> {
    // In production, this would call an LLM API (OpenAI, Anthropic, etc.)
    // For now, we'll generate a mock response based on the context
    
    const contextText = context.map(result => result.content).join('\n\n')
    
    if (context.length === 0) {
      return "I don't have enough information in the uploaded documents to answer your question. Please try uploading relevant documents or rephrasing your question."
    }

    return `Based on the uploaded documents, here's what I found:

${this.generateContextualResponse(query, contextText)}

This information was found in the following documents:
${context.map(result => `• ${result.filename}`).join('\n')}

Please note that this response is generated based on the content of your uploaded documents.`
  }

  private static generateContextualResponse(query: string, context: string): string {
    // Simple response generation based on query keywords
    const lowerQuery = query.toLowerCase()
    const lowerContext = context.toLowerCase()

    if (lowerQuery.includes('revenue') || lowerQuery.includes('income')) {
      const revenueMatch = context.match(/revenue[^\n]*\$?[\d,]+/gi)
      if (revenueMatch) {
        return `I found revenue information: ${revenueMatch.join(', ')}`
      }
    }

    if (lowerQuery.includes('cost') || lowerQuery.includes('expense')) {
      const costMatch = context.match(/cost[^\n]*\$?[\d,]+/gi)
      if (costMatch) {
        return `I found cost information: ${costMatch.join(', ')}`
      }
    }

    // Return the most relevant excerpt
    const sentences = context.split(/[.!?]+/)
    const relevantSentences = sentences.filter(sentence => 
      lowerQuery.split(' ').some(word => 
        sentence.toLowerCase().includes(word) && word.length > 3
      )
    )

    return relevantSentences.slice(0, 3).join('. ') || 
           context.substring(0, 200) + '...'
  }

  static async hybridSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    // Combine semantic search with keyword search
    const [semanticResults, keywordResults] = await Promise.all([
      this.searchDocuments(query, Math.ceil(limit / 2)),
      this.keywordSearch(query, Math.ceil(limit / 2))
    ])

    // Merge and deduplicate results
    const combined = [...semanticResults, ...keywordResults]
    const unique = combined.filter((result, index, arr) => 
      arr.findIndex(r => r.document_id === result.document_id && r.content === result.content) === index
    )

    return unique.slice(0, limit)
  }

  private static async keywordSearch(query: string, limit: number): Promise<SearchResult[]> {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3)
    
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select(`
        *,
        documents (
          filename,
          file_type
        )
      `)
      .or(keywords.map(keyword => `content.ilike.%${keyword}%`).join(','))
      .limit(limit)

    if (error || !chunks) return []

    return chunks.map(chunk => ({
      content: chunk.content,
      similarity: 0.7, // Mock similarity for keyword search
      metadata: chunk.metadata || {},
      document_id: chunk.document_id,
      filename: chunk.documents?.filename || 'Unknown'
    }))
  }
}