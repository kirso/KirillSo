import { GOOGLE_AI_API_KEY } from "astro:env/server";
import { env } from "cloudflare:workers";
import { GoogleGenAI } from "@google/genai";
import type { APIRoute } from "astro";
import { MAX_CHAT_MESSAGE_LENGTH } from "../../lib/chat-limits";
import { findSimilarContent } from "../../lib/embeddings";

// The only on-demand route besides server islands
export const prerender = false;

// Bounds every request before it reaches Gemini
const MAX_BODY_BYTES = 4_096;
const MAX_OUTPUT_TOKENS = 1_024;

function getGeminiClient() {
	if (!GOOGLE_AI_API_KEY) {
		throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
	}
	return new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
}

function createSystemMessage(similarContent: Array<{ source: string; content: string }>) {
	const formattedContent = similarContent
		.map((r) => `[Source: ${r.source}]\n${r.content}`)
		.join("\n\n");

	return `You are a helpful assistant answering questions about Kirill So's experience, background, and blog posts.
When referencing blog posts, always mention them by name.
Keep responses concise and friendly.
Use the following context to answer questions:

${formattedContent}`;
}

/** Reads the body as text, or returns null as soon as it passes `limit` bytes (the rest is never read). */
async function readBodyWithin(request: Request, limit: number): Promise<string | null> {
	if (Number(request.headers.get("content-length") ?? 0) > limit) return null;
	if (!request.body) return "";

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > limit) {
			// Stop reading; the runtime discards the rest (cancel() trips wrangler dev's proxy)
			reader.releaseLock();
			return null;
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(bytes);
}

/** Reads `{ "message": string }` from a JSON body, or returns the error response to send. */
async function readMessage(request: Request): Promise<string | Response> {
	if (!request.headers.get("content-type")?.includes("application/json")) {
		return new Response("Unsupported content type", { status: 415 });
	}

	const body = await readBodyWithin(request, MAX_BODY_BYTES);
	if (body === null) {
		return new Response("Request too large", { status: 413 });
	}

	let message: unknown;
	try {
		message = (JSON.parse(body) as { message?: unknown } | null)?.message;
	} catch {
		return new Response("Invalid JSON", { status: 400 });
	}

	if (typeof message !== "string" || message.trim().length === 0) {
		return new Response("Message is required", { status: 400 });
	}
	if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
		return new Response("Message too long", { status: 413 });
	}
	return message.trim();
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
	// Runtime switch: the same var also hides the chat button at build time
	if (env.PUBLIC_ENABLE_CHAT !== "true") {
		return new Response("Chat is disabled", { status: 503 });
	}

	// Shared across isolates, counted per Cloudflare location
	const { success } = await env.CHAT_RATE_LIMITER.limit({ key: clientAddress ?? "anonymous" });
	if (!success) {
		return new Response("Too many requests. Please try again later.", {
			status: 429,
			headers: {
				"Retry-After": "60",
			},
		});
	}

	try {
		const message = await readMessage(request);
		if (message instanceof Response) return message;

		// Get relevant context from the bundled content index.
		const similarContent = await findSimilarContent(message);
		console.log(
			"Found similar content:",
			similarContent.map((c) => ({
				source: c.source,
				similarity: c.similarity,
			})),
		);

		// Generate streaming response with Gemini
		const genAI = getGeminiClient();
		const result = await genAI.models.generateContentStream({
			model: "gemini-2.5-flash",
			contents: message,
			config: {
				systemInstruction: createSystemMessage(similarContent),
				maxOutputTokens: MAX_OUTPUT_TOKENS,
				// Thinking tokens are billed as output; short answers from supplied context don't need them
				thinkingConfig: { thinkingBudget: 0 },
			},
		});

		// Create readable stream for response
		const readable = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of result) {
						const text = chunk.text;
						if (text) {
							controller.enqueue(new TextEncoder().encode(text));
						}
					}
					controller.close();
				} catch (error) {
					console.error("Stream error:", error);
					controller.error(error);
				}
			},
		});

		return new Response(readable, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		// Details stay in the Worker logs; the client gets a generic message
		console.error("Chat error:", error);
		return new Response("Chat is temporarily unavailable", { status: 500 });
	}
};
