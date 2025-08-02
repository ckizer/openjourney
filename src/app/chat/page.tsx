'use client';

import { useState, useCallback } from 'react';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from '@/components/ui/chat-container';
import { ScrollButton } from '@/components/ui/scroll-button';
import { Message, MessageContent } from '@/components/ui/message';
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSubmit = useCallback(() => {
    sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Gallery</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">OpenAI Chat</h1>
            <p className="text-muted-foreground">Chat with GPT-4</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 relative">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <h2 className="text-lg font-semibold mb-2">Welcome to OpenAI Chat</h2>
                  <p>Start a conversation by typing a message below.</p>
                </div>
              )}
              {messages.map((message) => (
                <Message key={message.id} className="max-w-3xl">
                  <MessageContent 
                    markdown={message.role === 'assistant'}
                    className={message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : ''}
                  >
                    {message.content}
                  </MessageContent>
                </Message>
              ))}
              {isLoading && (
                <Message className="max-w-3xl">
                  <MessageContent>
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Thinking...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
              <ChatContainerScrollAnchor />
            </div>
          </ChatContainerContent>
          <div className="absolute bottom-4 right-4">
            <ScrollButton />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <PromptInput
            value={inputValue}
            onValueChange={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          >
            <PromptInputTextarea 
              placeholder="Type your message here..." 
              disabled={isLoading}
            />
            <PromptInputActions>
              <PromptInputAction tooltip="Send message">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleSubmit}
                  disabled={isLoading || !inputValue.trim()}
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}