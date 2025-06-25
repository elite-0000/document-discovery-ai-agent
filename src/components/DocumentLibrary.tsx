"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const res = await fetch("/api/library");
    const data = await res.json();
    setDocs(data.documents || []);
    setLoading(false);
  };

  const filtered = docs.filter(doc => doc.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search by filename..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-gray-400">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400">No documents found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Filename</th>
              <th className="p-2">Type</th>
              <th className="p-2">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => (
              <tr key={doc.id} className="border-t">
                <td className="p-2">{doc.filename}</td>
                <td className="p-2">{doc.type}</td>
                <td className="p-2">{new Date(doc.uploaded_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 