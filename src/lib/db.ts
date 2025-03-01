import { createClient } from '@libsql/client';

export const db = createClient({
  url: import.meta.env.TURSO_DB_URL ?? '',
  authToken: import.meta.env.TURSO_DB_TOKEN ?? ''
});

// SQLite doesn't have built-in cosine similarity, so we'll add it as a function
async function setupDbExtensions() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cosine_similarity (a BLOB, b BLOB, RETURNS REAL);
  `);
}

export async function initDb() {
  await setupDbExtensions();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      embedding BLOB NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_bot BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}