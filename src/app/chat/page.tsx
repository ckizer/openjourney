'use client'

import { useState, useCallback, useRef } from 'react'
import { PrimaryNavTabs } from "@/components/primary-nav-tabs"
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from '@/components/ui/chat-container'
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/components/ui/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/ui/prompt-input'
import { ScrollButton } from '@/components/ui/scroll-button'
import { Button } from '@/components/ui/button'
import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/ui/loader'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash,
  Globe,
  Mic,
  MoreHorizontal,
  Plus,
  Menu,
} from 'lucide-react'

// ---------------------------------------------
// Types
// ---------------------------------------------

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ---------------------------------------------
// Conversation History (sample)
// ---------------------------------------------

const conversationHistory = [
  {
    period: 'Today',
    conversations: [
      { id: '1', title: 'New Chat', lastMessage: 'Start chatting', timestamp: Date.now() },
    ],
  },
]

// ---------------------------------------------
// Sidebar component
// ---------------------------------------------

function ChatSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md" />
          <div className="text-md font-base text-primary tracking-tight">Chat</div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button variant="outline" className="mb-4 flex w-full items-center gap-2">
            <Plus className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>
        {conversationHistory.map((group) => (
          <SidebarGroup key={group.period}>
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
            <SidebarMenu>
              {group.conversations.map((conv) => (
                <SidebarMenuButton key={conv.id}>{conv.title}</SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

// ---------------------------------------------
// Component
// ---------------------------------------------

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Utility to copy message content
  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  // -------------------------------------------
  // Send message
  // -------------------------------------------
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Error sending message:', error)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [messages]
  )

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() || files.length > 0) {
      sendMessage(inputValue)
      setFiles([]) // Clear files after sending
    }
  }, [inputValue, files, sendMessage])

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="border-b p-2">
        <div className="flex items-center space-x-2">
                    <SidebarTrigger className="rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-colors">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <PrimaryNavTabs />
        </div>
      </header>

      {/* Chat area */}
      <div ref={chatContainerRef} className="relative flex-1 min-h-0">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant'
              const isLastMessage = index === messages.length - 1

              return (
                <Message
                  key={message.id}
                  className={cn(
                    'mx-auto flex w-full max-w-3xl flex-col gap-2 px-6',
                    isAssistant ? 'items-start' : 'items-end'
                  )}
                >
                  {isAssistant ? (
                    <div className="group flex w-full flex-col gap-0">
                      <MessageContent
                        markdown
                        className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                      >
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          '-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                          isLastMessage && 'opacity-100'
                        )}
                      >
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Upvote" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Downvote" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-end gap-1">
                      <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                        {message.content}
                      </MessageContent>
                      <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <MessageAction tooltip="Edit" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Delete" delayDuration={100}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  )}
                </Message>
              )
            })}

            {isLoading && (
              <Message className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start">
                <div className="rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal">
                  <div className="flex items-center space-x-2">
                    <Loader variant="typing" size="sm" />
                    <span>Generating...</span>
                  </div>
                </div>
              </Message>
            )}
            <ChatContainerScrollAnchor />
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      {/* Prompt input + file upload */}
      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <FileUpload
            onFilesAdded={handleFilesAdded}
            accept=".jpg,.jpeg,.png,.pdf,.docx,.txt,.md"
          >
            <PromptInput
              isLoading={isLoading}
              value={inputValue}
              onValueChange={setInputValue}
              onSubmit={handleSubmit}
              className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
            >
              {/* Attachments preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-secondary flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="size-4" />
                        <span className="max-w-[120px] truncate text-sm">{file.name}</span>
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
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-2">
                  {/* Attach files */}
                  <PromptInputAction tooltip="Attach files">
                    <FileUploadTrigger asChild>
                      <div className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl">
                        <Paperclip className="text-primary size-5" />
                      </div>
                    </FileUploadTrigger>
                  </PromptInputAction>

                  {/* Add new action */}
                  <PromptInputAction tooltip="Add a new action">
                    <Button variant="outline" size="icon" className="size-9 rounded-full">
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>

                  {/* Search */}
                  <PromptInputAction tooltip="Search">
                    <Button variant="outline" className="rounded-full">
                      <Globe size={18} />
                      Search
                    </Button>
                  </PromptInputAction>

                  {/* More actions */}
                  <PromptInputAction tooltip="More actions">
                    <Button variant="outline" size="icon" className="size-9 rounded-full">
                      <MoreHorizontal size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex items-center gap-2">
                  {/* Voice input */}
                  <PromptInputAction tooltip="Voice input">
                    <Button variant="outline" size="icon" className="size-9 rounded-full">
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  <Button
                    size="icon"
                    disabled={(!inputValue.trim() && files.length === 0) || isLoading}
                    onClick={handleSubmit}
                    className="size-9 rounded-full"
                  >
                    {!isLoading ? <ArrowUp size={18} /> : <Square className="size-5 fill-current" />}
                  </Button>
                </div>
              </PromptInputActions>
            </PromptInput>

            {/* Drag & drop area */}
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
                  <h3 className="mb-2 text-center text-base font-medium">Drop files to upload</h3>
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
      </SidebarInset>
    </SidebarProvider>
  )
}
