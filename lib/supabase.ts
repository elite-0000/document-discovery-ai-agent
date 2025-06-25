import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export type Document = {
  id: string
  filename: string
  file_type: string
  file_size: number
  status: 'processing' | 'completed' | 'error'
  upload_date: string
  processed_date?: string
  error_message?: string
  chunk_count?: number
  metadata?: Record<string, any>
}

export type DocumentChunk = {
  id: string
  document_id: string
  content: string
  chunk_index: number
  embedding?: number[]
  metadata?: Record<string, any>
  page_number?: number
  section_title?: string
}

export type ChatMessage = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  sources?: {
    document_id: string
    filename: string
    chunk_content: string
    page_number?: number
  }[]
}

export type ProcessingJob = {
  id: string
  document_id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  progress: number
  current_step: string
  created_at: string
  updated_at: string
}