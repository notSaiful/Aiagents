
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LoaderCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { createMindMap } from '@/ai/flows/create-mind-map';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import type { Flashcard } from '@/types';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIOutput {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
}

type NoteStyle = 'Minimalist' | 'Story' | 'Action' | 'Formal';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<AIOutput | null>(null);
  const [style, setStyle] = useState<NoteStyle>('Minimalist');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
      // TODO: Pass the selected style to the AI flows
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setOutput(null);
      setNotes('');
      toast({
        title: 'Processing Upload...',
        description: `Extracting text from ${file.name}.`,
      });
      try {
        const photoDataUri = await readFileAsDataURI(file);
        const { extractedText } = await extractTextFromImage({ photoDataUri });
        setNotes(extractedText);
        toast({
          title: 'Text Extracted!',
          description: 'Your notes are ready to be transformed.',
        });
        // Automatically trigger transformation after text is extracted
        await handleTransform();
      } catch (error) {
        console.error('OCR failed:', error);
        toast({
          title: 'Extraction Failed',
          description: 'Could not extract text from the uploaded file. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const renderContent = () => {
    if (loading && !notes && !output) {
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

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // or a splash screen
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 pt-8 font-serif">
          NotesGPT
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">
          Instantly transform your raw notes into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full shadow-lg border-2 border-primary/40 rounded-xl">
        <CardContent className="p-2 relative pt-12">
          <Textarea
            placeholder="Paste your notes here or upload a file..."
            className="min-h-[200px] text-base border-0 focus-visible:ring-0 p-2 shadow-none bg-transparent pb-14"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, application/pdf"
          />
          <Button
            onClick={handleUploadClick}
            disabled={loading}
            variant="ghost"
            className="absolute bottom-4 left-4 h-8 rounded-full px-3 text-muted-foreground hover:text-foreground"
          >
            <Upload className="h-5 w-5" />
            Upload
          </Button>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-xs">
          <Select onValueChange={(value: NoteStyle) => setStyle(value)} defaultValue={style}>
            <SelectTrigger className="w-full h-12 rounded-xl text-base">
              <SelectValue placeholder="Select a style..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Minimalist">Minimalist</SelectItem>
              <SelectItem value="Story">Story (K-Drama Style)</SelectItem>
              <SelectItem value="Action">Action (Avengers Style)</SelectItem>
              <SelectItem value="Formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleTransform} disabled={loading || !notes} size="lg" className="w-full font-semibold text-lg py-6 rounded-xl shadow-lg bg-accent text-accent-foreground hover:bg-accent/90">
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
