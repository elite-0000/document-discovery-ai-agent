import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from '@langchain/core/documents';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.1,
});

// Text splitter for chunking documents
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

// Initialize Supabase vector store
async function getVectorStore() {
  return SupabaseVectorStore.fromExistingIndex(embeddings, {
    client: supabase,
    tableName: 'embeddings',
    queryName: 'match_documents',
  });
}

// Document loader based on file type
async function loadDocument(file: File): Promise<Document[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    const loader = new PDFLoader(file);
    return await loader.load();
  } else if (fileName.endsWith('.txt')) {
    // For text files, we'll create a simple document
    const text = await file.text();
    return [new Document({ pageContent: text, metadata: { source: file.name } })];
  } else {
    throw new Error(`Unsupported file type: ${fileName}`);
  }
}

// 1. Document Processing and Embedding Storage
export async function processAndStoreDocument(file: File, userId: string) {
  try {
    // Load document
    const docs = await loadDocument(file);
    
    // Split into chunks
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Add metadata
    const docsWithMetadata = splitDocs.map((doc, index) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        fileName: file.name,
        userId,
        chunkIndex: index,
        uploadedAt: new Date().toISOString(),
      },
    }));

    // Store in Supabase vector store
    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(docsWithMetadata);

    return {
      success: true,
      chunks: docsWithMetadata.length,
      fileName: file.name,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// 2. Semantic Search with RAG
export async function semanticSearch(query: string, userId: string, limit: number = 5) {
  try {
    const vectorStore = await getVectorStore();
    
    // Search for relevant documents
    const results = await vectorStore.similaritySearch(query, limit, {
      filter: { userId },
    });

    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score: doc.metadata.score,
    }));
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

// 3. RAG Chat with Context
export async function ragChat(
  query: string,
  userId: string,
  chatHistory: Array<{ role: string; content: string }> = []
) {
  try {
    // Get relevant context
    const searchResults = await semanticSearch(query, userId, 3);
    const context = searchResults.map(r => r.content).join('\n\n');

    // Create messages array
    const messages = [
      new SystemMessage(`You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.

Context:
${context}

Answer the question based on the context provided.`),
      ...chatHistory.map(msg => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content)
          : new SystemMessage(msg.content)
      ),
      new HumanMessage(query),
    ];

    // Execute
    const response = await chatModel.invoke(messages);

    return {
      answer: response.content,
      sources: searchResults.map(r => r.metadata),
    };
  } catch (error) {
    console.error('Error in RAG chat:', error);
    throw error;
  }
}

// 4. Document Classification
export async function classifyDocument(text: string) {
  const classificationSchema = z.object({
    category: z.enum(['Finance', 'Legal', 'Technical', 'Medical', 'Educational', 'Other']),
    confidence: z.number().min(0).max(1),
    keywords: z.array(z.string()),
    summary: z.string().max(200),
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an expert document classifier. Analyze the given text and classify it into the appropriate category. Return a JSON object with category, confidence, keywords, and summary.'],
    ['user', 'Classify this document: {text}'],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);

  try {
    const result = await chain.invoke({ text });
    // Parse the JSON response
    const parsed = JSON.parse(result);
    return classificationSchema.parse(parsed);
  } catch (error) {
    console.error('Error in document classification:', error);
    throw error;
  }
}

// 5. Data Extraction
export async function extractStructuredData(text: string) {
  const extractionSchema = z.object({
    entities: z.array(z.object({
      name: z.string(),
      type: z.enum(['Person', 'Organization', 'Date', 'Amount', 'Location', 'Other']),
      value: z.string(),
    })),
    dates: z.array(z.string()),
    amounts: z.array(z.number()),
    keyPoints: z.array(z.string()),
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an expert data extraction specialist. Extract structured information from the given text. Return a JSON object with entities, dates, amounts, and keyPoints.'],
    ['user', 'Extract structured data from: {text}'],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);

  try {
    const result = await chain.invoke({ text });
    // Parse the JSON response
    const parsed = JSON.parse(result);
    return extractionSchema.parse(parsed);
  } catch (error) {
    console.error('Error in data extraction:', error);
    throw error;
  }
}

// 6. Document Summarization
export async function summarizeDocument(text: string, maxLength: number = 500) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are an expert document summarizer. Create a concise summary of the given text in ${maxLength} words or less.`],
    ['user', 'Summarize this document: {text}'],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);

  try {
    const summary = await chain.invoke({ text });
    return summary;
  } catch (error) {
    console.error('Error in document summarization:', error);
    throw error;
  }
}

// 7. Question Answering with Citations
export async function answerWithCitations(
  question: string,
  userId: string,
  includeCitations: boolean = true
) {
  try {
    const searchResults = await semanticSearch(question, userId, 5);
    const context = searchResults.map(r => r.content).join('\n\n');

    const messages = [
      new SystemMessage(`You are a helpful AI assistant. Answer the question based on the provided context. ${includeCitations ? 'Include citations to the source documents when possible.' : ''}

Context:
${context}`),
      new HumanMessage(question),
    ];

    const response = await chatModel.invoke(messages);

    return {
      answer: response.content,
      sources: includeCitations ? searchResults.map(r => r.metadata) : [],
    };
  } catch (error) {
    console.error('Error in question answering:', error);
    throw error;
  }
} 