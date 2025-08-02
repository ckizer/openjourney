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
  onNewGeneration,
  onUsePrompt
}: { 
  onNewGeneration?: (handler: (prompt: string) => void) => void;
  onUsePrompt?: (prompt: string) => void;
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

    let hasError = false; // Flag to track if we've handled an error gracefully

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
      let buffer = ''; // Buffer for incomplete SSE messages

      // Read the streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed');
          break;
        }

        // Exit early if we've handled an error gracefully
        if (hasError) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        console.log('Buffer chunk:', buffer.slice(0, 100) + '...');
        
        // Process complete SSE messages
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer
        
        for (const message of messages) {
          const lines = message.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6).trim();
                if (jsonData) {
                  const eventData = JSON.parse(jsonData);
                  console.log('SSE Event:', eventData.type);
                  
                  if (eventData.type === 'partial_image') {
                    // Show partial image immediately
                    console.log('Frontend: Received partial image, updating UI');
                    
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
                    setGenerations(prev => {
                      const updated = prev.map(gen => 
                        gen.id === loadingGeneration.id ? partialImageGeneration! : gen
                      );
                      console.log('Frontend: Updated generations with partial image');
                      return updated;
                    });
                    
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
                    // Handle error gracefully without console logging
                    
                    // Handle different error types gracefully
                    const errorData = eventData.data;
                    
                    if (errorData.type === 'moderation_blocked') {
                      // Show moderation error without throwing
                      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));
                      alert('❌ Content Policy Violation\n\n' + errorData.message);
                      hasError = true;
                      break; // Exit the stream processing loop
                    } else if (errorData.type === 'rate_limit') {
                      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));
                      alert('⏱️ Rate Limit Exceeded\n\n' + errorData.message);
                      hasError = true;
                      break;
                    } else if (errorData.type === 'quota_exceeded') {
                      setGenerations(prev => prev.filter(gen => gen.id !== loadingGeneration.id));
                      alert('💳 Quota Exceeded\n\n' + errorData.message);
                      hasError = true;
                      break;
                    } else {
                      // For other errors, still throw to maintain existing error handling
                      throw new Error(errorData.message || 'Unknown error occurred');
                    }
                  }
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError, 'Raw line:', line);
              }
            }
          }
        }
      }
    } catch (error) {
      // Only handle errors if we haven't already gracefully handled one
      if (!hasError) {
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
          {generation.isLoading && !('images' in generation && generation.images.length > 0) ? (
            <LoadingGrid 
              prompt={generation.prompt}
            />
          ) : 'images' in generation ? (
            <ImageGrid 
              generation={generation}
              onViewFullscreen={openFocusedView}
              onUsePrompt={onUsePrompt}
            />
          ) : null}
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