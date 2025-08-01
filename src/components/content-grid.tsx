"use client";

import { useState, useEffect } from "react";
import { ImageGrid } from "@/components/image-grid";
import { LoadingGrid } from "@/components/loading-grid";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { FocusedMediaView } from "@/components/focused-media-view";
import { motion } from "framer-motion";

interface ImageGeneration {
  id: string;
  prompt: string;
  images: Array<{
    url: string;
    imageBytes?: string;
    isSample?: boolean;
  }>;
  timestamp: Date;
  isLoading: boolean;
}

interface LoadingGeneration {
  id: string;
  prompt: string;
  timestamp: Date;
  isLoading: true;
}

type Generation = ImageGeneration | LoadingGeneration;

// Sample data for demonstration with real generated content
const createSampleGenerations = (): Generation[] => [
  // Image generation 
  {
    id: "sample-image-1",
    prompt: "A majestic ice warrior in blue armor standing in a snowy landscape",
    images: [
      { url: "/sample-images/generated-image-1.png", isSample: true },
      { url: "/sample-images/generated-image-2.png", isSample: true }, 
      { url: "/sample-images/generated-image-3.png", isSample: true },
      { url: "/sample-images/generated-image-4.png", isSample: true }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isLoading: false
  } as ImageGeneration
];

export function ContentGrid({ 
  onNewGeneration
}: { 
  onNewGeneration?: (handler: (prompt: string) => void) => void;
}) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [focusedView, setFocusedView] = useState<{
    isOpen: boolean;
    mediaItems: Array<{
      id: string;
      type: 'image';
      url: string;
      prompt: string;
      timestamp: Date;
    }>;
    initialIndex: number;
  }>({ isOpen: false, mediaItems: [], initialIndex: 0 });

  // Initialize with sample data after mount to avoid hydration issues
  useEffect(() => {
    setGenerations(createSampleGenerations());
  }, []);

  // Helper function to gather all media items from generations
  const getAllMediaItems = () => {
    const mediaItems: Array<{
      id: string;
      type: 'image';
      url: string;
      prompt: string;
      timestamp: Date;
    }> = [];

    generations.forEach((generation) => {
      if (!generation.isLoading && 'images' in generation) {
        generation.images.forEach((image, index) => {
          mediaItems.push({
            id: `${generation.id}-img-${index}`,
            type: 'image',
            url: image.url,
            prompt: generation.prompt,
            timestamp: generation.timestamp,
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    return mediaItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Function to open focused view
  const openFocusedView = (generationId: string, itemIndex: number) => {
    const allMediaItems = getAllMediaItems();
    
    // Find the specific item index in the global list
    let globalIndex = 0;
    for (let i = 0; i < generations.length; i++) {
      const gen = generations[i];
      if (gen.isLoading) continue;
      
      if (gen.id === generationId) {
        globalIndex += itemIndex;
        break;
      }
      
      if ('images' in gen) {
        globalIndex += gen.images.length;
      }
    }

    setFocusedView({
      isOpen: true,
      mediaItems: allMediaItems,
      initialIndex: globalIndex,
    });
  };

  const handleNewGeneration = async (prompt: string) => {
    // Get user's API key from localStorage
    const userApiKey = localStorage.getItem("openai_api_key");
    
    const loadingGeneration: LoadingGeneration = {
      id: `loading-${Date.now()}`,
      prompt,
      timestamp: new Date(),
      isLoading: true
    };

    // Add new loading generation at the top
    setGenerations(prev => [loadingGeneration, ...prev]);

    try {
      // Create streaming request for real-time image updates
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, apiKey: userApiKey }),
      });

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialImageGeneration: ImageGeneration | null = null;

      // Read the streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed');
          break;
        }

        // Decode the chunk and process SSE data
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('SSE Event:', eventData.type, eventData.data);
              
              if (eventData.type === 'partial_image') {
                // Show partial image immediately
                console.log('Displaying partial image in frontend');
                
                partialImageGeneration = {
                  id: loadingGeneration.id,
                  prompt: loadingGeneration.prompt,
                  images: [{
                    url: eventData.data.url,
                    imageBytes: eventData.data.imageData
                  }],
                  timestamp: loadingGeneration.timestamp,
                  isLoading: true // Still loading, partial image
                };

                // Update UI with partial image
                setGenerations(prev => prev.map(gen => 
                  gen.id === loadingGeneration.id ? partialImageGeneration! : gen
                ));
                
              } else if (eventData.type === 'final_image') {
                // Replace with final crisp image
                console.log('Replacing with final image in frontend');
                
                const completedGeneration: ImageGeneration = {
                  id: loadingGeneration.id,
                  prompt: loadingGeneration.prompt,
                  images: [{
                    url: eventData.data.url,
                    imageBytes: eventData.data.imageData
                  }],
                  timestamp: loadingGeneration.timestamp,
                  isLoading: false // Generation complete
                };

                // Replace partial with final image
                setGenerations(prev => prev.map(gen => 
                  gen.id === loadingGeneration.id ? completedGeneration : gen
                ));
                
              } else if (eventData.type === 'error') {
                throw new Error(eventData.data.message);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // Remove the loading generation on error
      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      if (errorMessage.includes('API key')) {
        setShowApiKeyDialog(true);
      } else {
        alert(`Generation failed: ${errorMessage}`);
      }
    }
  };

  // Use useEffect to avoid setState during render
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(handleNewGeneration);
    }
  }, [onNewGeneration]);

  return (
    <>
      <div className="space-y-8">
      {generations.map((generation) => (
        <motion.div
          key={generation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {generation.isLoading ? (
            <LoadingGrid 
              prompt={generation.prompt}
            />
          ) : (
            <ImageGrid 
              generation={generation}
              onViewFullscreen={openFocusedView}
            />
          )}
        </motion.div>
      ))}
      
      {generations.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Ready to create something amazing?</h3>
          <p className="text-muted-foreground">
            Use the prompt bar above to generate your first image.
          </p>
        </div>
      )}
    </div>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onApiKeySaved={() => {
          console.log('OpenAI API key saved successfully');
          // Trigger a custom event to notify settings dropdown to refresh
          window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
        }}
      />

      <FocusedMediaView
        isOpen={focusedView.isOpen}
        onClose={() => setFocusedView(prev => ({ ...prev, isOpen: false }))}
        mediaItems={focusedView.mediaItems}
        initialIndex={focusedView.initialIndex}
      />
    </>
  );
}