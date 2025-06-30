-- Supabase Database Setup for RAG Document Assistant
-- Run this script in your Supabase SQL editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create embeddings table (main vector store)
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create documents table (metadata)
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

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS embeddings_metadata_idx ON embeddings USING gin (metadata);
CREATE INDEX IF NOT EXISTS embeddings_created_at_idx ON embeddings (created_at);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON documents (uploaded_at);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents (status);

-- 5. Create match_documents function for vector similarity search
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

-- 6. Create helper functions
CREATE OR REPLACE FUNCTION get_document_stats(user_id_param TEXT DEFAULT NULL)
RETURNS TABLE(
    total_documents BIGINT,
    total_chunks BIGINT,
    total_size_mb NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT d.id) AS total_documents,
        COALESCE(SUM(d.chunk_count), 0) AS total_chunks,
        ROUND(COALESCE(SUM(d.size_bytes), 0) / 1024.0 / 1024.0, 2) AS total_size_mb
    FROM documents d
    WHERE 
        CASE 
            WHEN user_id_param IS NULL THEN TRUE
            ELSE d.user_id = user_id_param
        END;
END;
$$;

-- 7. Create trigger function for updating chunk counts
CREATE OR REPLACE FUNCTION update_document_chunk_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE documents 
        SET chunk_count = (
            SELECT COUNT(*) 
            FROM embeddings 
            WHERE metadata->>'fileName' = NEW.metadata->>'fileName'
        ),
        processed_at = NOW(),
        status = 'completed'
        WHERE filename = NEW.metadata->>'fileName';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE documents 
        SET chunk_count = (
            SELECT COUNT(*) 
            FROM embeddings 
            WHERE metadata->>'fileName' = OLD.metadata->>'fileName'
        )
        WHERE filename = OLD.metadata->>'fileName';
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- 8. Create trigger
DROP TRIGGER IF EXISTS update_chunk_count_trigger ON embeddings;
CREATE TRIGGER update_chunk_count_trigger
    AFTER INSERT OR DELETE ON embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_document_chunk_count();

-- 9. Enable Row Level Security (optional, for multi-user support)
-- ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies (uncomment if using authentication)
-- CREATE POLICY "Users can access their own embeddings" ON embeddings
--     FOR ALL USING (
--         (metadata->>'userId')::TEXT = auth.jwt() ->> 'sub'
--         OR auth.jwt() ->> 'role' = 'service_role'
--     );

-- CREATE POLICY "Users can access their own documents" ON documents
--     FOR ALL USING (
--         user_id = auth.jwt() ->> 'sub'
--         OR auth.jwt() ->> 'role' = 'service_role'
--     );

-- Setup complete! Your database is ready for the RAG Document Assistant.
