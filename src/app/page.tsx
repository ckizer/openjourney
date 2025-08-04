"use client";

import { PromptBar } from "@/components/prompt-bar";
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

  const handleSetGenerator = useCallback((handler: (prompt: string) => void) => {
    setGenerateHandler(() => handler);
  }, []);

  const handleUsePrompt = useCallback((prompt: string) => {
    setPromptValue(prompt);
  }, []);

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

          {/* Fixed prompt bar */}
          <div className="border-b bg-background">
            <div className="px-4 py-2">
              <PromptBar 
                onGenerate={generateHandler || undefined}
                value={promptValue}
                onValueChange={setPromptValue}
              />
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 min-h-0 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ContentGrid 
                onNewGeneration={handleSetGenerator}
                onUsePrompt={handleUsePrompt}
              />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
