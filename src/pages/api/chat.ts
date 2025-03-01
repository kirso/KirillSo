import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';
import { findSimilarContent } from '../../lib/embeddings';
import { chatRateLimiter } from '../../lib/rateLimit';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY ?? ''
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Check rate limit
    const identifier = clientAddress ?? 'anonymous';
    const isLimited = await chatRateLimiter.isLimited(identifier);

    if (isLimited) {
      return new Response('Too many requests. Please try again later.', {
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }

    // Check content type
    const contentType = request.headers.get('content-type');
    let message: string | undefined;

    if (contentType?.includes('application/json')) {
      const json = await request.json();
      message = json.message;
    } else if (contentType?.includes('application/x-www-form-urlencoded') ||
               contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = formData.get('message')?.toString();
    } else {
      return new Response('Unsupported content type', { status: 415 });
    }

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
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}