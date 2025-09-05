
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCharacterStore, Emotion } from '@/store/character-store';
import { useAuth } from '@/context/auth-context';

const emotionMap: Record<Emotion, { src: string; alt: string }> = {
    idle: { src: 'https://picsum.photos/seed/idle/128/128', alt: 'Mascot is idle' },
    joy: { src: 'https://picsum.photos/seed/joy/128/128', alt: 'Mascot is happy' },
    cheer: { src: 'https://picsum.photos/seed/cheer/128/128', alt: 'Mascot is cheering' },
    pride: { src: 'https://picsum.photos/seed/pride/128/128', alt: 'Mascot is proud' },
    surprised: { src: 'https://picsum.photos/seed/surprised/128/128', alt: 'Mascot is surprised' },
    confused: { src: 'https://picsum.photos/seed/confused/128/128', alt: 'Mascot is confused' },
    sad: { src: 'https://picsum.photos/seed/sad/128/128', alt: 'Mascot is sad' },
    determined: { src: 'https://picsum.photos/seed/determined/128/128', alt: 'Mascot is determined' },
    sleepy: { src: 'https://picsum.photos/seed/sleepy/128/128', alt: 'Mascot is sleepy' },
    encouraging: { src: 'https://picsum.photos/seed/encouraging/128/128', alt: 'Mascot is encouraging' },
};

const characterVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotate: -15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
  exit: { 
    opacity: 0, 
    y: -50, 
    scale: 0.8,
    rotate: 15,
    transition: { duration: 0.2 }
  }
};


export default function CharacterFeedback() {
    const { user } = useAuth();
    const emotion = useCharacterStore(state => state.emotion);

    if (!user) {
        return null;
    }

    const { src, alt } = emotionMap[emotion];

    return (
        <div className="fixed bottom-6 left-6 z-50 w-32 h-32 pointer-events-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={emotion}
                    variants={characterVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full h-full"
                >
                    <Image
                        src={src}
                        alt={alt}
                        width={128}
                        height={128}
                        priority
                        unoptimized
                        className="rounded-full shadow-lg"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
