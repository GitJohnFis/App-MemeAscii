import type { AsciiCharset } from './ascii-charsets';
import { ASCII_CHARSETS, DEFAULT_CHARSET_KEY } from './ascii-charsets';

export interface AsciiConversionOptions {
  outputWidth?: number; // Desired width of the ASCII art in characters
  charsetKey?: string;
  invert?: boolean; // Invert pixel brightness before mapping to characters
  contrast?: number; // Factor to adjust image contrast (1.0 = no change)
}

// Character aspect ratio correction, assuming typical monospace fonts are taller than wide
const CHAR_ASPECT_RATIO_CORRECTION = 0.55; // Lower value = taller characters in output

export function imageToAscii(
  imageElement: HTMLImageElement,
  options: AsciiConversionOptions = {}
): string {
  const {
    outputWidth = 100,
    charsetKey = DEFAULT_CHARSET_KEY,
    invert = true, // Default to true for "positive" image on dark backgrounds
    contrast = 1.0,
  } = options;

  const selectedCharset = (ASCII_CHARSETS[charsetKey] || ASCII_CHARSETS[DEFAULT_CHARSET_KEY]).chars;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    console.error('Canvas 2D context not supported or unavailable.');
    return 'Error: Canvas not supported';
  }

  // Calculate dimensions for the temporary canvas based on desired output character width
  const imageAspectRatio = imageElement.naturalHeight / imageElement.naturalWidth;
  const canvasWidth = outputWidth; // Each pixel horizontally on this canvas will be one character
  const canvasHeight = Math.max(1, Math.floor(outputWidth * imageAspectRatio * CHAR_ASPECT_RATIO_CORRECTION));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Apply contrast if specified. Note: filter applies to subsequent drawImage operations.
  if (contrast !== 1.0) {
    context.filter = `contrast(${contrast * 100}%)`;
  }
  
  // Draw the image onto the small canvas, effectively downsampling it.
  context.drawImage(imageElement, 0, 0, canvasWidth, canvasHeight);
  
  // It's important to get pixel data *after* all drawing operations including filters.
  // However, standard canvas filters might not be applied to getImageData.
  // For robust contrast, pixel manipulation might be needed if filter doesn't work as expected before getImageData.
  // For simplicity, we rely on filter. If issues, this part may need pixel-wise contrast adjustment.
  const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  const { data } = imageData; // RGBA array

  let asciiString = '';
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const offset = (y * canvasWidth + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      // const a = data[offset + 3]; // Alpha - not used for char selection, but could be for transparency

      // Standard grayscale conversion: 0.299R + 0.587G + 0.114B
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Apply contrast adjustment manually if canvas filter is not sufficient or for more control
      // gray = (gray / 255 - 0.5) * contrast + 0.5; // Example manual contrast
      // gray = Math.max(0, Math.min(1, gray)) * 255;


      if (invert) {
        gray = 255 - gray;
      }

      const charIndex = Math.floor((gray / 255) * (selectedCharset.length - 1));
      asciiString += selectedCharset[charIndex];
    }
    if (y < canvasHeight -1) { // Add newline for all but the last line
      asciiString += '\n';
    }
  }
  return asciiString;
}

export async function convertImageFileToAscii(
  file: File,
  options: AsciiConversionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("Failed to read file."));
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          resolve(imageToAscii(img, options));
        } catch (error) {
          console.error("Error during ASCII conversion:", error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };
      img.onerror = (err) => {
        console.error("Error loading image:", err);
        reject(new Error("Failed to load image."));
      };
      img.src = e.target.result as string;
    };
    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      reject(new Error("Failed to read file."));
    };
    reader.readAsDataURL(file);
  });
}
