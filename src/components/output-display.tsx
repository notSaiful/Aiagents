'use client';

import { useState } from 'react';
import { Share2, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import Image from 'next/image';
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
  napkin: string;
}

export default function OutputDisplay({ summary, flashcards, mindMap, diagram, napkin }: OutputDisplayProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [diagramScale, setDiagramScale] = useState(1);
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'The link has been copied to your clipboard.',
    });
    setShareDialogOpen(false);
  }

  const handleDownloadNapkin = () => {
    const link = document.createElement('a');
    link.href = napkin;
    link.download = 'napkin-diagram.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: 'Image Downloaded',
        description: 'The napkin diagram has been downloaded.',
    });
  }

  return (
    <div className="relative">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-primary/80 rounded-full h-12 px-2">
            <TabsTrigger value="summary" className="text-base rounded-full h-10">Summary</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-base rounded-full h-10">Flashcards</TabsTrigger>
            <TabsTrigger value="mind-map" className="text-base rounded-full h-10">Mind Map</TabsTrigger>
            <TabsTrigger value="diagram" className="text-base rounded-full h-10">Diagram</TabsTrigger>
            <TabsTrigger value="napkin" className="text-base rounded-full h-10">Napkin</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <Card className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-accent-foreground prose-strong:text-foreground prose-li:marker:text-primary-foreground/80">
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
           <Card className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6">
                <MindMap data={mindMap} />
            </CardContent>
           </Card>
        </TabsContent>
         <TabsContent value="diagram">
            <Card className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6">
                <div className="relative overflow-hidden">
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setDiagramScale(s => s * 1.2)}><ZoomIn className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => setDiagramScale(s => s / 1.2)}><ZoomOut className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => setDiagramScale(1)}><RotateCcw className="h-4 w-4" /></Button>
                </div>
                <div className="overflow-auto flex justify-center items-center">
                    <div style={{ transform: `scale(${diagramScale})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}>
                        <Mermaid chart={diagram} />
                    </div>
                </div>
                </div>
            </CardContent>
           </Card>
        </TabsContent>
        <TabsContent value="napkin">
           <Card className="rounded-xl border-2 border-primary/40">
            <CardContent className="p-6 flex flex-col items-center">
                <Image src={napkin} alt="Napkin Diagram" width={1024} height={576} className="rounded-lg shadow-lg" data-ai-hint="diagram comic" />
                <Button onClick={handleDownloadNapkin} className="mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                </Button>
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
