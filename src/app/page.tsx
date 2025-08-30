
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LoaderCircle, Upload, Save, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { createMindMap } from '@/ai/flows/create-mind-map';
import { generatePodcast } from '@/ai/flows/generate-podcast';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { extractTextFromVideo } from '@/ai/flows/extract-text-from-video';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import type { Flashcard, Podcast } from '@/types';

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
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [output, setOutput] = useState<Partial<AIOutput> | null>(null);
  const [style, setStyle] = useState<NoteStyle>('Minimalist');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);


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

    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste or upload your notes before transforming.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

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
  
  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  }

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

  const handleVideoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzingVideo(true);
      setOutput(null);
      setNotes('');
      toast({
        title: 'Analyzing Video...',
        description: `Extracting transcript from ${file.name}. This may take a few moments.`,
      });
      try {
        const videoDataUri = await readFileAsDataURI(file);
        const { extractedText } = await extractTextFromVideo({ videoDataUri });
        setNotes(extractedText);
        toast({
          title: 'Transcript Extracted!',
          description: 'Your video transcript is ready to be transformed.',
        });
      } catch (error) {
        console.error('Video analysis failed:', error);
        toast({
          title: 'Analysis Failed',
          description: 'Could not extract transcript from the uploaded video. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzingVideo(false);
        if(videoInputRef.current) {
          videoInputRef.current.value = '';
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
    
    if (output && (output.shortSummary || output.longSummary || output.flashcards || output.mindMap)) {
      return <OutputDisplay 
        shortSummary={output.shortSummary}
        longSummary={output.longSummary}
        flashcards={output.flashcards}
        mindMap={output.mindMap}
        podcast={output.podcast}
        onGeneratePodcast={handleGeneratePodcast}
        isShareable={true}
        notes={notes}
        style={style}
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

  const isLoading = loading || isUploading || isAnalyzingVideo;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-4 flex flex-col items-center text-center">
        <h1 className="pt-4 font-serif text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5 bg-clip-text md:text-5xl">
          NotesGPT
        </h1>
        <p className="mt-2 max-w-xl text-md text-muted-foreground">
          Instantly transform your raw notes into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card className="w-full rounded-2xl border-2 border-primary/40 shadow-lg transition-all hover:shadow-xl">
        <CardContent className="p-4 pb-0">
            <Textarea
              placeholder="Paste your notes here, or upload a document, image, or video to get started..."
              className="min-h-[150px] resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoFileChange}
                className="hidden"
                accept="video/*"
            />
            <div className="flex gap-2">
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
               <Button
                  onClick={handleVideoUploadClick}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
              >
                {isAnalyzingVideo ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
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
            <Button onClick={handleTransform} disabled={isLoading || !notes} className="w-full rounded-xl bg-accent py-5 text-lg font-semibold text-accent-foreground shadow-lg hover:bg-accent/90">
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
    