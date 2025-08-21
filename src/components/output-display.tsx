'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Flashcard from './flashcard';
import MindMap from './mind-map';
import type { Flashcard as FlashcardType, MindMapNodeData } from '@/types';
import ShareDialog from './share-dialog';
import Mermaid from './mermaid';

interface OutputDisplayProps {
  summary: string;
  flashcards: FlashcardType[];
  mindMap: MindMapNodeData;
  diagram: string;
}

export default function OutputDisplay({ summary, flashcards, mindMap, diagram }: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'The link has been copied to your clipboard.',
    });
    setShareDialogOpen(false);
  }

  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-center mb-4">
          <TabsList className="bg-primary/60">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="mind-map">Mind Map</TabsTrigger>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-primary-foreground prose-strong:text-primary-foreground prose-li:marker:text-primary-foreground">
              <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flashcards" className="h-[450px]">
          <Carousel className="w-full h-full max-w-md mx-auto">
            <CarouselContent className="h-full">
              {flashcards.map((fc, index) => (
                <CarouselItem key={index} className="h-full p-2">
                   <div className="p-1 h-full">
                     <Flashcard flashcard={fc} />
                   </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </TabsContent>
        <TabsContent value="mind-map">
           <Card>
            <CardContent className="p-6">
                <MindMap data={mindMap} />
            </CardContent>
           </Card>
        </TabsContent>
         <TabsContent value="diagram">
           <Card>
            <CardContent className="p-6 flex justify-center">
                <Mermaid chart={diagram} />
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
