"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentUpload } from '@/components/document-upload'
import { ChatInterface } from '@/components/chat-interface'
import { DocumentManager } from '@/components/document-manager'
import { Toaster } from '@/components/ui/sonner'
import { Upload, MessageCircle, FolderOpen, Database } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            RAG Document Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload documents, extract insights, and chat with your knowledge base using advanced RAG technology
          </p>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Document Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="chat" className="h-[calc(100vh-200px)]">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <DocumentManager />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <Database className="h-4 w-4" />
            Powered by Supabase Vector Database & Advanced RAG Technology
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  )
}