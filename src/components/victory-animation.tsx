
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

const netVariants = {
    hidden: { y: '-100%', opacity: 0 },
    visible: { y: '0%', opacity: 1, transition: { type: 'spring', damping: 10, stiffness: 80 } },
    exit: { opacity: 0, scale: 1.5, transition: { duration: 0.3, delay: 0.2 } },
};

const creatureVariants = {
    initial: { scale: 1, opacity: 1 },
    captured: { scale: 0, opacity: 0, transition: { duration: 0.3, delay: 0.5 } },
};

const cardVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4, delay: 0.8 } },
};

const finalUiVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 1.5 } },
};

interface VictoryAnimationProps {
    score: number;
    onRestart: () => void;
}

export default function VictoryAnimation({ score, onRestart }: VictoryAnimationProps) {
    const { width, height } = useWindowSize();
    const [animationStep, setAnimationStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setAnimationStep(1), 500),     // Net disappears, creature shrinks
            setTimeout(() => setAnimationStep(2), 1000),    // Card appears with confetti
            setTimeout(() => setAnimationStep(3), 2500),    // Final UI shows
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {animationStep >= 2 && (
                <Confetti
                    width={width}
                    height={height}
                    numberOfPieces={200}
                    recycle={false}
                    gravity={0.15}
                />
            )}
            
            <AnimatePresence>
                {animationStep < 2 && (
                     <motion.div
                        key="creature"
                        variants={creatureVariants}
                        initial="initial"
                        animate={animationStep >= 1 ? 'captured' : 'initial'}
                        className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center text-5xl creature-wiggle"
                    >
                        😈
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
            {animationStep < 1 && (
                <motion.div
                    key="net"
                    variants={netVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute w-32 h-32"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M10 10 L90 10 L90 90 L10 90 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="4" />
                        <path d="M10 30 L90 30 M10 50 L90 50 M10 70 L90 70" stroke="hsl(var(--foreground))" strokeWidth="2" />
                        <path d="M30 10 L30 90 M50 10 L50 90 M70 10 L70 90" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    </svg>
                </motion.div>
            )}
            </AnimatePresence>

             <AnimatePresence>
                {animationStep === 2 && (
                    <motion.div
                        key="card"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute flex flex-col items-center"
                    >
                        <div className="w-24 h-32 bg-primary rounded-lg shadow-lg border-2 border-primary-foreground flex items-center justify-center text-5xl">
                           😈
                        </div>
                        <p className="font-bold mt-2">Note Creature Captured!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {animationStep >= 3 && (
                    <motion.div
                        key="final-ui"
                        variants={finalUiVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute flex flex-col items-center"
                    >
                        <h2 className="text-3xl font-bold font-serif mb-2">Victory!</h2>
                        <p className="text-lg text-muted-foreground">Your final score: {score}</p>
                        <Button onClick={onRestart} className="mt-6">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
