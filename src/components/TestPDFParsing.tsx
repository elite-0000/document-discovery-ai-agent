"use client";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TestTube, CheckCircle, AlertCircle, Loader2, Upload } from "lucide-react";

export default function TestPDFParsing() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Dialog states
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await testParseFile(file);
  };

  const testParseFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    console.log(`Testing parse for file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    try {
      const res = await fetch("/api/test-parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Test failed with status ${res.status}`);
      }

      setResult(data);
      console.log('Parse test successful:', data);

      // Show result dialog
      setShowResultDialog(true);

    } catch (error) {
      console.error('Parse test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Parse test failed';
      setError(errorMessage);

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
            <TestTube className="h-5 w-5 text-primary" />
            <CardTitle>Test Document Parsing</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Test document parsing functionality without requiring OpenAI/Supabase setup
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors hover:border-muted-foreground/50 hover:bg-muted/25"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2 text-center">Click to select a document</div>
            <div className="text-sm text-muted-foreground text-center">
              Test parsing without embeddings
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
                Testing document parsing... This may take a few moments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <DialogTitle>Document Parsing Successful!</DialogTitle>
            </div>
            <DialogDescription>
              Your document has been successfully parsed and analyzed.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File:</span> {result.fileName}
                </div>
                <div>
                  <span className="font-medium">Text Length:</span> {result.textLength?.toLocaleString()} characters
                </div>
              </div>

              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Metadata:</div>
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {JSON.stringify(result.metadata, null, 2)}
                  </div>
                </div>
              )}

              {result.textPreview && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Text Preview:</div>
                  <Textarea
                    value={result.textPreview}
                    readOnly
                    className="text-xs font-mono resize-none"
                    rows={8}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Close
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
              <DialogTitle>Parsing Failed</DialogTitle>
            </div>
            <DialogDescription>
              {error}
            </DialogDescription>
          </DialogHeader>

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
