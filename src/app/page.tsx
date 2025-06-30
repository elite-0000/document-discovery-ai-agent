"use client";
import DocumentUpload from "@/components/DocumentUpload";
import ChatAssistant from "@/components/ChatAssistant";
import DocumentLibrary from "@/components/DocumentLibrary";
import TestPDFParsing from "@/components/TestPDFParsing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] flex flex-col items-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">RAG Document Assistant</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload documents, extract insights, and chat with your knowledge base using advanced RAG technology
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Document Management & AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upload">Upload Documents</TabsTrigger>
                <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
                <TabsTrigger value="library">Document Library</TabsTrigger>
                <TabsTrigger value="test">Test PDF Parsing</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <DocumentUpload />
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <ChatAssistant />
              </TabsContent>

              <TabsContent value="library" className="mt-6">
                <DocumentLibrary />
              </TabsContent>

              <TabsContent value="test" className="mt-6">
                <TestPDFParsing />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Supabase Vector Database & Advanced RAG Technology
          </p>
        </div>
      </div>
    </div>
  );
}
