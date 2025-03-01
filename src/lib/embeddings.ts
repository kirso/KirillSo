import { OpenAI } from 'openai';
import { db } from './db';
import type { Row } from '@libsql/client';

// Define all necessary types
interface EmbeddingRow extends Row {
  content: string;
  embedding: Buffer;
}

type EmbeddingVector = number[];

interface EmbeddingResult {
  content: string;
  similarity: number;
}

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

const EMBEDDING_MODEL = "text-embedding-3-small" as const;

export async function generateEmbeddings(content: string): Promise<void> {
  const response = await openai.embeddings.create({
    input: content,
    model: EMBEDDING_MODEL
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Failed to generate embedding');
  }

  // Store embedding directly as Buffer
  const buffer = Buffer.from(new Float32Array(embedding).buffer);

  await db.execute({
    sql: "INSERT INTO embeddings (content, embedding) VALUES (?, ?)",
    args: [content, buffer]
  });
}

function cosineSimilarity(vecA: EmbeddingVector, vecB: EmbeddingVector): number {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error('Inputs must be arrays');
  }

  if (vecA.length !== vecB.length) {
    console.error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const length = vecA.length;
  for (let i = 0; i < length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number.isFinite(similarity) ? similarity : 0;
}

export async function findSimilarContent(query: string): Promise<EmbeddingResult[]> {
  const response = await openai.embeddings.create({
    input: query,
    model: EMBEDDING_MODEL
  });

  const queryVector = response.data[0]?.embedding;
  if (!queryVector || !Array.isArray(queryVector)) {
    throw new Error('Failed to generate query embedding');
  }

  const results = await db.execute('SELECT content, embedding FROM embeddings');
  const rows = results.rows as unknown as EmbeddingRow[];

  // Calculate similarities in memory
  const similarities: EmbeddingResult[] = rows.map(row => {
    // Convert stored buffer back to array
    const float32Array = new Float32Array(row.embedding);
    const embedding = Array.from(float32Array);

    console.log('Query vector length:', queryVector.length);
    console.log('Stored vector length:', embedding.length);

    return {
      content: row.content,
      similarity: cosineSimilarity(embedding, queryVector)
    };
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}