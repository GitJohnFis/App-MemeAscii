
"use client";

import * as React from 'react';
import { Eye, Loader2, Image as ImageIcon, Copy } from 'lucide-react'; // Added Copy
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Added
import { useToast } from '@/hooks/use-toast'; // Added
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added

interface AsciiPreviewProps {
  asciiArt: string | null;
  isLoadingAi: boolean; 
  isLoadingClient: boolean; 
  className?: string;
}

export function AsciiPreview({ asciiArt, isLoadingAi, isLoadingClient, className }: AsciiPreviewProps) {
  const [showArt, setShowArt] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (asciiArt && !isLoadingAi && !isLoadingClient) {
      setShowArt(false); 
      const timer = setTimeout(() => setShowArt(true), 50); 
      return () => clearTimeout(timer);
    } else if (!asciiArt || isLoadingAi || isLoadingClient) {
      setShowArt(false);
    }
  }, [asciiArt, isLoadingAi, isLoadingClient]);

  const handleCopyToClipboard = async () => {
    if (!asciiArt) return;
    if (!navigator.clipboard) {
      toast({ title: "Copy Failed", description: "Clipboard API not available in this browser.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(asciiArt);
      toast({ title: "Copied to Clipboard!", description: "ASCII art copied successfully.", variant: "default" });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ title: "Copy Failed", description: "Could not copy ASCII art to clipboard.", variant: "destructive" });
    }
  };

  return (
    <Card className={`shadow-lg h-full flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Eye className="text-primary" size={28} />
          ASCII Preview
        </CardTitle>
        <CardDescription>Your generated ASCII art will appear here.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-2 md:p-4 bg-card-foreground/5 rounded-b-lg relative"> {/* Added relative */}
        <ScrollArea className="w-full h-[400px] md:h-full p-2 rounded-md bg-background">
          {isLoadingAi || isLoadingClient ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {isLoadingAi ? "AI is enhancing your meme..." : "Generating ASCII art..."}
              </p>
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
              style={{ tabSize: 4, MozTabSize: 4 }} 
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
        {asciiArt && !isLoadingAi && !isLoadingClient && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-card hover:bg-card/80 border border-border rounded-md shadow-sm"
                  onClick={handleCopyToClipboard}
                  aria-label="Copy ASCII art to clipboard"
                >
                  <Copy className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Copy ASCII art</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
