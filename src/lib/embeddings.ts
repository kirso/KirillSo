import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Define types
type EmbeddingVector = number[];

interface EmbeddingResult {
	content: string;
	similarity: number;
	source: string;
}

interface StoredEmbedding {
	content: string;
	embedding: number[];
	source: string;
}

const EMBEDDINGS_FILE = path.join(
	process.cwd(),
	"src",
	"data",
	"embeddings",
	"resume-embeddings.json",
);

function getGeminiClient(apiKey?: string) {
	const key = apiKey || process.env.GOOGLE_AI_API_KEY;
	if (!key) {
		throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
	}
	return new GoogleGenerativeAI(key);
}

export async function generateEmbeddings(content: string, source: string): Promise<void> {
	const genAI = getGeminiClient();
	const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

	const result = await model.embedContent(content);
	const embedding = result.embedding.values;

	if (!embedding || !Array.isArray(embedding)) {
		throw new Error("Failed to generate embedding");
	}

	// Create embeddings directory if it doesn't exist
	const dir = path.dirname(EMBEDDINGS_FILE);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Read existing embeddings or create new array
	let embeddings: StoredEmbedding[] = [];
	if (fs.existsSync(EMBEDDINGS_FILE)) {
		const fileContent = fs.readFileSync(EMBEDDINGS_FILE, "utf-8");
		embeddings = JSON.parse(fileContent);
	}

	// Add new embedding
	embeddings.push({
		content,
		embedding,
		source,
	});

	// Write back to file
	fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(embeddings, null, 2));
}

function cosineSimilarity(vecA: EmbeddingVector, vecB: EmbeddingVector): number {
	if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
		throw new Error("Inputs must be arrays");
	}

	if (vecA.length !== vecB.length) {
		console.error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
		throw new Error("Vectors must have the same length");
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

export async function findSimilarContent(query: string, apiKey?: string): Promise<EmbeddingResult[]> {
	const genAI = getGeminiClient(apiKey);

	try {
		// Read stored embeddings
		if (!fs.existsSync(EMBEDDINGS_FILE)) {
			console.error("No embeddings file found at:", EMBEDDINGS_FILE);
			throw new Error("No embeddings found. Please generate embeddings first.");
		}

		const fileContent = fs.readFileSync(EMBEDDINGS_FILE, "utf-8");
		const storedEmbeddings: StoredEmbedding[] = JSON.parse(fileContent);

		// Filter out embeddings without sources
		const validEmbeddings = storedEmbeddings.filter((e) => e.source);
		console.log(
			"Found stored embeddings:",
			validEmbeddings.map((e) => e.source),
		);

		// Generate query embedding using Gemini
		const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
		const result = await model.embedContent(query);
		const queryVector = result.embedding.values;

		if (!queryVector || !Array.isArray(queryVector)) {
			throw new Error("Failed to generate query embedding");
		}

		// Calculate similarities only for valid embeddings
		const similarities: EmbeddingResult[] = validEmbeddings.map((stored) => ({
			content: stored.content,
			similarity: cosineSimilarity(stored.embedding, queryVector),
			source: stored.source,
		}));

		// Sort by similarity and get top 5
		const results = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5);

		console.log(
			"Top matches:",
			results.map((r) => ({ source: r.source, similarity: r.similarity })),
		);
		return results;
	} catch (error) {
		console.error("Error finding similar content:", error);
		throw error;
	}
}
