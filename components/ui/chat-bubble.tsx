import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role: 'user' | 'assistant';
}

function ChatBubble({ role, className, children, ...props }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <div
      className={cn(
        'max-w-[85%] px-4 py-3 text-sm font-body leading-relaxed',
        isUser
          ? 'ml-auto bg-primary text-primary-foreground rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg'
          : 'mr-auto bg-surface-soft text-foreground rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ChatBubble };
