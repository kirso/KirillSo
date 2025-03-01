import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';
import { findSimilarContent } from '../../lib/embeddings';
import { db } from '../../lib/db';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const message = formData.get('message')?.toString();

  if (!message) {
    return new Response('Message is required', { status: 400 });
  }

  // Get relevant context from embeddings
  const similarContent = await findSimilarContent(message);

  // Generate streaming response
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant answering questions about the resume.
                 Use the following context to answer questions: ${similarContent.map(r => r.content).join('\n')}`
      },
      { role: "user", content: message }
    ],
    stream: true
  });

  // Create readable stream for response
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(content);
      }
      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    }
  });
}