import { NextRequest, NextResponse } from 'next/server';
import { processAndStoreDocument } from '@/lib/embedAndStore';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.',
        suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.'
      }, { status: 500 });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
        suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.'
      }, { status: 500 });
    }

    // For now, use a dummy userId - in production, get this from authentication
    const userId = 'user-123';

    // Process and store document using the embedAndStore function
    const result = await processAndStoreDocument(file, userId);
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.fileName} into ${result.chunks} chunks`,
      chunks: result.chunks,
      fileName: result.fileName
    });

  } catch (error) {
    console.error('Error in document ingestion:', error);

    // Return specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('pdf-parse')) {
        return NextResponse.json({
          error: 'Failed to parse PDF. The file might be corrupted, password-protected, or contain unsupported content.',
          suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.'
        }, { status: 422 });
      }
      if (error.message.includes('Unsupported file type')) {
        return NextResponse.json({
          error: 'Unsupported file type. Please upload PDF, DOCX, XLSX, or PPTX files.'
        }, { status: 400 });
      }
      if (error.message.includes('OpenAI') || error.message.includes('401') || error.message.includes('organization')) {
        return NextResponse.json({
          error: 'OpenAI API authentication failed. Please check your API key and organization access.',
          suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.',
          details: 'Make sure you have a valid OpenAI API key and are part of an organization.'
        }, { status: 500 });
      }
      if (error.message.includes('Supabase')) {
        return NextResponse.json({
          error: 'Failed to store document. Please check your database configuration.',
          suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Failed to process document. Please try again or contact support if the issue persists.',
      suggestion: 'Try the "Test PDF Parsing" tab to test document parsing without embeddings.'
    }, { status: 500 });
  }
}
