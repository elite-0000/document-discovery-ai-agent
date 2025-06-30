import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
// import { OpenAI } from 'langchain/llms/openai'; // Uncomment if using LangChain LLM

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    console.log(`Processing chat question: ${question}`);

    // Embed the question
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! });
    const [queryEmbedding] = await embeddings.embedDocuments([question]);

    // Vector search in Supabase (assume 'documents' table with 'embedding' column)
    const { data: docs, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: 3,
    });

    if (searchError) {
      console.error('Supabase search error:', searchError);
      return NextResponse.json({
        error: 'Failed to search documents. Please check your database configuration.'
      }, { status: 500 });
    }

    // Concatenate retrieved docs as context
    const context = docs?.map((d: any) => d.content).join('\n') || '';
    console.log(`Found ${docs?.length || 0} relevant documents`);

    // Call OpenAI to generate answer (simple fetch, or use LangChain LLM)
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Use the provided context to answer.' },
          { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` },
        ],
        max_tokens: 512,
      }),
    });

    if (!completion.ok) {
      throw new Error(`OpenAI API error: ${completion.status} ${completion.statusText}`);
    }

    const completionData = await completion.json();
    const answer = completionData.choices?.[0]?.message?.content || 'No answer.';

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in chat endpoint:', error);

    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        return NextResponse.json({
          error: 'Failed to generate response. Please check your OpenAI API configuration.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Failed to process your question. Please try again.'
    }, { status: 500 });
  }
}
