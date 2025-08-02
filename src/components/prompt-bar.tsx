"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { SettingsDropdown } from "@/components/settings-dropdown";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";

interface PromptBarProps {
  onGenerate?: (prompt: string) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function PromptBar({ onGenerate, value, onValueChange }: PromptBarProps) {
  const [internalPrompt, setInternalPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Use controlled value if provided, otherwise use internal state
  const prompt = value ?? internalPrompt;
  const setPrompt = onValueChange ?? setInternalPrompt;

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

  const handleSubmit = () => {
    handleGenerate();
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
            
            <div className="flex-1 w-full">
              <PromptInput
                value={prompt}
                onValueChange={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isGenerating}
                className="min-h-[48px]"
              >
                <PromptInputTextarea
                  placeholder="Describe what you want to create..."
                  className="text-base"
                />
                <PromptInputActions className="hidden sm:flex">
                  <PromptInputAction tooltip="Generate images">
                    <Button
                      size="sm"
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="h-8"
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Generate
                    </Button>
                  </PromptInputAction>
                  <PromptInputAction tooltip="Settings">
                    <SettingsDropdown />
                  </PromptInputAction>
                </PromptInputActions>
              </PromptInput>
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