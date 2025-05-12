"use client";

import type * as React from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image'; // Using next/image for optimized placeholder

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
    inputRef.current?.click();
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
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors"
          onClick={handleUploadClick}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onImageUpload(e.dataTransfer.files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
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
          <Label htmlFor="image-upload" className="text-sm font-medium text-primary hover:underline">
            {isLoading ? 'Processing...' : uploadedImagePreviewUrl ? 'Click or drag to change image' : 'Click or drag file to upload'}
          </Label>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </div>
        {isLoading && <p className="text-sm text-center text-primary">Processing image, please wait...</p>}
      </CardContent>
    </Card>
  );
}
