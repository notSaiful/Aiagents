
'use client';

import { useState } from 'react';
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

interface OutputDisplayProps {
  shortSummary: string;
  longSummary: string;
  flashcards: FlashcardType[];
  mindMap: string;
}

export default function OutputDisplay({
  shortSummary,
  longSummary,
  flashcards,
  mindMap,
}: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'The link has been copied to your clipboard.',
    });
    setShareDialogOpen(false);
  };

  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-primary/80 rounded-full h-12 px-2">
            <TabsTrigger value="summary" className="text-base rounded-full h-10">
              Summary
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="text-base rounded-full h-10">
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="mind-map" className="text-base rounded-full h-10">
              Mind Map
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <Card className="rounded-xl border-2 border-primary/40">
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
                  <div dangerouslySetInnerHTML={{ __html: shortSummary }} />
                </TabsContent>
                <TabsContent
                  value="long"
                  className="pt-4 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground prose-li:marker:text-primary-foreground/80"
                >
                  <div dangerouslySetInnerHTML={{ __html: longSummary }} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
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
        </TabsContent>

        <TabsContent value="mind-map">
          <Card className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex justify-center">
              <MindMap data={mindMap} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onCopyLink={handleCopyLink}
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
    </div>
  );
}
