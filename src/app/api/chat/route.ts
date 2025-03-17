import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { z } from 'zod';
import OpenAI from 'openai';

// Schema for request validation
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
      imageUrl: z.string().optional(),
      imageBase64: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { messages } = chatRequestSchema.parse(body);

    // Transform messages for OpenAI API format
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(message => {
      // For user messages with images, convert to the format expected by OpenAI
      if (message.role === 'user' && (message.imageUrl || message.imageBase64)) {
        return {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: message.content 
            } as const,
            {
              type: 'image_url',
              image_url: {
                // Use base64 data if available, otherwise use URL
                url: message.imageBase64 || new URL(message.imageUrl!, request.nextUrl.origin).toString(),
              },
            } as const,
          ],
        };
      }
      
      // For regular messages without images
      return {
        role: message.role,
        content: message.content,
      };
    });

    // Call OpenAI API with GPT-4o (current multimodal model)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the assistant's message
    const assistantMessage = response.choices[0].message;

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error('Error processing chat request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat request', message: (error as Error).message },
      { status: 500 }
    );
  }
}
