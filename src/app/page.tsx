
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LoaderCircle, Upload, Mic } from 'lucide-react';
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
import { updateUserStats } from '@/ai/flows/update-user-stats';
import OutputDisplay from '@/components/output-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import type { Flashcard, Podcast } from '@/types';
import { useVoiceNotes } from '@/hooks/use-voice-notes';
import { cn } from '@/lib/utils';
import AnimatedCheck from '@/components/animated-check';
import { useProgress } from '@/context/progress-context';
import StreakToast from '@/components/streak-toast';


interface AIOutput {
  shortSummary: string;
  longSummary: string;
  flashcards: Flashcard[];
  mindMap: string;
  podcast?: Podcast;
}

type NoteStyle = 'Minimalist' | 'Story' | 'Action' | 'Formal';
type UploadType = 'image' | 'video' | 'file';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [output, setOutput] = useState<Partial<AIOutput> | null>(null);
  const [style, setStyle] = useState<NoteStyle>('Minimalist');
  const [errorAnimation, setErrorAnimation] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSummaryAnimation, setShowSummaryAnimation] = useState(false);
  
  const { setProgress, startProgress, finishProgress } = useProgress();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported,
    setTranscript,
  } = useVoiceNotes();
  
  const previousNotesRef = useRef('');

  useEffect(() => {
    if (isListening) {
      setNotes(previousNotesRef.current + transcript);
    }
  }, [transcript, isListening]);
  
  useEffect(() => {
    if (error) {
        toast({
            title: 'Voice Error',
            description: error,
            variant: 'destructive',
        });
    }
  }, [error, toast]);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const progressId = `upload-${Date.now()}`;
      
      reader.onload = () => {
        finishProgress(progressId);
        resolve(reader.result as string)
      };
      reader.onerror = (error) => {
        finishProgress(progressId);
        reject(error);
      }
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progressId, { value: progress, label: `Uploading ${file.name}... ${progress}%` });
        }
      };

      startProgress(progressId, { value: 0, label: `Uploading ${file.name}...` });
      reader.readAsDataURL(file);
    });
  };

  const handleTransform = async () => {
    setLoading(true);
    setOutput(null);
    setShowSummaryAnimation(false);
    setErrorAnimation(false);

    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste or upload your notes before transforming.',
        variant: 'destructive',
      });
      setErrorAnimation(true);
      setLoading(false);
      return;
    }

    try {
      const input = { notes, style };

      // Call all generation flows in parallel
      const [summaryResult, flashcardsResult, mindMapResult] = await Promise.allSettled([
        summarizeNotes(input),
        generateFlashcards(input),
        createMindMap(input),
      ]);

      const newOutput: Partial<AIOutput> = {};
      let hasError = false;

      // Process summary result
      if (summaryResult.status === 'fulfilled') {
        newOutput.shortSummary = summaryResult.value.shortSummary;
        newOutput.longSummary = summaryResult.value.longSummary;
        setShowSummaryAnimation(true);
        if (user) {
          const { streakMilestone } = await updateUserStats({ userId: user.uid, action: 'generateSummary' });
          if (streakMilestone) {
            toast({
              duration: 5000,
              component: () => <StreakToast streakDays={streakMilestone} />,
            });
          }
        }
      } else {
        console.error('Summary generation failed:', summaryResult.reason);
        toast({ title: 'Summary Failed', description: 'Could not generate summary.', variant: 'destructive' });
        hasError = true;
      }
      
      // Process flashcards result
      if (flashcardsResult.status === 'fulfilled') {
        newOutput.flashcards = flashcardsResult.value.flashcards;
        if (user) updateUserStats({ userId: user.uid, action: 'generateFlashcards' });
      } else {
        console.error('Flashcard generation failed:', flashcardsResult.reason);
        toast({ title: 'Flashcards Failed', description: 'Could not generate flashcards.', variant: 'destructive' });
        hasError = true;
      }
      
      // Process mind map result
      if (mindMapResult.status === 'fulfilled') {
        newOutput.mindMap = mindMapResult.value.mindMap;
        if (user) updateUserStats({ userId: user.uid, action: 'createMindmap' });
      } else {
        console.error('Mind map generation failed:', mindMapResult.reason);
        toast({ title: 'Mind Map Failed', description: 'Could not generate mind map.', variant: 'destructive' });
        hasError = true;
      }
      
      setOutput(newOutput);
      
      if (!hasError) {
        toast({
            title: 'Transformation Complete!',
            description: 'Your notes have been transformed. You also earned some points!',
        });
      } else {
          setErrorAnimation(true);
      }

    } catch (error) {
      console.error('Transformation failed:', error);
      toast({
        title: 'Transformation Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setErrorAnimation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePodcast = async () => {
    const progressId = `podcast-${Date.now()}`;
    try {
      startProgress(progressId, { value: 25, label: 'Generating podcast script...' });
      const podcastRes = await generatePodcast({ notes, style });
      
      setProgress(progressId, { value: 75, label: 'Rendering audio... This may take a moment.' });

      if (user) {
          const { streakMilestone } = await updateUserStats({ userId: user.uid, action: 'generatePodcast' });
          if (streakMilestone) {
            toast({
              duration: 5000,
              component: () => <StreakToast streakDays={streakMilestone} />,
            });
          }
          toast({ title: 'Podcast Generated!', description: 'You earned 5 points.' });
      }
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
      // Re-throw the error so the calling component knows it failed.
      throw error;
    } finally {
        finishProgress(progressId);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      previousNotesRef.current = notes ? notes + ' ' : '';
      setTranscript(''); // Reset transcript for new session
      startListening();
    }
  };


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      setIsUploading(true);
      setOutput(null);
      setNotes('');
      setErrorAnimation(false);
      
      const progressId = `extract-${Date.now()}`;
      try {
        const dataUri = await readFileAsDataURI(file);
        
        startProgress(progressId, { value: 50, label: `Extracting text from ${file.name}...` });
        
        let extractedText = '';
        if (fileType === 'video') {
          const result = await extractTextFromVideo({ videoDataUri: dataUri });
          extractedText = result.extractedText;
        } else {
          const result = await extractTextFromImage({ photoDataUri: dataUri });
          extractedText = result.extractedText;
        }

        setNotes(extractedText);
        toast({
          title: 'Text Extracted!',
          description: 'Your notes are ready to be transformed.',
        });
      } catch (error) {
        console.error(`${fileType} processing failed:`, error);
        setErrorAnimation(true);
        toast({
          title: 'Extraction Failed',
          description: `Could not extract text from the uploaded ${fileType}. Please try again.`,
          variant: 'destructive',
        });
      } finally {
        finishProgress(progressId);
        setIsUploading(false);
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (errorAnimation) {
      setErrorAnimation(false);
    }
    setNotes(e.target.value);
  }

  
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
        showAnimation={showSummaryAnimation}
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
        <h1 className="pt-4 font-serif text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5 bg-clip-text md:text-5xl animate-text-glow">
          NotesGPT
        </h1>
        <p className="mt-2 max-w-xl text-md text-muted-foreground">
          Instantly transform your raw notes into beautiful summaries, flashcards, and mind maps.
        </p>
      </div>

      <Card 
        className={cn(
            "w-full rounded-2xl border-2 border-primary/40 shadow-lg transition-all hover:shadow-xl",
            errorAnimation && "shake-error"
        )}
        onAnimationEnd={() => setErrorAnimation(false)}
    >
        <CardContent className="p-4 pb-0">
            <Textarea
              placeholder="Paste your notes here, upload a document, image, or video to get started..."
              className="min-h-[200px] resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
              value={notes}
              onChange={handleNotesChange}
              disabled={isLoading}
            />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 p-4">
            <div className="flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png,image/jpeg,application/pdf,video/*"
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
                      Upload File
                    </>
                  )}
                </Button>
                 <Button
                    onClick={handleVoiceClick}
                    disabled={isLoading || !isSupported}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "text-muted-foreground hover:text-foreground",
                        isListening && "text-destructive animate-pulse"
                    )}
                >
                    <Mic className="mr-2 h-4 w-4" />
                    {isListening ? 'Stop Listening' : 'Speak Notes'}
                </Button>
            </div>
        </CardFooter>
      </Card>
      
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
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
