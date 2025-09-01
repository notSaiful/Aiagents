
'use client';

import { useState, useRef } from 'react';
import { Share2, LoaderCircle, BookOpen, Presentation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ShareDialog from './share-dialog';
import MindMap from './mind-map';
import type { Flashcard as FlashcardType, Podcast as PodcastType, QuizQuestion } from '@/types';
import { Skeleton } from './ui/skeleton';
import { shareGeneration } from '@/ai/flows/share-generation';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateSlides } from '@/ai/flows/generate-slides';
import QuizArena from './quiz-arena';
import Talkie from './talkie';
import FlashcardDeck from './flashcard-deck';

interface OutputDisplayProps {
  shortSummary?: string;
  longSummary?: string;
  flashcards?: FlashcardType[];
  mindMap?: string;
  podcast?: PodcastType;
  onGeneratePodcast?: () => Promise<void>;
  isShareable?: boolean;
  notes: string;
  style: string;
}

export default function OutputDisplay({
  shortSummary,
  longSummary,
  flashcards,
  mindMap,
  podcast,
  onGeneratePodcast,
  isShareable = false,
  notes,
  style,
}: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [shareId, setShareId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState<string | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);
  const podcastRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);
  const talkieRef = useRef<HTMLDivElement>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    setIsSharing(true);
    try {
      let currentShareId = shareId;
      if (!currentShareId) {
        toast({
          title: 'Creating Share Link...',
          description: 'Please wait a moment.',
        });
        const result = await shareGeneration({
          shortSummary: shortSummary ?? '',
          longSummary: longSummary ?? '',
          flashcards: flashcards ?? [],
          mindMap: mindMap ?? '',
        });
        currentShareId = result.shareId;
        setShareId(currentShareId);
      }
      
      const shareUrl = `${window.location.origin}/share/${currentShareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'The shareable link is in your clipboard.',
      });

    } catch (error) {
       console.error('Failed to create or copy share link:', error);
       toast({
        title: 'Sharing Failed',
        description: 'Could not create a shareable link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
      setShareDialogOpen(false);
    }
  };

  const handlePodcastGeneration = async () => {
    if (!onGeneratePodcast) return;
    setIsGeneratingPodcast(true);
    try {
      await onGeneratePodcast();
    } catch (error) {
      // Error is already toasted in the parent component.
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
        const { questions } = await generateQuiz({ notes, style });
        setQuizQuestions(questions);
    } catch (error) {
        console.error('Quiz generation failed:', error);
        toast({
            title: 'Quiz Generation Failed',
            description: 'Could not generate a quiz from your notes. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateSlides = async () => {
    setIsGeneratingSlides(true);
    try {
      const result = await generateSlides({ notes });
      setSlidesUrl(result.downloadUrl);
      toast({
        title: 'Presentation Ready!',
        description: 'Your PowerPoint presentation has been generated successfully.',
      });
    } catch (error) {
      console.error('Slides generation failed:', error);
      toast({
        title: 'Slides Generation Failed',
        description: 'An unexpected error occurred while creating your presentation.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSlides(false);
    }
  };
  
  const renderLoadingSkeletons = () => (
    <div className="w-full space-y-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );


  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-6">
          <TabsList className="bg-primary/80 rounded-full h-12 px-2 flex-wrap">
            <TabsTrigger value="summary" className="text-base rounded-full h-10">
              Summary
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="text-base rounded-full h-10" disabled={!flashcards}>
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="mind-map" className="text-base rounded-full h-10" disabled={!mindMap}>
              Mind Map
            </TabsTrigger>
            <TabsTrigger value="slides" className="text-base rounded-full h-10">
              Slides
            </TabsTrigger>
            <TabsTrigger value="podcast" className="text-base rounded-full h-10">
              Podcast
            </TabsTrigger>
            <TabsTrigger value="arcade" className="text-base rounded-full h-10">
                Arcade
            </TabsTrigger>
            <TabsTrigger value="talkie" className="text-base rounded-full h-10">
                Talkie
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <Card ref={summaryRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6">
              <Tabs defaultValue="short" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="short">Short Summary</TabsTrigger>
                  <TabsTrigger value="long">Long Summary</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="short"
                  className="prose dark:prose-invert pt-4 max-w-none prose-sm prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground"
                >
                  <div dangerouslySetInnerHTML={{ __html: shortSummary ?? '' }} />
                </TabsContent>
                <TabsContent
                  value="long"
                  className="prose dark:prose-invert pt-4 max-w-none prose-sm prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground"
                >
                  <div dangerouslySetInnerHTML={{ __html: longSummary ?? '' }} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
            <Card ref={flashcardsRef} className="rounded-xl border-2 border-primary/40 flex items-center justify-center min-h-[400px] py-4">
             {!flashcards ? (
                renderLoadingSkeletons()
              ) : isStudying ? (
                <FlashcardDeck cards={flashcards} onFinish={() => setIsStudying(false)} />
              ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold font-serif mb-2">Flashcards Ready!</h2>
                    <p className="text-muted-foreground mb-4">
                        {flashcards.length} cards were generated from your notes.
                    </p>
                    <Button
                        onClick={() => setIsStudying(true)}
                        className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                    >
                        <BookOpen className="mr-2" />
                        Study Flashcards
                    </Button>
                </div>
              )}
            </Card>
        </TabsContent>

        <TabsContent value="mind-map">
          <Card ref={mindMapRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-0 flex justify-center items-center">
              {!mindMap ? (
                renderLoadingSkeletons()
              ) : (
                <MindMap data={mindMap} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slides">
          <Card ref={slidesRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex flex-col justify-center min-h-[250px] items-center text-center">
              <Presentation className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-2xl font-bold font-serif mb-2">Generate Slides</h2>
              {slidesUrl ? (
                 <>
                  <p className="text-muted-foreground mb-4">Your presentation is ready for download.</p>
                  <Button asChild className="font-semibold text-lg py-6 rounded-xl shadow-lg">
                    <a href={slidesUrl} target="_blank" download>Download Presentation</a>
                  </Button>
                 </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    Turn your notes into a professional PowerPoint presentation.
                  </p>
                  <Button
                    onClick={handleGenerateSlides}
                    disabled={isGeneratingSlides}
                    className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                  >
                    {isGeneratingSlides ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating Slides...
                      </>
                    ) : (
                      'Generate Presentation'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="podcast">
          <Card ref={podcastRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex flex-col justify-center min-h-[250px] items-center">
              {podcast?.audioUrl ? (
                <audio controls src={podcast.audioUrl} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Generate a podcast from your notes.
                  </p>
                  <Button
                    onClick={handlePodcastGeneration}
                    disabled={isGeneratingPodcast}
                    className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating Podcast...
                      </>
                    ) : (
                      'Generate Podcast'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="arcade">
            <Card ref={arcadeRef} className="rounded-xl border-2 border-primary/40">
                <CardContent className="p-6 flex flex-col justify-center min-h-[400px] items-center">
                    {quizQuestions ? (
                        <QuizArena questions={quizQuestions} style={style} />
                    ) : (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif mb-2">Quiz Arena</h2>
                            <p className="text-muted-foreground mb-4">
                                Test your knowledge with a game generated from your notes!
                            </p>
                            <Button
                                onClick={handleGenerateQuiz}
                                disabled={isGeneratingQuiz}
                                className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                            >
                                {isGeneratingQuiz ? (
                                    <>
                                        <LoaderCircle className="animate-spin mr-2" />
                                        Generating Quiz...
                                    </>
                                ) : (
                                    'Start Game'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="talkie">
            <Card ref={talkieRef} className="rounded-xl border-2 border-primary/40">
                <CardContent className="p-0">
                    <Talkie notes={notes} />
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
      {isShareable && (shortSummary || longSummary || flashcards || mindMap) && !['flashcards', 'podcast', 'arcade', 'talkie', 'slides'].includes(activeTab) && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setShareDialogOpen}
          onCopyLink={handleCopyLink}
          isSharing={isSharing}
          activeTab={activeTab}
          refs={{
            summary: summaryRef,
            flashcards: flashcardsRef,
            'mind-map': mindMapRef,
          }}
        >
          <Button
            onClick={() => setShareDialogOpen(true)}
            variant="default"
            size="icon"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Share2 className="h-6 w-6" />
            <span className="sr-only">Share</span>
          </Button>
        </ShareDialog>
      )}
    </div>
  );
}
