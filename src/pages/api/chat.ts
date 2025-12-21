import { GoogleGenerativeAI } from "@google/generative-ai";
import type { APIRoute } from "astro";
import { GOOGLE_AI_API_KEY } from "astro:env/server";
import { findSimilarContent } from "../../lib/embeddings";
import { chatRateLimiter } from "../../lib/rateLimit";

function getGeminiClient() {
	if (!GOOGLE_AI_API_KEY) {
		throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
	}
	return new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
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

export const POST: APIRoute = async ({ request, clientAddress }) => {
	try {
		// Check rate limit
		const identifier = clientAddress ?? "anonymous";
		const isLimited = await chatRateLimiter.isLimited(identifier);

		if (isLimited) {
			return new Response("Too many requests. Please try again later.", {
				status: 429,
				headers: {
					"Retry-After": "60",
				},
			});
		}

		// Check content type
		const contentType = request.headers.get("content-type");
		let message: string | undefined;

		if (contentType?.includes("application/json")) {
			const json = await request.json();
			message = json.message;
		} else if (
			contentType?.includes("application/x-www-form-urlencoded") ||
			contentType?.includes("multipart/form-data")
		) {
			const formData = await request.formData();
			message = formData.get("message")?.toString();
		} else {
			return new Response("Unsupported content type", { status: 415 });
		}

		if (!message) {
			return new Response("Message is required", { status: 400 });
		}

		// Get relevant context from embeddings
		const similarContent = await findSimilarContent(message, GOOGLE_AI_API_KEY);
		console.log(
			"Found similar content:",
			similarContent.map((c) => ({
				source: c.source,
				similarity: c.similarity,
			})),
		);

		// Generate streaming response with Gemini
		const genAI = getGeminiClient();
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

		const chat = model.startChat({
			history: [
				{
					role: "user",
					parts: [{ text: "System instruction: " + createSystemMessage(similarContent) }],
				},
				{
					role: "model",
					parts: [
						{
							text: "Understood. I'll help answer questions about Kirill So based on the provided context.",
						},
					],
				},
			],
		});

		const result = await chat.sendMessageStream(message);

		// Create readable stream for response
		const readable = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of result.stream) {
						const text = chunk.text();
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
				"Transfer-Encoding": "chunked",
			},
		});
	} catch (error) {
		console.error("Chat error:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("Error details:", errorMessage);
		return new Response(`Error: ${errorMessage}`, { status: 500 });
	}
};
