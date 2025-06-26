"use client";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    console.log("uploading file", formData);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setSuccess(true);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <p className="text-muted-foreground text-sm">
          Upload PDF, DOCX, XLSX, or PPTX files to add them to your knowledge base
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px]"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mb-4 text-gray-400"><path d="M12 16V4m0 0l-4 4m4-4l4 4"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>
          <div className="text-lg font-medium mb-2">Drag & drop files here, or click to select</div>
          <div className="text-sm text-gray-500">Supports PDF, DOCX, XLSX, PPTX (max 50MB each)</div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.pptx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {uploading && <div className="mt-4 text-blue-500">Uploading...</div>}
        {success && <div className="mt-4 text-green-600">Upload successful!</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </CardContent>
    </Card>
  );
} 