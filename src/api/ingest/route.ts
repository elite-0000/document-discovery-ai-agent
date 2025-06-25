import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/parseDocument';
import { embedAndStore } from '@/lib/embedAndStore';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Parse document (extract text, tables, images)
  const parsed = await parseDocument(file);

  // Embed and store in Supabase
  await embedAndStore(parsed);

  return NextResponse.json({ success: true });
} 