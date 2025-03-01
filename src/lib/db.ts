import { createClient } from '@libsql/client';

if (!import.meta.env.TURSO_DB_URL) {
  throw new Error('TURSO_DB_URL environment variable is not set');
}

if (!import.meta.env.TURSO_DB_TOKEN) {
  throw new Error('TURSO_DB_TOKEN environment variable is not set');
}

export const db = createClient({
  url: import.meta.env.TURSO_DB_URL,
  authToken: import.meta.env.TURSO_DB_TOKEN
});

// Initialize tables one by one
export async function initDb() {
  try {
    // Create embeddings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        embedding BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat history table in a separate statement
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        message TEXT NOT NULL,
        is_bot BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add cosine similarity function in a separate statement
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cosine_similarity (
        a BLOB,
        b BLOB,
        RETURNS REAL
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}