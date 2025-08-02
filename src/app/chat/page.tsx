'use client';

import { useState, useCallback } from 'react';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from '@/components/ui/chat-container';
import { ScrollButton } from '@/components/ui/scroll-button';
import { Message, MessageContent } from '@/components/ui/message';
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input';
import { FileUpload, FileUploadContent, FileUploadTrigger } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowUp, Square, Paperclip, X } from 'lucide-react';

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
  const [files, setFiles] = useState<File[]>([]);

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

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() || files.length > 0) {
      sendMessage(inputValue);
      setFiles([]); // Clear files after sending
    }
  }, [inputValue, files, sendMessage]);

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
            <h1 className="text-1xl font-bold">AI Chat</h1>
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
                  {message.role === 'assistant' ? (
                    <MessageContent markdown className="">
                      {message.content}
                    </MessageContent>
                  ) : (
                    <MessageContent className="bg-primary text-primary-foreground ml-auto">
                      {message.content}
                    </MessageContent>
                  )}
                </Message>
              ))}
              {isLoading && (
                <Message className="max-w-3xl">
                  <div className="rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
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
          <FileUpload
            onFilesAdded={handleFilesAdded}
            accept=".jpg,.jpeg,.png,.pdf,.docx,.txt,.md"
          >
            <PromptInput
              value={inputValue}
              onValueChange={setInputValue}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              className="w-full"
            >
              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-secondary flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="size-4" />
                        <span className="max-w-[120px] truncate text-sm">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="hover:bg-secondary/50 rounded-full p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <PromptInputTextarea 
                placeholder="Type a message or drop files..." 
                disabled={isLoading}
              />

              <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                <PromptInputAction tooltip="Attach files">
                  <FileUploadTrigger asChild>
                    <div className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl">
                      <Paperclip className="text-primary size-5" />
                    </div>
                  </FileUploadTrigger>
                </PromptInputAction>

                <PromptInputAction
                  tooltip={isLoading ? "Stop generation" : "Send message"}
                >
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleSubmit}
                    disabled={(!inputValue.trim() && files.length === 0) && !isLoading}
                  >
                    {isLoading ? (
                      <Square className="size-5 fill-current" />
                    ) : (
                      <ArrowUp className="size-5" />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>

            <FileUploadContent>
              <div className="flex min-h-[200px] w-full items-center justify-center backdrop-blur-sm">
                <div className="bg-background/90 m-4 w-full max-w-md rounded-lg border p-8 shadow-lg">
                  <div className="mb-4 flex justify-center">
                    <svg
                      className="text-muted size-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-center text-base font-medium">
                    Drop files to upload
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Release to add files to your message
                  </p>
                </div>
              </div>
            </FileUploadContent>
          </FileUpload>
        </div>
      </div>
    </div>
  );
}