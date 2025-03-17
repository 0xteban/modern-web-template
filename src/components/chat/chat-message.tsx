'use client';

import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from './types';
import Image from 'next/image';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex w-full items-start gap-2 py-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {message.imageUrl && (
          <div className="mb-2 relative w-full h-48 rounded-md overflow-hidden">
            <Image
              src={message.imageUrl}
              alt="Uploaded image"
              fill
              className="object-contain"
            />
          </div>
        )}
        {message.content}
      </div>
    </div>
  );
}
