"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { SparklesIcon, ClockIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingGridProps {
  prompt: string;
}

export function LoadingGrid({ prompt }: LoadingGridProps) {
  const formatTimeAgo = () => "Just now";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Single large loading skeleton - left side */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden aspect-square border-border/50 relative">
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Prompt information - right side */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <ClockIcon className="w-3 h-3" />
              <span className="whitespace-nowrap">{formatTimeAgo()}</span>
              <Badge variant="outline" className="text-xs">
                Images
              </Badge>
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader variant="typing" size="sm" />
                <span className="text-xs text-primary">Generating...</span>
              </motion.div>
            </div>
            
            
            <div>
              <h3 className="font-medium text-foreground text-lg leading-relaxed">
                {prompt}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 