"use client";

import * as React from 'react';
import { ImageUploader } from '@/components/meme-ascii/image-uploader';
import { AsciiControls, type AsciiSettings } from '@/components/meme-ascii/ascii-controls';
import { AsciiPreview } from '@/components/meme-ascii/ascii-preview';
import { ActionButtons } from '@/components/meme-ascii/action-buttons';
import { convertImageFileToAscii } from '@/lib/ascii-utils';
import { enhanceAsciiMeme, type EnhanceAsciiMemeInput } from '@/ai/flows/enhance-ascii-meme';
import { DEFAULT_CHARSET_KEY } from '@/lib/ascii-charsets';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const INITIAL_SETTINGS: AsciiSettings = {
  outputWidth: 100,
  charsetKey: DEFAULT_CHARSET_KEY,
  invertColors: true,
  contrast: 1.0,
};

export default function MemeAsciiPage() {
  const [uploadedImageFile, setUploadedImageFile] = React.useState<File | null>(null);
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = React.useState<string | null>(null);
  
  const [asciiSettings, setAsciiSettings] = React.useState<AsciiSettings>(INITIAL_SETTINGS);
  const [currentAsciiArt, setCurrentAsciiArt] = React.useState<string | null>(null);
  
  const [isClientLoading, setIsClientLoading] = React.useState(false);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { toast } = useToast();

  const generateClientAscii = React.useCallback(async (file: File, settings: AsciiSettings) => {
    if (!file) return;
    setIsClientLoading(true);
    setError(null);
    try {
      const art = await convertImageFileToAscii(file, {
        outputWidth: settings.outputWidth,
        charsetKey: settings.charsetKey,
        invert: settings.invertColors,
        contrast: settings.contrast,
      });
      setCurrentAsciiArt(art);
    } catch (err) {
      console.error("Client ASCII generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate ASCII art.";
      setError(`Error generating ASCII: ${errorMessage}`);
      toast({ title: "ASCII Generation Failed", description: errorMessage, variant: "destructive" });
      setCurrentAsciiArt(null);
    } finally {
      setIsClientLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (uploadedImageFile) {
      generateClientAscii(uploadedImageFile, asciiSettings);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImageFile, asciiSettings, generateClientAscii]); // generateClientAscii is memoized

  const handleImageUpload = (file: File) => {
    setUploadedImageFile(file);
    if (uploadedImagePreviewUrl) {
      URL.revokeObjectURL(uploadedImagePreviewUrl);
    }
    setUploadedImagePreviewUrl(URL.createObjectURL(file));
    setCurrentAsciiArt(null); // Clear previous art
    setError(null);
  };

  const handleSettingsChange = (newSettings: AsciiSettings) => {
    setAsciiSettings(newSettings);
    // ASCII art will re-generate via useEffect if uploadedImageFile exists
  };

  const handleEnhanceWithAI = async () => {
    if (!currentAsciiArt) {
      setError("No ASCII art to enhance. Please generate base ASCII first.");
      toast({ title: "Enhancement Error", description: "No ASCII art available to enhance.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    setError(null);
    try {
      const input: EnhanceAsciiMemeInput = { asciiArt: currentAsciiArt };
      const result = await enhanceAsciiMeme(input);
      setCurrentAsciiArt(result.enhancedAsciiArt);
      toast({ title: "AI Enhancement Successful!", description: "Your ASCII meme has been enhanced.", variant: "default" });
    } catch (err) {
      console.error("AI enhancement error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to enhance ASCII art with AI.";
      setError(`AI Enhancement Failed: ${errorMessage}`);
      toast({ title: "AI Enhancement Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  React.useEffect(() => {
    // Cleanup object URL on component unmount
    return () => {
      if (uploadedImagePreviewUrl) {
        URL.revokeObjectURL(uploadedImagePreviewUrl);
      }
    };
  }, [uploadedImagePreviewUrl]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-6 border-b border-border shadow-md">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-primary tracking-tight">MemeAscii</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Craft hilarious, AI-powered ASCII memes from your images.
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        {error && (
          <Alert variant="destructive" className="shadow-lg">
            <Terminal className="h-4 w-4" />
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ImageUploader 
          onImageUpload={handleImageUpload} 
          isLoading={isClientLoading} 
          uploadedImagePreviewUrl={uploadedImagePreviewUrl}
        />

        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 flex flex-col space-y-8">
            <AsciiControls
              initialSettings={INITIAL_SETTINGS}
              onSettingsChange={handleSettingsChange}
              onEnhanceWithAI={handleEnhanceWithAI}
              isEnhancing={isAiLoading}
              isImageUploaded={!!uploadedImageFile}
            />
            <ActionButtons asciiArt={currentAsciiArt} fileName="meme-ascii.txt" />
          </div>
          <div className="md:col-span-2">
            <AsciiPreview 
              asciiArt={currentAsciiArt} 
              isLoadingAi={isAiLoading}
              isLoadingClient={isClientLoading}
              className="min-h-[500px] md:min-h-0" // Ensure preview has good height
            />
          </div>
        </div>
      </main>
      <footer className="p-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          MemeAscii &copy; {new Date().getFullYear()}. Unleash your inner meme-lord.
        </p>
      </footer>
    </div>
  );
}
