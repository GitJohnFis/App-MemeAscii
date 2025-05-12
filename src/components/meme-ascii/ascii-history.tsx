"use client";

import type * as React from 'react';
import { Clock, Trash2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AsciiSettings } from './ascii-controls';
import { AsciiHistoryItem } from './ascii-history-item';

export interface AsciiHistoryEntry {
  id: string;
  timestamp: number;
  imageBase64: string;
  asciiArt: string;
  settings: AsciiSettings;
}

interface AsciiHistoryProps {
  history: AsciiHistoryEntry[];
  onLoadFromHistory: (entry: AsciiHistoryEntry) => void;
  onDeleteFromHistory: (id: string) => void;
}

export function AsciiHistory({ history, onLoadFromHistory, onDeleteFromHistory }: AsciiHistoryProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="text-primary" size={28} />
          Generation History
        </CardTitle>
        <CardDescription>Review and reload your past ASCII creations.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Zap size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your generated ASCII art will appear here.</p>
            <p className="text-xs">Try uploading an image to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4"> {/* Added pr-4 for scrollbar spacing */}
            <div className="space-y-4">
              {history.map((entry) => (
                <AsciiHistoryItem
                  key={entry.id}
                  entry={entry}
                  onLoad={onLoadFromHistory}
                  onDelete={onDeleteFromHistory}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
