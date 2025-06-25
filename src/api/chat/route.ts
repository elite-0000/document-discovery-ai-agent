import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js';
// import { OpenAI } from 'langchain/llms/openai'; // Uncomment if using LangChain LLM

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question) {
    return NextResponse.json({ error: 'No question provided' }, { status: 400 });
  }

  // Embed the question
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! });
  const [queryEmbedding] = await embeddings.embedDocuments([question]);

  // Vector search in Supabase (assume 'documents' table with 'embedding' column)
  const { data: docs } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 3,
  });

  // Concatenate retrieved docs as context
  const context = docs?.map((d: any) => d.content).join('\n') || '';

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
  const completionData = await completion.json();
  const answer = completionData.choices?.[0]?.message?.content || 'No answer.';

  return NextResponse.json({ answer });
} 