import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { query, queryOne } from '@/lib/db';
import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
      imageUrl: z.string().optional(),
      imageBase64: z.string().optional(),
    })
  ),
  accountId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to use this API' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const { messages, accountId } = messageSchema.parse(body);

    // Verify user has access to the account
    const accountAccess = await queryOne(
      `SELECT am.* 
       FROM account_members am
       WHERE am.account_id = $1 AND am.user_id = $2`,
      [accountId, stackUser.id],
      { useAuthenticated: true }
    );

    if (!accountAccess) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have access to this account' },
        { status: 403 }
      );
    }

    // Get or create conversation (using the last non-system message as title)
    const userMessages = messages.filter(m => m.role === 'user');
    const conversationTitle = userMessages.length > 0 
      ? userMessages[userMessages.length - 1].content.substring(0, 50) + (userMessages[userMessages.length - 1].content.length > 50 ? '...' : '')
      : 'New Conversation';

    // Create new conversation
    const [conversation] = await query(
      'INSERT INTO conversations (id, account_id, title, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING *',
      [accountId, conversationTitle],
      { useAuthenticated: true }
    );

    // Save messages
    for (const msg of messages) {
      if (msg.role !== 'system') {
        await query(
          'INSERT INTO messages (id, conversation_id, user_id, content, is_from_ai, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())',
          [
            conversation.id, 
            msg.role === 'user' ? stackUser.id : null, 
            msg.content,
            msg.role === 'assistant'
          ],
          { useAuthenticated: true }
        );
      }
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.imageUrl && { image_url: msg.imageUrl }),
      })),
    });

    // Save AI response
    const aiResponse = completion.choices[0]?.message?.content;
    if (aiResponse) {
      await query(
        'INSERT INTO messages (id, conversation_id, content, is_from_ai, created_at) VALUES (gen_random_uuid(), $1, $2, true, NOW())',
        [conversation.id, aiResponse],
        { useAuthenticated: true }
      );
    }

    return NextResponse.json({
      success: true,
      content: aiResponse,
      data: {
        conversation,
        messages: [
          ...messages,
          {
            id: 'temp-ai-response',
            role: 'assistant',
            content: aiResponse,
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
