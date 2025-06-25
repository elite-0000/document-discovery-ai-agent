"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  File, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { supabase, type Document } from '@/lib/supabase'
import { toast } from 'sonner'

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDocument = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return

    try {
      // Delete document chunks first
      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', id)

      // Delete document
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDocuments(prev => prev.filter(doc => doc.id !== id))
      toast.success(`Deleted "${filename}"`)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (fileType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (fileType.includes('sheet')) return <BarChart3 className="h-4 w-4 text-green-500" />
    if (fileType.includes('presentation')) return <FileText className="h-4 w-4 text-orange-500" />
    return <File className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading documents...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Document Library
        </CardTitle>
        <CardDescription>
          Manage your uploaded documents and view processing status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No documents uploaded yet. Use the Document Upload section to add files to your knowledge base.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {documents.map((document, index) => (
              <div key={document.id}>
                <div className="flex items-start justify-between p-4 rounded-lg border">
                  <div className="flex items-start gap-3 flex-1">
                    {getFileTypeIcon(document.file_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{document.filename}</h3>
                        <Badge variant={getStatusColor(document.status)} className="text-xs">
                          {getStatusIcon(document.status)}
                          <span className="ml-1">{document.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>Uploaded {new Date(document.upload_date).toLocaleDateString()}</span>
                        {document.chunk_count && (
                          <span>{document.chunk_count} chunks</span>
                        )}
                      </div>

                      {document.processed_date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Processed {new Date(document.processed_date).toLocaleString()}
                        </div>
                      )}

                      {document.error_message && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {document.error_message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" disabled>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteDocument(document.id, document.filename)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {index < documents.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}