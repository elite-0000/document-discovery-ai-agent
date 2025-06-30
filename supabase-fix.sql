-- Fix for Supabase match_documents function
-- Run this in your Supabase SQL Editor

-- 1. First, ensure the vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create or recreate the embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create or recreate the documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    size_bytes INTEGER,
    user_id TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    chunk_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed'))
);

-- 4. Drop existing function if it exists
DROP FUNCTION IF EXISTS match_documents(VECTOR, INT, JSONB);
DROP FUNCTION IF EXISTS match_documents(JSONB, INT, VECTOR);

-- 5. Create the correct match_documents function with proper parameter order
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5,
    filter JSONB DEFAULT '{}'
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        embeddings.id,
        embeddings.content,
        embeddings.metadata,
        1 - (embeddings.embedding <=> query_embedding) AS similarity
    FROM embeddings
    WHERE 
        CASE 
            WHEN filter = '{}' THEN TRUE
            ELSE embeddings.metadata @> filter
        END
    ORDER BY embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS embeddings_metadata_idx ON embeddings USING gin (metadata);
CREATE INDEX IF NOT EXISTS embeddings_created_at_idx ON embeddings (created_at);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON documents (uploaded_at);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents (status);

-- 7. Test the function (optional - you can run this to verify)
-- SELECT * FROM match_documents(
--     '[0.1, 0.2, 0.3]'::vector(1536), 
--     5, 
--     '{}'::jsonb
-- );

-- Setup complete! The function should now work correctly.
