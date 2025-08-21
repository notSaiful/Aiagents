'use client';

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

interface OutputDisplayProps {
  summary: string;
  flashcards: FlashcardType[];
  mindMap: MindMapNodeData;
}

export default function OutputDisplay({ summary, flashcards, mindMap }: OutputDisplayProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Notes Summary',
          text: summary,
          url: window.location.href,
        });
      } catch (error) {
        toast({
          title: 'Share failed',
          description: 'Could not share the content.',
          variant: 'destructive',
        });
      }
    } else {
      await navigator.clipboard.writeText(summary);
      toast({
        title: 'Copied to clipboard',
        description: 'Share functionality is not available, so we copied the summary for you.',
      });
    }
  };

  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="mind-map">Mind Map</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none">
              {summary.split('\n').map((line, index) => {
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.substring(2)}</li>;
                }
                return <p key={index}>{line}</p>;
              })}
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
      </Tabs>
      <Button
        onClick={handleShare}
        variant="outline"
        size="icon"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Share2 className="h-6 w-6" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  );
}
