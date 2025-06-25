"use client";
import { useState } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import ChatAssistant from "@/components/ChatAssistant";
import DocumentLibrary from "@/components/DocumentLibrary";
import { Card, CardContent } from "@/components/ui/card";

const TABS = [
  { label: "Upload Documents" },
  { label: "Chat Assistant" },
  { label: "Document Library" },
];

export default function Home() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] flex flex-col items-center">
      <h1 className="text-4xl font-bold mt-12 mb-2 text-center">RAG Document Assistant</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Upload documents, extract insights, and chat with your knowledge base using advanced RAG technology
      </p>
      <div className="flex w-full max-w-3xl mb-8">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            className={`flex-1 py-3 font-semibold border border-gray-200 ${i === 0 ? "rounded-tl-lg rounded-bl-lg" : ""} ${i === TABS.length - 1 ? "rounded-tr-lg rounded-br-lg" : ""} ${tab === i ? "bg-white" : "bg-gray-100"}`}
            onClick={() => setTab(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card className="w-full max-w-3xl">
        <CardContent className="p-0">
          {tab === 0 && <DocumentUpload />}
          {tab === 1 && <ChatAssistant />}
          {tab === 2 && <DocumentLibrary />}
        </CardContent>
      </Card>
      <div className="mt-16 text-gray-400 text-sm flex flex-col items-center">
        <span>Powered by Supabase Vector Database &amp; Advanced RAG Technology</span>
      </div>
    </div>
  );
}
