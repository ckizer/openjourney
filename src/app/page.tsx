"use client";

import { PromptBar } from "@/components/prompt-bar";
import { ContentGrid } from "@/components/content-grid";
import { useState, useCallback } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Fixed prompt bar at top */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex-1">
            <PromptBar 
              onGenerate={generateHandler || undefined}
              value={promptValue}
              onValueChange={setPromptValue}
            />
          </div>
          <Link 
            href="/chat"
            className="ml-4 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Chat</span>
          </Link>
        </div>
      </div>
      
      {/* Main content area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ContentGrid 
          onNewGeneration={handleSetGenerator}
          onUsePrompt={handleUsePrompt}
        />
      </main>
    </div>
  );
}
