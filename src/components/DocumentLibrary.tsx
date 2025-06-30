"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, RefreshCw, Library, Calendar, FileType, Eye } from "lucide-react";

interface DocMeta {
  id: string;
  filename: string;
  type: string;
  uploaded_at: string;
}

export default function DocumentLibrary() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog state for document details
  const [selectedDoc, setSelectedDoc] = useState<DocMeta | null>(null);
  const [showDocDialog, setShowDocDialog] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = docs.filter(doc =>
    doc.filename.toLowerCase().includes(search.toLowerCase())
  );

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'destructive';
      case 'docx': return 'default';
      case 'xlsx': return 'secondary';
      case 'pptx': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              <CardTitle>Document Library</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Browse and search through your uploaded documents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Document Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {loading ? (
              "Loading documents..."
            ) : (
              `${filtered.length} of ${docs.length} documents`
            )}
          </div>

          {/* Documents Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading documents...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {docs.length === 0 ? "No documents uploaded yet." : "No documents match your search."}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Filename
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4" />
                        Type
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Uploaded
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.filename}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getFileTypeColor(doc.type)}>
                          {doc.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(doc.uploaded_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle>Document Details</DialogTitle>
            </div>
            <DialogDescription>
              Information about the selected document
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Filename:</span> {selectedDoc.filename}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span>{" "}
                  <Badge variant={getFileTypeColor(selectedDoc.type)}>
                    {selectedDoc.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Uploaded:</span> {formatDate(selectedDoc.uploaded_at)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Document ID:</span> {selectedDoc.id}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDocDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}