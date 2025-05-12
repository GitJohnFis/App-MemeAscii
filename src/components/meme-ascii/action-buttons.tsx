"use client";

import type * as React from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  asciiArt: string | null;
  fileName?: string;
}

export function ActionButtons({ asciiArt, fileName = "meme-ascii.txt" }: ActionButtonsProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!asciiArt) return;
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `${fileName} is downloading.`, variant: "default" });
  };

  const handleCopyToClipboard = async () => {
    if (!asciiArt) return;
    try {
      await navigator.clipboard.writeText(asciiArt);
      toast({ title: "Copied to Clipboard!", description: "ASCII art copied successfully.", variant: "default" });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ title: "Copy Failed", description: "Could not copy ASCII art to clipboard.", variant: "destructive" });
    }
  };
  
  // Basic share functionality using Web Share API if available
  const handleShare = async () => {
    if (!asciiArt) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ASCII Meme',
          text: `Check out this ASCII art I made:\n\n${asciiArt.substring(0, 200)}...`, // Share a snippet
          // files: [new File([asciiArt], fileName, {type: 'text/plain'})] // Sharing files can be complex
        });
        toast({ title: "Shared!", description: "ASCII art shared successfully.", variant: "default" });
      } catch (err) {
        console.error('Share failed:', err);
        // Don't show error toast if user cancels share dialog
        if (err instanceof Error && err.name !== 'AbortError') {
         toast({ title: "Share Failed", description: "Could not share ASCII art.", variant: "destructive" });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyToClipboard(); // Copy to clipboard as a fallback
      toast({ title: "Share not available", description: "Web Share API not supported. Copied to clipboard instead.", variant: "default" });
    }
  };


  const isDisabled = !asciiArt;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Share2 className="text-primary" size={28} />
          Share & Download
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={handleDownload} disabled={isDisabled} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download ASCII
        </Button>
        <Button onClick={handleCopyToClipboard} variant="outline" disabled={isDisabled} className="w-full">
          <Copy className="mr-2 h-4 w-4" />
          Copy to Clipboard
        </Button>
         <Button onClick={handleShare} variant="outline" disabled={isDisabled || typeof navigator !== 'undefined' && !navigator.share} className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        {typeof navigator !== 'undefined' && !navigator.share && !isDisabled && (
          <p className="text-xs text-muted-foreground text-center">Web Share API not supported. "Share" will copy to clipboard.</p>
        )}
      </CardContent>
    </Card>
  );
}
