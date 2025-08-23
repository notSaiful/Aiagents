
'use client';

import { useState, useRef } from 'react';
import { Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ShareDialog from './share-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Flashcard from './flashcard';
import MindMap from './mind-map';
import Art from './art';
import type { Flashcard as FlashcardType } from '@/types';
import { Skeleton } from './ui/skeleton';
import { shareGeneration } from '@/ai/flows/share-generation';

interface OutputDisplayProps {
  shortSummary?: string;
  longSummary?: string;
  flashcards?: FlashcardType[];
  mindMap?: string;
  imageUrl?: string;
  isShareable?: boolean;
}

export default function OutputDisplay({
  shortSummary,
  longSummary,
  flashcards,
  mindMap,
  imageUrl,
  isShareable = false,
}: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [shareId, setShareId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

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
          imageUrl: imageUrl ?? '',
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
          <TabsList className="bg-primary/80 rounded-full h-12 px-2">
            <TabsTrigger value="summary" className="text-base rounded-full h-10">
              Summary
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="text-base rounded-full h-10" disabled={!flashcards}>
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="mind-map" className="text-base rounded-full h-10" disabled={!mindMap}>
              Mind Map
            </TabsTrigger>
             <TabsTrigger value="art" className="text-base rounded-full h-10" disabled={!imageUrl}>
              Art
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
                  className="pt-4 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground prose-li:marker:text-primary-foreground/80"
                >
                  <div dangerouslySetInnerHTML={{ __html: shortSummary ?? '' }} />
                </TabsContent>
                <TabsContent
                  value="long"
                  className="pt-4 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground prose-li:marker:text-primary-foreground/80"
                >
                  <div dangerouslySetInnerHTML={{ __html: longSummary ?? '' }} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
            <Card ref={flashcardsRef} className="rounded-xl border-2 border-primary/40 flex items-center justify-center min-h-[250px] py-4">
             {!flashcards ? (
                renderLoadingSkeletons()
              ) : (
                <Carousel className="w-full max-w-md mx-auto" opts={{ loop: true }}>
                  <CarouselContent>
                    {Array.isArray(flashcards) && flashcards.map((flashcard, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1 h-[200px]">
                          <Flashcard flashcard={flashcard} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              )}
            </Card>
        </TabsContent>

        <TabsContent value="mind-map">
          <Card ref={mindMapRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex justify-center min-h-[250px] items-center">
              {!mindMap ? (
                renderLoadingSkeletons()
              ) : (
                <MindMap data={mindMap} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="art">
          <Card ref={artRef} className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex justify-center min-h-[250px] items-center">
              {!imageUrl ? (
                renderLoadingSkeletons()
              ) : (
                <Art imageUrl={imageUrl} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {isShareable && (shortSummary || longSummary || flashcards || mindMap || imageUrl) && activeTab !== 'flashcards' && (
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
            art: artRef,
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
