"use client";

import * as React from 'react'; // Added missing React import
import { SlidersHorizontal, Wand2, Palette, Contrast, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AsciiCharset } from '@/lib/ascii-charsets';
import { ASCII_CHARSETS, DEFAULT_CHARSET_KEY } from '@/lib/ascii-charsets';

export interface AsciiSettings {
  outputWidth: number;
  charsetKey: string;
  invertColors: boolean;
  contrast: number;
}

interface AsciiControlsProps {
  initialSettings: AsciiSettings;
  onSettingsChange: (settings: AsciiSettings) => void;
  onEnhanceWithAI: () => void;
  isEnhancing?: boolean;
  isImageUploaded: boolean;
}

const DEFAULT_OUTPUT_WIDTH = 100;
const DEFAULT_CONTRAST = 1.0;
const DEFAULT_INVERT_COLORS = true;


export function AsciiControls({
  initialSettings,
  onSettingsChange,
  onEnhanceWithAI,
  isEnhancing = false,
  isImageUploaded,
}: AsciiControlsProps) {
  const [outputWidth, setOutputWidth] = React.useState(initialSettings.outputWidth);
  const [charsetKey, setCharsetKey] = React.useState(initialSettings.charsetKey);
  const [invertColors, setInvertColors] = React.useState(initialSettings.invertColors);
  const [contrast, setContrast] = React.useState(initialSettings.contrast);

  React.useEffect(() => {
    onSettingsChange({ outputWidth, charsetKey, invertColors, contrast });
  }, [outputWidth, charsetKey, invertColors, contrast, onSettingsChange]);
  
  React.useEffect(() => { // Update local state if initialSettings prop changes
    setOutputWidth(initialSettings.outputWidth);
    setCharsetKey(initialSettings.charsetKey);
    setInvertColors(initialSettings.invertColors);
    setContrast(initialSettings.contrast);
  }, [initialSettings]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <SlidersHorizontal className="text-primary" size={28} />
          Customize Your ASCII
        </CardTitle>
        <CardDescription>Fine-tune the appearance of your ASCII art.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          <div className="space-y-2">
            <Label htmlFor="output-width" className="flex items-center gap-1">
              Output Width (Density)
              <Tooltip>
                <TooltipTrigger asChild><RotateCcw size={14} className="cursor-help text-muted-foreground" /></TooltipTrigger>
                <TooltipContent><p>Controls the number of characters in width. Lower values can be less detailed but faster.</p></TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="output-width"
                min={30}
                max={300}
                step={10}
                value={[outputWidth]}
                onValueChange={(value) => setOutputWidth(value[0])}
                disabled={!isImageUploaded || isEnhancing}
                className="flex-grow"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">{outputWidth} chars</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="charset" className="flex items-center gap-1">
              Character Set
               <Tooltip>
                <TooltipTrigger asChild><Palette size={14} className="cursor-help text-muted-foreground" /></TooltipTrigger>
                <TooltipContent><p>Different sets of characters produce different visual styles.</p></TooltipContent>
              </Tooltip>
            </Label>
            <Select
              value={charsetKey}
              onValueChange={setCharsetKey}
              disabled={!isImageUploaded || isEnhancing}
            >
              <SelectTrigger id="charset">
                <SelectValue placeholder="Select character set" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASCII_CHARSETS).map(([key, { name, description }]) => (
                  <SelectItem key={key} value={key}>
                    <Tooltip>
                        <TooltipTrigger className="w-full text-left">{name}</TooltipTrigger>
                        {description && <TooltipContent side="right" align="start"><p>{description}</p></TooltipContent>}
                    </Tooltip>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrast" className="flex items-center gap-1">
              Contrast
              <Tooltip>
                <TooltipTrigger asChild><Contrast size={14} className="cursor-help text-muted-foreground" /></TooltipTrigger>
                <TooltipContent><p>Adjust image contrast before ASCII conversion. (1.0 is original)</p></TooltipContent>
              </Tooltip>
            </Label>
             <div className="flex items-center gap-4">
              <Slider
                id="contrast"
                min={0.5}
                max={2.5}
                step={0.1}
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
                disabled={!isImageUploaded || isEnhancing}
              />
              <span className="text-sm text-muted-foreground w-12 text-right">{contrast.toFixed(1)}x</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="invert-colors" className="flex items-center gap-1">
              Invert Colors
              <Tooltip>
                <TooltipTrigger asChild><RotateCcw size={14} className="cursor-help text-muted-foreground" /></TooltipTrigger>
                <TooltipContent><p>Inverts brightness mapping. Useful for light text on dark background effect from dark-subject images.</p></TooltipContent>
              </Tooltip>
            </Label>
            <Switch
              id="invert-colors"
              checked={invertColors}
              onCheckedChange={setInvertColors}
              disabled={!isImageUploaded || isEnhancing}
            />
          </div>
        </TooltipProvider>
        <Button
          onClick={onEnhanceWithAI}
          disabled={!isImageUploaded || isEnhancing}
          className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
          size="lg"
        >
          <Wand2 className="mr-2 h-5 w-5" />
          {isEnhancing ? 'Enhancing with AI...' : 'Enhance Meme with AI'}
        </Button>
      </CardContent>
    </Card>
  );
}
