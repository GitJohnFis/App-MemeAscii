"use client";

import type * as React from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface AsciiPreviewProps {
  asciiArt: string | null;
  isLoadingAi: boolean; // Specifically for AI enhancement loading
  isLoadingClient: boolean; // Specifically for client-side generation loading
  className?: string;
}

export function AsciiPreview({ asciiArt, isLoadingAi, isLoadingClient, className }: AsciiPreviewProps) {
  const [showArt, setShowArt] = React.useState(false);

  React.useEffect(() => {
    if (asciiArt && !isLoadingAi && !isLoadingClient) {
      // Trigger fade-in animation
      setShowArt(false); // Reset to apply animation class again
      const timer = setTimeout(() => setShowArt(true), 50); // Small delay to ensure class change is detected
      return () => clearTimeout(timer);
    } else if (!asciiArt || isLoadingAi || isLoadingClient) {
      setShowArt(false);
    }
  }, [asciiArt, isLoadingAi, isLoadingClient]);

  return (
    <Card className={`shadow-lg h-full flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Eye className="text-primary" size={28} />
          ASCII Preview
        </CardTitle>
        <CardDescription>Your generated ASCII art will appear here.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-2 md:p-4 bg-card-foreground/5 rounded-b-lg">
        <ScrollArea className="w-full h-[400px] md:h-full p-2 rounded-md bg-background">
          {isLoadingAi || isLoadingClient ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {isLoadingAi ? "AI is enhancing your meme..." : "Generating ASCII art..."}
              </p>
              {/* Optional: Show skeleton of text */}
              <div className="w-full p-2 space-y-1 font-mono text-xs">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className={`h-3 w-${Math.floor(Math.random() * (90 - 60 + 1)) + 60}% bg-muted/50`} />
                ))}
              </div>
            </div>
          ) : asciiArt ? (
            <pre
              className={`font-mono text-xs leading-tight whitespace-pre overflow-auto text-foreground transition-opacity duration-500 ease-in-out ${
                showArt ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ tabSize: 4, MozTabSize: 4 }} // Ensure tab characters render consistently
            >
              {asciiArt}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ImageIcon size={64} className="mb-4 opacity-50" />
              <p>Upload an image and customize settings to see your ASCII art.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
