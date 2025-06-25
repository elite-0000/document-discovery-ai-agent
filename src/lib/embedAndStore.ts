import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function embedAndStore(parsed: { text: string, metadata: any }) {
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! });
  const vectors = await embeddings.embedDocuments([parsed.text]);

  // Store in Supabase (assume a 'documents' table with 'embedding' column)
  await supabase.from('documents').insert([
    {
      content: parsed.text,
      metadata: parsed.metadata,
      embedding: vectors[0],
    }
  ]);
} 