
'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, LoaderCircle, BookOpen, Presentation, X, Music, Shield, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ShareDialog from './share-dialog';
import MindMap from './mind-map';
import type { Flashcard as FlashcardType, Podcast as PodcastType, QuizQuestion, Slides as SlidesType } from '@/types';
import { Skeleton } from './ui/skeleton';
import { shareGeneration } from '@/ai/flows/share-generation';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateSlides } from '@/ai/flows/generate-slides';
import QuizArena from './quiz-arena';
import Chat from './chat';
import FlashcardDeck from './flashcard-deck';
import AnimatedCheck from './animated-check';
import { cn } from '@/lib/utils';
import LockIcon from './lock-icon';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';


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
  showAnimation: boolean;
}

const cardVariants = {
  initial: { scale: 1, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.0)' },
  pulse: { 
    scale: [1, 1.02, 1],
    boxShadow: [
        '0 10px 15px -3px rgb(0 0 0 / 0.0)', 
        '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
        '0 10px 15px -3px rgb(0 0 0 / 0.0)'
    ],
    transition: { duration: 0.7, ease: "easeInOut" }
  }
};

const sharePreviewVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }
    },
    exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.15 } }
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
  showAnimation,
}: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [shareId, setShareId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slides, setSlides] = useState<SlidesType | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const [userPlan, setUserPlan] = useState('Free'); // 'Free', 'Starter', 'Pro'
  const router = useRouter();

  const summaryRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);
  const podcastRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  const requireAuth = (callback: () => void) => {
    if (!user) {
      router.push('/login?redirectUrl=' + encodeURIComponent(window.location.pathname));
      toast({
        title: "Login Required",
        description: "Please log in to use this feature.",
      });
    } else {
      callback();
    }
  };

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
      setShowSharePreview(false);
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
      setSlides(result);
      toast({
        title: 'Presentation Ready!',
        description: 'Your PowerPoint presentation has been generated successfully.',
      });
    } catch (error) {
      console.error('Slides generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Slides Generation Failed',
        description: errorMessage,
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

  const isShareableContentAvailable = !!(shortSummary || longSummary || flashcards || mindMap);
  const isPodcastLocked = userPlan === 'Free';
  const areSlidesLocked = userPlan !== 'Pro';

  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-6">
          <TabsList className="bg-primary/80 rounded-full h-auto p-1 flex-wrap justify-center">
            <TabsTrigger value="summary" className="text-sm rounded-full h-10 flex items-center gap-1.5"><BookOpen className="w-4 h-4" />Summary</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-sm rounded-full h-10" disabled={!flashcards}>Flashcards</TabsTrigger>
            <TabsTrigger value="mind-map" className="text-sm rounded-full h-10" disabled={!mindMap}>Mind Map</TabsTrigger>
            <TabsTrigger value="slides" className="text-sm rounded-full h-10 flex items-center gap-1.5">
                <Presentation className="w-4 h-4" />Slides
                {areSlidesLocked && <LockIcon />}
            </TabsTrigger>
            <TabsTrigger value="podcast" className="text-sm rounded-full h-10 flex items-center gap-1.5">
                <Music className="w-4 h-4" />Podcast {isPodcastLocked && <LockIcon />}
            </TabsTrigger>
            <TabsTrigger value="arcade" className="text-sm rounded-full h-10 flex items-center gap-1.5"><Shield className="w-4 h-4" />Arcade</TabsTrigger>
            <TabsTrigger value="chat" className="text-sm rounded-full h-10 flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />Chat</TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
        <TabsContent value="summary">
          <motion.div variants={cardVariants} animate={showAnimation ? "pulse" : "initial"}>
            <Card ref={summaryRef} className="rounded-xl border-2 border-primary/40">
              <CardContent className="p-6 relative">
                 <AnimatedCheck show={showAnimation} />
                <Tabs defaultValue="short" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="short">Short Summary</TabsTrigger>
                    <TabsTrigger value="long">Long Summary</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="short"
                    className="prose dark:prose-invert pt-4 max-w-none prose-sm prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground"
                  >
                    <div className={cn(showAnimation && 'headline-glow-animation')} dangerouslySetInnerHTML={{ __html: shortSummary ?? '' }} />
                  </TabsContent>
                  <TabsContent
                    value="long"
                    className="prose dark:prose-invert pt-4 max-w-none prose-sm prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground"
                  >
                    <div className={cn(showAnimation && 'headline-glow-animation')} dangerouslySetInnerHTML={{ __html: longSummary ?? '' }} />
                  </TabsContent>
                </Tabs>
              </CardContent>
               {isShareable && isShareableContentAvailable && (
                <CardFooter>
                    <Button onClick={() => requireAuth(() => setShareDialogOpen(true))} variant="outline" className="w-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Summary
                    </Button>
                </CardFooter>
               )}
            </Card>
          </motion.div>
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
            <CardContent className="p-6 flex flex-col justify-center min-h-[400px] items-center text-center">
              {slides?.embedUrl ? (
                <div className="w-full h-[350px] flex flex-col items-center">
                    <iframe 
                        src={slides.embedUrl}
                        className="w-full h-full rounded-lg border"
                        allowFullScreen
                    ></iframe>
                    <Button asChild className="font-semibold mt-4">
                        <a href={slides.downloadUrl} target="_blank" download>Download Presentation</a>
                    </Button>
                </div>
              ) : (
                <>
                  <Presentation className="w-16 h-16 text-primary mb-4" />
                  <h2 className="text-2xl font-bold font-serif mb-2">Generate Slides</h2>
                  <p className="text-muted-foreground mb-4">
                    Turn your notes into a professional presentation.
                  </p>
                  <Button
                    onClick={() => requireAuth(handleGenerateSlides)}
                    disabled={isGeneratingSlides || areSlidesLocked}
                    className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                  >
                    {isGeneratingSlides ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : areSlidesLocked ? (
                      'Upgrade to generate slides'
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
                    onClick={() => requireAuth(handlePodcastGeneration)}
                    disabled={isGeneratingPodcast || isPodcastLocked}
                    className="font-semibold text-lg py-6 rounded-xl shadow-lg"
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : isPodcastLocked ? (
                      'Upgrade for Podcasts'
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
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
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

        <TabsContent value="chat">
            <Card ref={chatRef} className="rounded-xl border-2 border-primary/40">
                <CardContent className="p-0">
                    <Chat notes={notes} />
                </CardContent>
            </Card>
        </TabsContent>
        </motion.div>
        </AnimatePresence>
      </Tabs>
      
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
        />

    </div>
  );
}
