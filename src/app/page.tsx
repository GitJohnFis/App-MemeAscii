
"use client";

import * as React from 'react';
import { ImageUploader } from '@/components/meme-ascii/image-uploader';
import { AsciiControls, type AsciiSettings } from '@/components/meme-ascii/ascii-controls';
import { AsciiPreview } from '@/components/meme-ascii/ascii-preview';
import { ActionButtons } from '@/components/meme-ascii/action-buttons';
import { AsciiHistory, type AsciiHistoryEntry } from '@/components/meme-ascii/ascii-history';
import { convertImageFileToAscii, fileToDataURL } from '@/lib/ascii-utils';
import { enhanceAsciiMeme, type EnhanceAsciiMemeInput } from '@/ai/flows/enhance-ascii-meme';
import { DEFAULT_CHARSET_KEY } from '@/lib/ascii-charsets';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Terminal } from "lucide-react";

const INITIAL_SETTINGS: AsciiSettings = {
  outputWidth: 100,
  charsetKey: DEFAULT_CHARSET_KEY,
  invertColors: true,
  contrast: 1.0,
};

const MAX_HISTORY_ITEMS = 10; 

export default function MemeAsciiPage() {
  const [uploadedImageFile, setUploadedImageFile] = React.useState<File | null>(null);
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = React.useState<string | null>(null);
  const [currentImageBase64, setCurrentImageBase64] = React.useState<string | null>(null);
  
  const [asciiSettings, setAsciiSettings] = React.useState<AsciiSettings>(INITIAL_SETTINGS);
  const [currentAsciiArt, setCurrentAsciiArt] = React.useState<string | null>(null);
  
  const [isClientLoading, setIsClientLoading] = React.useState(false);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [asciiHistory, setAsciiHistory] = React.useState<AsciiHistoryEntry[]>([]);

  const { toast } = useToast();

  const addHistoryEntry = React.useCallback((art: string, settings: AsciiSettings, imageBase64: string | null) => {
    if (!imageBase64) return;
    const newEntry: AsciiHistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageBase64: imageBase64,
      asciiArt: art,
      settings: { ...settings }, 
    };
    setAsciiHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS));
  }, []);


  const generateClientAscii = React.useCallback(async (file: File, settings: AsciiSettings, imageBase64ForHistory: string | null) => {
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
      if (art && imageBase64ForHistory) {
        addHistoryEntry(art, settings, imageBase64ForHistory);
      }
    } catch (err) {
      console.error("Client ASCII generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate ASCII art.";
      setError(`Error generating ASCII: ${errorMessage}`);
      toast({ title: "ASCII Generation Failed", description: errorMessage, variant: "destructive" });
      setCurrentAsciiArt(null);
    } finally {
      setIsClientLoading(false);
    }
  }, [toast, addHistoryEntry]);

  React.useEffect(() => {
    if (uploadedImageFile && currentImageBase64) {
      generateClientAscii(uploadedImageFile, asciiSettings, currentImageBase64);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImageFile, asciiSettings, currentImageBase64]); 

  const handleImageUpload = async (file: File) => {
    setUploadedImageFile(file);
    if (uploadedImagePreviewUrl && uploadedImagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImagePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreviewUrl(previewUrl);
    setCurrentAsciiArt(null); 
    setError(null);

    try {
      const base64 = await fileToDataURL(file);
      setCurrentImageBase64(base64);
    } catch (err) {
      console.error("Error converting file to Data URL:", err);
      toast({ title: "Image Processing Error", description: "Could not process the uploaded image.", variant: "destructive" });
      setCurrentImageBase64(null);
    }
  };

  const handleSettingsChange = React.useCallback((newSettings: AsciiSettings) => {
    setAsciiSettings(newSettings);
  }, []);

  const handleEnhanceWithAI = async () => {
    if (!currentAsciiArt) {
      setError("No ASCII art to enhance. Please generate base ASCII first.");
      toast({ title: "Enhancement Error", description: "No ASCII art available to enhance.", variant: "destructive" });
      return;
    }
    if (!currentImageBase64) {
      setError("Original image data is missing for history. Please re-upload.");
      toast({ title: "Enhancement Error", description: "Original image data is missing.", variant: "destructive" });
      return;
    }

    setIsAiLoading(true);
    setError(null);
    try {
      const input: EnhanceAsciiMemeInput = { asciiArt: currentAsciiArt };
      const result = await enhanceAsciiMeme(input);
      setCurrentAsciiArt(result.enhancedAsciiArt);
      addHistoryEntry(result.enhancedAsciiArt, asciiSettings, currentImageBase64);
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

  const handleLoadFromHistory = (entry: AsciiHistoryEntry) => {
    setCurrentAsciiArt(entry.asciiArt);
    setAsciiSettings(entry.settings);
    
    // Create a synthetic File object if needed by generateClientAscii or other functions
    // For now, we only need base64 for preview and history, so direct set is fine.
    setUploadedImagePreviewUrl(entry.imageBase64); 
    setCurrentImageBase64(entry.imageBase64); 
    
    // If we need to re-enable client-side generation with history items,
    // we'd need to convert base64 back to File or adjust generateClientAscii.
    // For now, setting uploadedImageFile to null as we're loading from base64.
    setUploadedImageFile(null); 
    
    toast({ title: "Loaded from History", description: "ASCII art and settings have been restored." });
  };

  const handleDeleteFromHistory = (id: string) => {
    setAsciiHistory(prev => prev.filter(item => item.id !== id));
    toast({ title: "History Entry Deleted" });
  };

  React.useEffect(() => {
    // Cleanup for blob URLs
    return () => {
      if (uploadedImagePreviewUrl && uploadedImagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImagePreviewUrl);
      }
    };
  }, [uploadedImagePreviewUrl]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-6 border-b border-border shadow-md">
        <div className="container mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-4xl font-bold text-primary tracking-tight">MemeAscii</h1>
              </TooltipTrigger>
              <TooltipContent>
                <p>MemeAscii: AI Powered ASCII Art Memes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          isLoading={isClientLoading || isAiLoading} 
          uploadedImagePreviewUrl={uploadedImagePreviewUrl}
        />

        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 flex flex-col space-y-8">
            <AsciiControls
              initialSettings={asciiSettings}
              onSettingsChange={handleSettingsChange}
              onEnhanceWithAI={handleEnhanceWithAI}
              isEnhancing={isAiLoading}
              isImageUploaded={!!currentImageBase64} // Ensure controls are enabled if image loaded from history
            />
            <ActionButtons asciiArt={currentAsciiArt} fileName="meme-ascii.txt" />
          </div>
          <div className="md:col-span-2 flex flex-col space-y-8">
            <AsciiPreview 
              asciiArt={currentAsciiArt} 
              isLoadingAi={isAiLoading}
              isLoadingClient={isClientLoading}
              className="min-h-[500px] md:min-h-0"
            />
             <AsciiHistory
              history={asciiHistory}
              onLoadFromHistory={handleLoadFromHistory}
              onDeleteFromHistory={handleDeleteFromHistory}
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
