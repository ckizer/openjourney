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
import { Plus, Menu } from 'lucide-react';

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

  const handleSubmit = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

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
              <PromptInput
                isLoading={isGenerating}
                value={promptValue}
                onValueChange={setPromptValue}
                onSubmit={handleSubmit}
                className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
              >
                <PromptInputTextarea
                  placeholder="Describe what you want to create..."
                  disabled={isGenerating}
                  className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
                />

                <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                  <div className="flex items-center gap-2">
                    {/* OpenJourney Logo */}
                    <div className="flex-shrink-0 hidden sm:block">
                      <Image
                        src="/openjourney-logo.svg"
                        alt="OpenJourney"
                        width={140}
                        height={30}
                        className="h-6 w-auto dark:invert"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Settings */}
                    <PromptInputAction tooltip="Settings">
                      <SettingsDropdown />
                    </PromptInputAction>

                    <Button
                      size="icon"
                      disabled={!promptValue.trim() || isGenerating}
                      onClick={handleSubmit}
                      className="size-9 rounded-full"
                    >
                      {!isGenerating ? <ArrowUp size={18} /> : <Square className="size-5 fill-current" />}
                    </Button>
                  </div>
                </PromptInputActions>
              </PromptInput>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
