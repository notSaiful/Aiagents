
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LoaderCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { createMindMap } from '@/ai/flows/create-mind-map';
import { generateImage } from '@/ai/flows/generate-image';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import type { Flashcard } from '@/types';

interface AIOutput {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
  imageUrl: string;
}

type NoteStyle = 'Minimalist' | 'Story' | 'Action' | 'Formal';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [output, setOutput] = useState<Partial<AIOutput> | null>(null);
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
      // Run all AI generation requests in parallel for faster results.
      const [summaryRes, flashcardsRes, mindMapRes, imageRes] = await Promise.all([
        summarizeNotes({ notes, style }),
        generateFlashcards({ notes, style }),
        createMindMap({ notes, style }),
        generateImage({ notes, style }),
      ]);

      // Update the state with all the new data at once.
      setOutput({
        shortSummary: summaryRes.shortSummary,
        longSummary: summaryRes.longSummary,
        flashcards: flashcardsRes.flashcards,
        mindMap: mindMapRes.mindMap,
        imageUrl: imageRes.imageUrl,
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
      setIsUploading(true);
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
      } catch (error) {
        console.error('OCR failed:', error);
        toast({
          title: 'Extraction Failed',
          description: 'Could not extract text from the uploaded file. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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
      return <OutputDisplay 
        shortSummary={output.shortSummary}
        longSummary={output.longSummary}
        flashcards={output.flashcards}
        mindMap={output.mindMap}
        imageUrl={output.imageUrl}
        isShareable={true}
      />;
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
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5 pt-8 font-serif">
          NotesGPT
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">
          Instantly transform your raw notes into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full shadow-lg border-2 border-primary/40 rounded-xl">
        <CardContent className="p-4">
            <Textarea
              placeholder="Paste your notes here or upload a file..."
              className="min-h-[200px] text-base border-0 focus-visible:ring-0 shadow-none bg-transparent resize-none p-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading || isUploading}
            />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-start">
             <div className="flex justify-start">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png,image/jpeg,application/pdf"
                />
                <Button
                    onClick={handleUploadClick}
                    disabled={loading || isUploading}
                    variant="ghost"
                    className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground"
                >
                  {isUploading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
            </div>
        </CardFooter>
      </Card>
      
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {(['Minimalist', 'Story', 'Action', 'Formal'] as NoteStyle[]).map((styleName) => (
            <Button
              key={styleName}
              variant={style === styleName ? 'default' : 'outline'}
              onClick={() => setStyle(styleName)}
              className="rounded-full"
            >
              {styleName}
            </Button>
          ))}
        </div>

        <div className="w-full">
            <Button onClick={handleTransform} disabled={loading || isUploading || !notes} className="w-full font-semibold text-lg py-6 rounded-xl shadow-lg bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? (
                <LoaderCircle className="animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-5 w-5" />
            )}
            Transform
            </Button>
        </div>
      </div>

      <div className="mt-12 min-h-[300px] w-full">
        {renderContent()}
      </div>
    </div>
  );
}
