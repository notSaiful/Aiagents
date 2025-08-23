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
import type { Flashcard as FlashcardType } from '@/types';
import { Skeleton } from './ui/skeleton';


interface OutputDisplayProps {
  shortSummary?: string;
  longSummary?: string;
  flashcards?: FlashcardType[];
  mindMap?: string;
}

export default function OutputDisplay({
  shortSummary,
  longSummary,
  flashcards,
  mindMap,
}: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const summaryRef = useRef<HTMLDivElement>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'The link has been copied to your clipboard.',
    });
    setShareDialogOpen(false);
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
      </Tabs>
      {(shortSummary || longSummary || flashcards || mindMap) && activeTab !== 'flashcards' && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setShareDialogOpen}
          onCopyLink={handleCopyLink}
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