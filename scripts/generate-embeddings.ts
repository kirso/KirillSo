import { generateEmbeddings } from '../src/lib/embeddings';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

async function main() {
  try {
    // Read resume content
    const resumePath = path.join(process.cwd(), 'src', 'assets', 'cv', 'resume.md');
    const resumeContent = fs.readFileSync(resumePath, 'utf-8');

    // Convert markdown to plain text
    const plainText = await marked.parse(resumeContent);

    // Generate embeddings
    await generateEmbeddings(plainText);

    console.log('Embeddings generated successfully!');
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    process.exit(1);
  }
}

main();