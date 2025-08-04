"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { ClockIcon, DownloadIcon, ExpandIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LightboxModal } from "@/components/lightbox-modal";

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

interface ImageGridProps {
  generation: ImageGeneration;
  onViewFullscreen?: (generationId: string, imageIndex: number) => void;
  onUsePrompt?: (prompt: string) => void;
}

export function ImageGrid({ generation, onViewFullscreen, onUsePrompt }: ImageGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isPromptHovered, setIsPromptHovered] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleViewFullscreen = (index: number) => {
    if (onViewFullscreen) {
      onViewFullscreen(generation.id, index);
    } else {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleUsePrompt = () => {
    if (onUsePrompt) {
      onUsePrompt(generation.prompt);
    }
  };

  // Convert images to lightbox format
  const lightboxItems = generation.images.map((imageData, index) => ({
    type: "image" as const,
    url: imageData.url,
    alt: `Generated image ${index + 1} from: ${generation.prompt}`
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Single large image - left side */}
      <div className="flex-1">
        {generation.images.map((imageData, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl mx-auto"
          >
            <Card 
              className="relative group cursor-pointer bg-muted/50 border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden aspect-square p-0"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleViewFullscreen(index)}
            >
              <Image
                src={imageData.url}
                alt={`Generated image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
              />
                
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                } flex flex-col justify-end p-4 gap-3`}>
                  
                  {/* Action buttons */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(imageData.url, index);
                      }}
                      className="h-8 px-4 text-sm font-medium bg-white/90 hover:bg-white text-black"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFullscreen(index);
                      }}
                      className="h-8 px-4 text-sm font-medium bg-white/90 hover:bg-white text-black"
                    >
                      <ExpandIcon className="w-4 h-4 mr-2" />
                      Expand
                    </Button>
                  </div>
                </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Prompt and metadata - right side */}
      <div className="lg:w-96 flex flex-col gap-4">
        <Card className="p-4 bg-muted/30 border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              <ClockIcon className="w-3 h-3 mr-1" />
              {formatTimeAgo(generation.timestamp)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {generation.images.length} image{generation.images.length !== 1 ? 's' : ''}
            </Badge>
            {generation.isLoading && (
              <Badge variant="default" className="text-xs bg-blue-500 flex items-center gap-1">
                <Loader variant="typing" size="sm" />
                Generating...
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Prompt</h3>
            <div 
              className={`relative group cursor-pointer rounded-lg p-3 transition-all duration-200 border ${
                isPromptHovered 
                  ? 'bg-muted/80 border-border' 
                  : 'bg-transparent border-transparent hover:bg-muted/40'
              }`}
              onMouseEnter={() => setIsPromptHovered(true)}
              onMouseLeave={() => setIsPromptHovered(false)}
              onClick={handleUsePrompt}
            >
              <p className="text-sm leading-relaxed pr-20">{generation.prompt}</p>
              
              {/* Use prompt button - appears on hover */}
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                isPromptHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs font-medium bg-background/80 hover:bg-background border border-border/50 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUsePrompt();
                  }}
                >
                  + use prompt
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lightbox Modal for fallback */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}