import { NextRequest, NextResponse } from 'next/server';
import { ragChat } from '@/lib/embedAndStore';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    console.log(`Processing chat question: ${question}`);

    // Use the ragChat function from embedAndStore.ts
    // For now, use a dummy userId - in production, get this from authentication
    const userId = 'user-123';
    const result = await ragChat(question, userId);

    return NextResponse.json({ answer: result.answer });

  } catch (error) {
    console.error('Error in chat endpoint:', error);

    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        return NextResponse.json({
          error: 'Failed to generate response. Please check your OpenAI API configuration.'
        }, { status: 500 });
      }
      
      if (error.message.includes('Supabase')) {
        return NextResponse.json({
          error: 'Failed to search documents. Please check your database configuration.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Failed to process your question. Please try again.'
    }, { status: 500 });
  }
}
