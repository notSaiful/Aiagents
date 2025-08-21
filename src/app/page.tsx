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
import type { Flashcard, MindMapNodeData } from '@/types';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';

const DUMMY_DATA = {
  summary: `
- This is a placeholder summary.
- Replace this with your own notes to see the AI in action.
- The output will be nicely formatted.
`,
  flashcards: [
    { question: 'What is the capital of France?', answer: 'Paris' },
    { question: 'How many continents are there?', answer: 'Seven' },
    { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria' },
  ],
  mindMap: {
    name: 'Central Idea',
    children: [
      {
        name: 'Main Topic 1',
        children: [{ name: 'Sub-topic 1.1' }, { name: 'Sub-topic 1.2' }],
      },
      {
        name: 'Main Topic 2',
        children: [{ name: 'Sub-topic 2.1' }],
      },
    ],
  },
};

interface AIOutput {
  summary: string;
  flashcards: Flashcard[];
  mindMap: MindMapNodeData;
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

      const parsedMindMap = JSON.parse(mindMapRes.mindMapJson);

      setOutput({
        summary: summaryRes.summary,
        flashcards: flashcardsRes.flashcards,
        mindMap: parsedMindMap,
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
    
    const dataToDisplay = output || DUMMY_DATA;
    return <OutputDisplay {...dataToDisplay} />;
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <BrainCircuit className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground/60">
          Gemini Notes
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Paste your notes and instantly get aesthetic summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full shadow-lg border-2 border-primary/20">
        <CardContent className="p-6">
          <Textarea
            placeholder="Paste your notes here..."
            className="min-h-[200px] text-base border-0 focus-visible:ring-1 focus-visible:ring-ring p-0 shadow-none bg-transparent"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button onClick={handleTransform} disabled={loading} size="lg" className="w-full">
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
