"use client";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{suggestion?: string, details?: string} | null>(null);
  const [uploadResult, setUploadResult] = useState<{fileName: string, chunks: number} | null>(null);

  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setErrorDetails(null);
    setUploadResult(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setErrorDetails(null);
    setUploadResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setErrorDetails(null);

    // Client-side validation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload PDF, DOCX, XLSX, or PPTX files.");
      setUploading(false);
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 50MB.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Store additional error details if available
        if (data.suggestion || data.details) {
          setErrorDetails({
            suggestion: data.suggestion,
            details: data.details
          });
        }
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      console.log('Upload successful:', data);

      // Store upload result for display
      if (data.chunks && data.fileName) {
        setUploadResult({ fileName: data.fileName, chunks: data.chunks });
        console.log(`Successfully processed ${data.fileName} into ${data.chunks} chunks`);
      }

      // Show success dialog
      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);

      // Try to extract additional error details from the response
      if (error instanceof Error && error.message.includes('Failed to process document')) {
        setErrorDetails({
          suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.',
          details: 'This error usually indicates an issue with OpenAI API or Supabase configuration.'
        });
      }

      // Show error dialog
      setShowErrorDialog(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle>Document Upload</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Upload PDF, DOCX, XLSX, or PPTX files to add them to your knowledge base
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors hover:border-muted-foreground/50 hover:bg-muted/25"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2 text-center">Drag & drop files here, or click to select</div>
            <div className="text-sm text-muted-foreground text-center">
              Supports PDF, DOCX, XLSX, PPTX (max 50MB each)
            </div>
            <div className="flex gap-2 mt-4">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">DOCX</Badge>
              <Badge variant="outline">XLSX</Badge>
              <Badge variant="outline">PPTX</Badge>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.pptx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {uploading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing document... This may take a few moments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <DialogTitle>Upload Successful!</DialogTitle>
            </div>
            <DialogDescription>
              Your document has been successfully processed and added to the knowledge base.
            </DialogDescription>
          </DialogHeader>

          {uploadResult && (
            <div className="space-y-2 py-4">
              <div className="text-sm">
                <span className="font-medium">File:</span> {uploadResult.fileName}
              </div>
              <div className="text-sm">
                <span className="font-medium">Chunks created:</span> {uploadResult.chunks}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <DialogTitle>Upload Failed</DialogTitle>
            </div>
            <DialogDescription>
              {error}
            </DialogDescription>
          </DialogHeader>

          {errorDetails && (
            <div className="space-y-3 py-4">
              {errorDetails.suggestion && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm font-medium mb-1">💡 Suggestion:</div>
                  <div className="text-sm text-muted-foreground">{errorDetails.suggestion}</div>
                </div>
              )}
              {errorDetails.details && (
                <div className="text-sm">
                  <span className="font-medium">Details:</span> {errorDetails.details}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}