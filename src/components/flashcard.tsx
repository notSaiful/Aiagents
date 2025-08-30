
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Flashcard as FlashcardType } from '@/types';

interface FlashcardProps {
  flashcard: FlashcardType;
}

export default function Flashcard({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group h-full w-full [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          'relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 [backface-visibility:hidden]">
          <h3 className="text-sm text-muted-foreground">Question</h3>
          <p className="mt-2 text-center text-xl font-semibold">{flashcard.question}</p>
        </CardContent>
        <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-primary p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
           <h3 className="text-sm text-primary-foreground/70">Answer</h3>
           <p className="mt-2 text-center text-lg font-medium text-primary-foreground">{flashcard.answer}</p>
        </CardContent>
      </Card>
    </div>
  );
}
