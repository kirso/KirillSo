import { GoogleGenerativeAI } from "@google/generative-ai";
// Import embeddings statically for Cloudflare Workers compatibility
import storedEmbeddingsData from "@/data/embeddings/resume-embeddings.json";

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

// Cast imported data to proper type
const storedEmbeddings: StoredEmbedding[] = storedEmbeddingsData as StoredEmbedding[];

function getGeminiClient(apiKey?: string) {
	const key = apiKey || process.env.GOOGLE_AI_API_KEY;
	if (!key) {
		throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
	}
	return new GoogleGenerativeAI(key);
}

// Note: generateEmbeddings is only available via the CLI script (scripts/generate-embeddings.ts)
// It cannot be used at runtime in Cloudflare Workers due to filesystem access limitations

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
