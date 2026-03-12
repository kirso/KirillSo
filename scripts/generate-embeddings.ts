import "dotenv/config";
import fs from "node:fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import matter from "gray-matter";
import { marked } from "marked";
import path from "node:path";

const EMBEDDINGS_FILE = path.join(
	process.cwd(),
	"src",
	"data",
	"embeddings",
	"resume-embeddings.json",
);

interface StoredEmbedding {
	content: string;
	embedding: number[];
	source: string;
}

async function generateEmbeddings(content: string, source: string): Promise<void> {
	const apiKey = process.env.GOOGLE_AI_API_KEY;
	if (!apiKey) {
		throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
	}
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
	const result = await model.embedContent(content);
	const embedding = result.embedding.values;

	if (!embedding || !Array.isArray(embedding)) {
		throw new Error("Failed to generate embedding");
	}

	const dir = path.dirname(EMBEDDINGS_FILE);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	let embeddings: StoredEmbedding[] = [];
	if (fs.existsSync(EMBEDDINGS_FILE)) {
		const fileContent = fs.readFileSync(EMBEDDINGS_FILE, "utf-8");
		embeddings = JSON.parse(fileContent);
	}

	embeddings.push({ content, embedding, source });
	fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(embeddings, null, 2));
}

// Gemini text-embedding-004 supports up to 2048 tokens
const MAX_CHUNK_LENGTH = 6000; // Conservative limit to account for tokens vs chars

function chunkContent(content: string): string[] {
	// Split content into paragraphs
	const paragraphs = content.split("\n\n");
	const chunks: string[] = [];
	let currentChunk = "";

	for (const paragraph of paragraphs) {
		// If adding this paragraph would exceed the limit, save current chunk and start new one
		if ((currentChunk + paragraph).length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
			chunks.push(currentChunk.trim());
			currentChunk = paragraph;
		} else {
			currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
		}
	}

	// Add the last chunk if it's not empty
	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

function findMarkdownFiles(dir: string): string[] {
	const files: string[] = [];

	const items = fs.readdirSync(dir);
	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory() && !item.startsWith(".")) {
			// Recursively search directories
			files.push(...findMarkdownFiles(fullPath));
		} else if ((item.endsWith(".md") || item.endsWith(".mdx")) && !item.startsWith(".")) {
			files.push(fullPath);
		}
	}

	return files;
}

async function generateAllEmbeddings() {
	try {
		console.log("🔍 Starting embeddings generation...\n");

		// Generate embeddings for resume
		const resumePath = path.join(process.cwd(), "src", "assets", "cv", "resume.md");
		if (fs.existsSync(resumePath)) {
			const resumeContent = fs.readFileSync(resumePath, "utf-8");
			await generateEmbeddings(resumeContent, "resume");
			console.log("✓ Generated embeddings for resume");
		}

		// Generate embeddings for posts and notes
		const contentTypes = ["post", "note"];
		for (const type of contentTypes) {
			const contentPath = path.join(process.cwd(), "src", "content", type);

			if (!fs.existsSync(contentPath)) {
				console.log(`⚠️ Content directory not found: ${contentPath}`);
				continue;
			}

			// Find all markdown files recursively
			const markdownFiles = findMarkdownFiles(contentPath);
			console.log(`\n📝 Found ${markdownFiles.length} ${type}s`);

			for (const filePath of markdownFiles) {
				// Get relative path from content directory for source
				const relativePath = path.relative(contentPath, filePath);
				const source = `${type}/${relativePath}`;

				console.log(`  Processing ${relativePath}`);

				const content = fs.readFileSync(filePath, "utf-8");
				const { content: mdContent } = matter(content);

				// Parse markdown to HTML and ensure it's not undefined
				const parsedContent = await marked.parse(mdContent);
				if (!parsedContent) {
					console.log(`  ⚠️ Skipping ${relativePath} - failed to parse markdown`);
					continue;
				}

				// Split content into chunks if it's too long
				const chunks = chunkContent(parsedContent);
				console.log(`    Found ${chunks.length} chunks`);

				for (let i = 0; i < chunks.length; i++) {
					const chunk = chunks[i];
					const chunkSource = chunks.length > 1 ? `${source}#part${i + 1}` : source;

					if (!chunk) {
						console.log(`    ⚠️ Skipping empty chunk ${i + 1}`);
						continue;
					}

					await generateEmbeddings(chunk, chunkSource);
					console.log(`    ✓ Generated embeddings for ${chunkSource}`);
				}
			}
		}

		console.log("\n✨ All embeddings generated successfully");
	} catch (error) {
		console.error("\n❌ Error generating embeddings:", error);
		process.exit(1);
	}
}

generateAllEmbeddings();
