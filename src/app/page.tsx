
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LoaderCircle, Upload, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { createMindMap } from '@/ai/flows/create-mind-map';
import { generatePodcast } from '@/ai/flows/generate-podcast';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { generateNotesFromYoutube } from '@/ai/flows/generate-notes-from-youtube';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import type { Flashcard, Podcast } from '@/types';
import { Input } from '@/components/ui/input';

interface AIOutput {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
  podcast?: Podcast;
}

type NoteStyle = 'Minimalist' | 'Story' | 'Action' | 'Formal';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
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
    setLoading(true);
    setOutput(null);

    // Scenario 1: Process YouTube URL
    if (youtubeUrl.trim()) {
        toast({
            title: 'Processing YouTube Video...',
            description: 'This may take a few moments. We are transcribing and generating all materials for you.',
        });
        try {
            const result = await generateNotesFromYoutube({ youtubeUrl, style });
            setNotes(result.transcript);
            setOutput({
              shortSummary: result.shortSummary,
              longSummary: result.longSummary,
              flashcards: result.flashcards,
              mindMap: result.mindMap,
            });
            toast({
                title: 'YouTube Processing Complete!',
                description: 'Your new study materials are ready.',
            });
        } catch (error) {
            console.error('YouTube processing failed:', error);
            toast({
                title: 'Processing Failed',
                description: 'Could not process the YouTube video. Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setYoutubeUrl('');
        }
        return;
    }

    // Scenario 2: Process text notes
    if (notes.trim()) {
      try {
        const [summaryRes, flashcardsRes, mindMapRes] = await Promise.all([
          summarizeNotes({ notes, style }),
          generateFlashcards({ notes, style }),
          createMindMap({ notes, style }),
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
      return;
    }
    
    // Scenario 3: Nothing to process
    toast({
      title: 'Error',
      description: 'Please paste notes or provide a YouTube URL before transforming.',
      variant: 'destructive',
    });
    setLoading(false);
  };

  const handleGeneratePodcast = async () => {
    try {
      const podcastRes = await generatePodcast({ notes, style });
      setOutput(prevOutput => ({
        ...prevOutput,
        podcast: { audioUrl: podcastRes.podcastWavDataUri },
      }));
    } catch (error) {
      console.error('Podcast generation failed:', error);
      toast({
        title: 'Podcast Generation Failed',
        description: 'An error occurred while creating your podcast. Please try again.',
        variant: 'destructive',
      });
      throw error;
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
      setYoutubeUrl('');
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
        podcast={output.podcast}
        onGeneratePodcast={handleGeneratePodcast}
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

  const isLoading = loading || isUploading;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-4 flex flex-col items-center text-center">
        <h1 className="pt-4 font-serif text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5 bg-clip-text md:text-5xl">
          NotesGPT
        </h1>
        <p className="mt-2 max-w-xl text-md text-muted-foreground">
          Instantly transform your raw notes—or a YouTube video—into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full rounded-xl border-2 border-primary/40 shadow-lg">
        <CardContent className="p-4 pb-0">
            <Textarea
              placeholder="Paste your notes here to get started..."
              className="min-h-[150px] resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (e.target.value) setYoutubeUrl('');
              }}
              disabled={isLoading}
            />
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-start gap-2 p-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png,image/jpeg,application/pdf"
            />
            <Button
                onClick={handleUploadClick}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
            >
              {isUploading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Notes
                </>
              )}
            </Button>
            
            <div className="flex-grow sm:flex-grow-0 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-muted-foreground"/>
                <Input 
                    type="url"
                    placeholder="or paste a YouTube URL"
                    value={youtubeUrl}
                    onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        if (e.target.value) setNotes('');
                    }}
                    disabled={isLoading}
                    className="h-9 max-w-xs"
                />
            </div>
        </CardFooter>
      </Card>
      
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          {(['Minimalist', 'Story', 'Action', 'Formal'] as NoteStyle[]).map((styleName) => (
            <Button
              key={styleName}
              variant={style === styleName ? 'default' : 'outline'}
              onClick={() => setStyle(styleName)}
              className="rounded-full"
              size="sm"
            >
              {styleName}
            </Button>
          ))}
        </div>

        <div className="w-full">
            <Button onClick={handleTransform} disabled={isLoading || (!notes && !youtubeUrl)} className="w-full rounded-xl bg-accent py-5 text-lg font-semibold text-accent-foreground shadow-lg hover:bg-accent/90">
            {loading ? (
                <LoaderCircle className="animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-5 w-5" />
            )}
            Transform
            </Button>
        </div>
      </div>

      <div className="mt-8 min-h-[300px] w-full">
        {renderContent()}
      </div>
    </div>
  );
}
    