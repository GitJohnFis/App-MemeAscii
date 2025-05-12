"use client";

import * as React from 'react';
import { UploadCloud } from 'lucide-react'; // Removed ImageIcon as it's not used
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button'; // Button not used here
import NextImage from 'next/image'; 

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
  uploadedImagePreviewUrl?: string | null;
}

export function ImageUploader({ onImageUpload, isLoading = false, uploadedImagePreviewUrl }: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    if (isLoading) return; // Prevent opening file dialog while loading
    inputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isLoading) return;
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UploadCloud className="text-primary" size={28} />
          Upload Your Image
        </CardTitle>
        <CardDescription>Select an image to transform into a meme-ready ASCII masterpiece.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-primary'} border-border transition-colors`}
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="button"
          tabIndex={isLoading ? -1 : 0}
          aria-disabled={isLoading}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadClick();}}
        >
          <Input
            ref={inputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {uploadedImagePreviewUrl ? (
            <div className="relative w-full h-48 mb-4 overflow-hidden rounded-md">
               <NextImage 
                src={uploadedImagePreviewUrl} 
                alt="Uploaded preview" 
                layout="fill" 
                objectFit="contain"
                data-ai-hint="user uploaded image"
                />
            </div>
          ) : (
            <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground" />
          )}
          <Label htmlFor="image-upload-trigger" className={`text-sm font-medium ${isLoading ? '' : 'text-primary hover:underline'}`}>
            {isLoading ? 'Processing...' : uploadedImagePreviewUrl ? 'Click or drag to change image' : 'Click or drag file to upload'}
          </Label>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </div>
        {isLoading && ( // This specific loading message might be redundant if the label already says "Processing..."
          <p className="text-sm text-center text-primary">Processing image, please wait...</p>
        )}
      </CardContent>
    </Card>
  );
}

