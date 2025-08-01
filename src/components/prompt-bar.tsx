"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { SettingsDropdown } from "@/components/settings-dropdown";

interface PromptBarProps {
  onGenerate?: (prompt: string) => void;
}

export function PromptBar({ onGenerate }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Call the parent handler to add new generation
    if (onGenerate) {
      onGenerate(prompt.trim());
    }
    
    // Clear the prompt
    setPrompt("");
    
    // Reset generating state
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-full py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Main prompt input */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* OpenJourney Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/openjourney-logo.svg"
                alt="OpenJourney"
                width={140}
                height={30}
                className="h-6 sm:h-8 w-auto dark:invert"
              />
            </div>
            
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-2 sm:pr-28 h-12 text-base bg-card border-input"
                disabled={isGenerating}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim() || isGenerating}
                  className="h-8"
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Generate
                </Button>
                <SettingsDropdown />
              </div>
            </div>
          </div>

          {/* Mobile buttons row */}
          <div className="flex sm:hidden gap-3 justify-center">
            <Button
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 h-10"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Generate Images
            </Button>
            <SettingsDropdown />
          </div>


        </div>
      </div>
    </div>
  );
} 