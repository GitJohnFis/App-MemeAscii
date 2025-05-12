"use client";

import type * as React from 'react';
import NextImage from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Trash2, RotateCcw, Palette, ContrastIcon, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AsciiHistoryEntry } from './ascii-history';
import { ASCII_CHARSETS } from '@/lib/ascii-charsets';

interface AsciiHistoryItemProps {
  entry: AsciiHistoryEntry;
  onLoad: (entry: AsciiHistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function AsciiHistoryItem({ entry, onLoad, onDelete }: AsciiHistoryItemProps) {
  const timeAgo = formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true });
  const charsetName = ASCII_CHARSETS[entry.settings.charsetKey]?.name || entry.settings.charsetKey;

  // Display first few lines of ASCII art, ensure it's not too wide
  const asciiSnippet = entry.asciiArt
    .split('\n')
    .slice(0, 3)
    .map(line => line.length > 50 ? line.substring(0, 47) + '...' : line) // Truncate long lines
    .join('\n');

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
            {entry.imageBase64 && (
              <NextImage
                src={entry.imageBase64}
                alt="Original image preview"
                layout="fill"
                objectFit="cover"
                data-ai-hint="thumbnail preview"
              />
            )}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(entry.id)}
                                aria-label="Delete history item"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete this entry</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            
            <pre className="mt-1 text-xs leading-tight whitespace-pre-wrap overflow-hidden bg-background p-1.5 rounded font-mono h-12">
              {asciiSnippet}
            </pre>

            <div className="mt-2 flex items-center justify-between">
                 <TooltipProvider>
                    <div className="flex gap-1.5 text-xs text-muted-foreground">
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-0.5"><Settings2 size={12}/> W: {entry.settings.outputWidth}</TooltipTrigger>
                            <TooltipContent><p>Width: {entry.settings.outputWidth} chars</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-0.5"><Palette size={12}/> {charsetName.substring(0,7)}{charsetName.length > 7 ? '...' : ''}</TooltipTrigger>
                            <TooltipContent><p>Charset: {charsetName}</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger className="flex items-center gap-0.5"><ContrastIcon size={12}/> C: {entry.settings.contrast.toFixed(1)}</TooltipTrigger>
                            <TooltipContent><p>Contrast: {entry.settings.contrast.toFixed(1)}x</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-0.5"><RotateCcw size={12}/> {entry.settings.invertColors ? 'Inv' : 'Std'}</TooltipTrigger>
                            <TooltipContent><p>Colors: {entry.settings.invertColors ? 'Inverted' : 'Standard'}</p></TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLoad(entry)}
                className="px-2 py-1 h-auto text-xs"
              >
                Load <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
