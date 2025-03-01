import { OpenAI } from 'openai';
import { db } from './db';
import type { Row } from '@libsql/client';

// Define the expected row type
interface EmbeddingRow extends Row {
  content: string;
  embedding: Buffer;
}

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY ?? ''
});

export async function generateEmbeddings(content: string) {
  const response = await openai.embeddings.create({
    input: content,
    model: "text-embedding-3-small"
  });

  if (!response.data[0]?.embedding) {
    throw new Error('Failed to generate embedding');
  }

  const embedding = response.data[0].embedding;

  await db.execute({
    sql: "INSERT INTO embeddings (content, embedding) VALUES (?, ?)",
    args: [content, Buffer.from(new Float32Array(embedding).buffer)]
  });
}

export async function findSimilarContent(query: string) {
  const queryEmbedding = await openai.embeddings.create({
    input: query,
    model: "text-embedding-3-small"
  });

  if (!queryEmbedding.data[0]?.embedding) {
    throw new Error('Failed to generate query embedding');
  }

  const results = await db.execute({
    sql: `
      SELECT content, embedding
      FROM embeddings
      ORDER BY cosine_similarity(embedding, ?) DESC
      LIMIT 5
    `,
    args: [Buffer.from(new Float32Array(queryEmbedding.data[0].embedding).buffer)]
  });

  // First cast to unknown, then to our expected type
  return results.rows as unknown as EmbeddingRow[];
}