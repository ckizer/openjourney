"use client";

import { useRouter, usePathname } from "next/navigation";

import { MessageSquare, Image as ImageIcon } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/**
 * Primary navigation tabs for switching between "Ask" (chat) and "Imagine" (image generation) views.
 */
export function PrimaryNavTabs({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const activeValue = pathname.startsWith("/chat") ? "ask" : "imagine";

  const handleTabChange = (value: string) => {
    if (value === "ask") {
      router.push("/chat");
    } else if (value === "imagine") {
      router.push("/");
    }
  };

  return (
    <Tabs value={activeValue} onValueChange={handleTabChange} className={className}>
      <ScrollArea>
        <TabsList className="mb-3">
          <TabsTrigger value="ask">
            <MessageSquare
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Ask
          </TabsTrigger>
          <TabsTrigger value="imagine">
            <ImageIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Imagine
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
