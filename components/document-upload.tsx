"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  chunks?: number
}

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // Process each file
    for (const uploadedFile of newFiles) {
      await processFile(uploadedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10
  })

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      setIsProcessing(true)
      updateFileStatus(uploadedFile.id, 'processing', 10)

      // Create FormData and send to API route
      const formData = new FormData()
      formData.append('file', uploadedFile.file)

      updateFileStatus(uploadedFile.id, 'processing', 30)

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData
      })

      updateFileStatus(uploadedFile.id, 'processing', 70)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Processing failed')
      }

      updateFileStatus(uploadedFile.id, 'completed', 100, undefined, result.chunks)
      toast.success(`${uploadedFile.file.name} processed successfully with ${result.chunks} chunks`)

    } catch (error) {
      console.error('File processing error:', error)
      updateFileStatus(uploadedFile.id, 'error', 0, error instanceof Error ? error.message : 'Processing failed')
      toast.error(`Failed to process ${uploadedFile.file.name}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateFileStatus = (
    id: string, 
    status: UploadedFile['status'], 
    progress: number, 
    error?: string,
    chunks?: number
  ) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, status, progress, error, chunks }
        : file
    ))
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload PDF, DOCX, XLSX, or PPTX files to add them to your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, XLSX, PPTX (max 50MB each)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium truncate max-w-xs">
                      {file.file.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <>
                        <Badge variant="default" className="text-xs">
                          {file.chunks} chunks
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                {file.status !== 'completed' && (
                  <Progress value={file.progress} className="h-2" />
                )}
                
                {file.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{file.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}