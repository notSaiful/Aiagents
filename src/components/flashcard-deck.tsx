
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Flashcard as FlashcardType } from '@/types';

interface FlashcardDeckProps {
  cards: FlashcardType[];
  onFinish: () => void;
}

const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const cardVariants = {
  initial: { y: -50, opacity: 0, scale: 0.9 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 50, opacity: 0, scale: 0.9 },
};

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
};

export default function FlashcardDeck({ cards, onFinish }: FlashcardDeckProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<FlashcardType[]>([]);
  const [reviewLaterCards, setReviewLaterCards] = useState<FlashcardType[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setShuffledCards(shuffleArray([...cards]));
  }, [cards]);

  const currentCard = useMemo(() => shuffledCards[currentIndex], [shuffledCards, currentIndex]);
  
  const handleNext = (isKnown: boolean) => {
    if (!currentCard) return;

    if (isKnown) {
        setKnownCards(prev => [...prev, currentCard]);
    } else {
        setReviewLaterCards(prev => [...prev, currentCard]);
    }
    
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        // First pass complete, check if there are cards to review
        if(reviewLaterCards.length > 0) {
            // Start reviewing the 'review later' pile
            setShuffledCards(shuffleArray([...reviewLaterCards]));
            setReviewLaterCards([]);
            setCurrentIndex(0);
        } else {
            setIsFinished(true);
        }
    }
  };
  
  const handleRestart = () => {
    setShuffledCards(shuffleArray([...cards]));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setReviewLaterCards([]);
    setIsFinished(false);
  }

  if (isFinished) {
    const mastery = cards.length > 0 ? (knownCards.length / cards.length) * 100 : 0;
    return (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="w-full text-center">
            <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold font-serif mb-2">Deck Complete!</h2>
            <p className="text-lg text-muted-foreground">You marked {knownCards.length} out of {cards.length} cards as known.</p>
            <p className="text-2xl font-bold mt-2">Mastery: {mastery.toFixed(0)}%</p>
            <div className="flex gap-4 justify-center mt-6">
                <Button onClick={handleRestart}>
                    <RefreshCw className="mr-2" />
                    Study Again
                </Button>
                <Button variant="outline" onClick={onFinish}>
                    Close Deck
                </Button>
            </div>
        </motion.div>
    );
  }
  
  if (!currentCard) {
    return <div className="text-muted-foreground">Loading deck...</div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 flex flex-col h-[400px]">
        {/* Progress Bar and Counter */}
        <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{currentIndex + 1} / {shuffledCards.length}</span>
            </div>
            <Progress value={((currentIndex + 1) / shuffledCards.length) * 100} />
        </div>
      
        {/* Flashcard */}
        <div className="flex-grow [perspective:1000px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className={cn(
                        'relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500',
                        isFlipped && '[transform:rotateY(180deg)]'
                    )}
                >
                    {/* Front */}
                    <Card className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]">
                         <Badge variant="secondary" className="absolute top-4 right-4">
                           <span className={cn("w-2 h-2 rounded-full mr-2", difficultyColors[currentCard.difficulty])}></span>
                           {currentCard.difficulty}
                        </Badge>
                        <CardContent className="flex-grow flex items-center justify-center text-center p-0">
                            <p className="text-xl font-semibold">{currentCard.question}</p>
                        </CardContent>
                        <Button onClick={() => setIsFlipped(true)} className="w-full">Reveal Answer</Button>
                    </Card>
                    
                    {/* Back */}
                    <Card className="absolute inset-0 flex flex-col justify-between p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] bg-primary text-primary-foreground">
                        <CardContent className="flex-grow flex items-center justify-center text-center p-0">
                           <p className="text-lg">{currentCard.answer}</p>
                        </CardContent>
                        <div className="flex gap-4">
                            <Button onClick={() => handleNext(false)} variant="secondary" className="w-full">
                                <X className="mr-2" /> Review Later
                            </Button>
                            <Button onClick={() => handleNext(true)} className="w-full bg-green-500 hover:bg-green-600 text-white">
                                <Check className="mr-2" /> I Knew It!
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
}
