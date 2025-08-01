"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export function ImageGrid({ generation, onViewFullscreen }: ImageGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Convert images to lightbox format
  const lightboxItems = generation.images.map((imageData, index) => ({
    type: "image" as const,
    url: imageData.url,
    alt: `Generated image ${index + 1} from: ${generation.prompt}`
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Images grid - left side */}
      <div className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {generation.images.map((imageData, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
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
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                  
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  } flex flex-col justify-end p-3 gap-2`}>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imageData.url, index);
                        }}
                        className="h-6 sm:h-7 px-2 sm:px-3 text-xs font-medium bg-white/90 hover:bg-white text-black"
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFullscreen(index);
                        }}
                        className="h-6 sm:h-7 px-2 sm:px-3 text-xs font-medium bg-white/90 hover:bg-white text-black"
                      >
                        <ExpandIcon className="w-3 h-3 mr-1" />
                        Expand
                      </Button>
                    </div>
                  </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Prompt and metadata - right side */}
      <div className="lg:w-80 flex flex-col gap-4">
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
              <Badge variant="default" className="text-xs bg-blue-500 animate-pulse">
                🎬 Generating...
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Prompt</h3>
            <p className="text-sm leading-relaxed">{generation.prompt}</p>
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