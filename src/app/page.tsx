"use client";


import { ContentGrid } from "@/components/content-grid";
import { useState, useCallback } from "react";
import { PrimaryNavTabs } from "@/components/primary-nav-tabs";
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Menu, ArrowUp, Square, Paperclip, Globe, MoreHorizontal, Mic, X } from 'lucide-react';
import { SettingsDropdown } from "@/components/settings-dropdown";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/ui/prompt-input';
import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from '@/components/ui/file-upload';

// Sample generation history for sidebar
const generationHistory = [
  {
    period: 'Today',
    generations: [
      { id: '1', title: 'New Generation', lastPrompt: 'Start creating', timestamp: Date.now() },
    ],
  },
];

// Sidebar component for Imagine page
function ImagineSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md" />
          <div className="text-md font-base text-primary tracking-tight">Imagine</div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button variant="outline" className="mb-4 flex w-full items-center gap-2">
            <Plus className="size-4" />
            <span>New Generation</span>
          </Button>
        </div>
        {generationHistory.map((group) => (
          <SidebarGroup key={group.period}>
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
            <SidebarMenu>
              {group.generations.map((gen) => (
                <SidebarMenuButton key={gen.id}>{gen.title}</SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

export default function Home() {
  const [generateHandler, setGenerateHandler] = useState<((prompt: string) => void) | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSetGenerator = useCallback((handler: (prompt: string) => void) => {
    setGenerateHandler(() => handler);
  }, []);

  const handleUsePrompt = useCallback((prompt: string) => {
    setPromptValue(prompt);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!promptValue.trim()) return;
    
    setIsGenerating(true);
    
    // Call the generator handler to add new generation
    if (generateHandler) {
      generateHandler(promptValue.trim());
    }
    
    // Clear the prompt
    setPromptValue("");
    
    // Reset generating state
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  }, [promptValue, generateHandler]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, []);

  const handleSubmit = useCallback(() => {
    if (promptValue.trim() || files.length > 0) {
      handleGenerate();
      setFiles([]); // Clear files after generating
    }
  }, [promptValue, files, handleGenerate]);

  return (
    <SidebarProvider>
      <ImagineSidebar />
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


          
          {/* Main content area */}
          <main className="flex-1 min-h-0 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ContentGrid 
                onNewGeneration={handleSetGenerator}
                onUsePrompt={handleUsePrompt}
              />
            </div>
          </main>

          {/* Prompt input at bottom - matching chat page layout */}
          <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
            <div className="mx-auto max-w-3xl">
              <FileUpload
                onFilesAdded={handleFilesAdded}
                accept=".jpg,.jpeg,.png,.pdf,.docx,.txt,.md"
              >
                <PromptInput
                  isLoading={isGenerating}
                  value={promptValue}
                  onValueChange={setPromptValue}
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
                    placeholder="Describe what you want to create..."
                    disabled={isGenerating}
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
                      {/* Settings - unique to imagine page */}
                      <PromptInputAction tooltip="Settings">
                        <SettingsDropdown />
                      </PromptInputAction>

                      {/* Voice input */}
                      <PromptInputAction tooltip="Voice input">
                        <Button variant="outline" size="icon" className="size-9 rounded-full">
                          <Mic size={18} />
                        </Button>
                      </PromptInputAction>

                      <Button
                        size="icon"
                        disabled={(!promptValue.trim() && files.length === 0) || isGenerating}
                        onClick={handleSubmit}
                        className="size-9 rounded-full"
                      >
                        {!isGenerating ? <ArrowUp size={18} /> : <Square className="size-5 fill-current" />}
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
  );
}
