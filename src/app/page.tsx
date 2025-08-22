'use client';

import { useState } from 'react';
import { Sparkles, LoaderCircle, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { createMindMap } from '@/ai/flows/create-mind-map';
import type { Flashcard } from '@/types';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';

interface AIOutput {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
}

export default function Home() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<AIOutput | null>(null);
  const { toast } = useToast();

  const handleTransform = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste your notes before transforming.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      const [summaryRes, flashcardsRes, mindMapRes] = await Promise.all([
        summarizeNotes({ notes }),
        generateFlashcards({ notes }),
        createMindMap({ notes }),
      ]);

      setOutput({
        shortSummary: summaryRes.shortSummary,
        longSummary: summaryRes.longSummary,
        flashcards: flashcardsRes.flashcards,
        mindMap: mindMapRes.mindMap,
      });
    } catch (error) {
      console.error('Transformation failed:', error);
      toast({
        title: 'Transformation Failed',
        description: 'An error occurred while transforming your notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2 pt-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      );
    }
    
    if (output) {
      return <OutputDisplay {...output} />;
    }

    return null;
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 rounded-full bg-primary mb-4">
            <BrainCircuit className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          NotesGPT
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">
          Instantly transform your raw notes into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full shadow-lg border-2 border-primary/40 rounded-xl">
        <CardContent className="p-4">
          <Textarea
            placeholder="Paste your notes here..."
            className="min-h-[200px] text-base border-0 focus-visible:ring-0 p-2 shadow-none bg-transparent"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button onClick={handleTransform} disabled={loading} size="lg" className="w-full font-semibold text-lg py-6 rounded-xl shadow-lg bg-accent text-accent-foreground hover:bg-accent/90">
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Transform
        </Button>
      </div>

      <div className="mt-12 min-h-[300px] w-full">
        {renderContent()}
      </div>
    </div>
  );
}
