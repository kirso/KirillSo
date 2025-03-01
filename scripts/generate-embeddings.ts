import { readFileSync } from 'fs';
import { marked, type TokensList, type Token } from 'marked';
import { initDb } from '../src/lib/db';
import { generateEmbeddings } from '../src/lib/embeddings';

type ListItem = {
  type: 'list_item';
  text: string;
  tokens: Token[];
};

type ListToken = Token & {
  type: 'list';
  items: ListItem[];
};

type ParagraphToken = Token & {
  type: 'paragraph';
  text: string;
};

async function main() {
  await initDb();

  const resumeContent = readFileSync('./src/assets/cv/resume.md', 'utf-8');
  const tokens = marked.lexer(resumeContent) as TokensList;

  // Split content into chunks and generate embeddings
  for (const token of tokens) {
    if (token.type === 'paragraph') {
      await generateEmbeddings((token as ParagraphToken).text);
    } else if (token.type === 'list') {
      const listToken = token as ListToken;
      for (const item of listToken.items) {
        await generateEmbeddings(item.text);
      }
    }
  }
}

main().catch(console.error);