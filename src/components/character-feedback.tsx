
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCharacterStore, Emotion } from '@/store/character-store';
import { useAuth } from '@/context/auth-context';

const emotionMap: Record<Emotion, { src: string; alt: string }> = {
    idle: { src: '/assets/character/idle.png', alt: 'Mascot is idle' },
    joy: { src: '/assets/character/joy.png', alt: 'Mascot is happy' },
    cheer: { src: '/assets/character/cheer.png', alt: 'Mascot is cheering' },
    pride: { src: '/assets/character/pride.png', alt: 'Mascot is proud' },
    surprised: { src: '/assets/character/surprised.png', alt: 'Mascot is surprised' },
    confused: { src: '/assets/character/confused.png', alt: 'Mascot is confused' },
    sad: { src: '/assets/character/sad.png', alt: 'Mascot is sad' },
    determined: { src: '/assets/character/determined.png', alt: 'Mascot is determined' },
    sleepy: { src: '/assets/character/sleepy.png', alt: 'Mascot is sleepy' },
    encouraging: { src: '/assets/character/encouraging.png', alt: 'Mascot is encouraging' },
};

const characterVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.8,
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
                >
                    <Image
                        src={src}
                        alt={alt}
                        width={128}
                        height={128}
                        priority
                        unoptimized
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
