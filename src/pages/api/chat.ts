import "dotenv/config";
import type { APIRoute } from "astro";
import { OpenAI } from "openai";
import { findSimilarContent } from "../../lib/embeddings";
import { chatRateLimiter } from "../../lib/rateLimit";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://oai.helicone.ai/v1",
    defaultHeaders: {
      "Helicone-Auth": "Bearer sk-helicone-67ywmhy-usmubha-sl7gb4q-hsdjady",
    },
  });
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return client;
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
    const similarContent = await findSimilarContent(message);
    console.log(
      "Found similar content:",
      similarContent.map((c) => ({
        source: c.source,
        similarity: c.similarity,
      })),
    );

    // Generate streaming response
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant answering questions about Kirill So's experience, background, and blog posts.
                   When referencing blog posts, always mention them by name.
                   Use the following context to answer questions:
                   ${similarContent.map((r) => `[Source: ${r.source}]\n${r.content}`).join("\n\n")}`,
        },
        { role: "user", content: message },
      ],
      stream: true,
    });

    // Create readable stream for response
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(content);
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
