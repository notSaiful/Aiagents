'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

interface AnimatedCheckProps {
  show: boolean;
}

const checkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 400, damping: 25, duration: 0.18 }
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.1 } }
};

export default function AnimatedCheck({ show }: AnimatedCheckProps) {
  useEffect(() => {
    if (show) {
      const audio = new Audio('/chime.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.error("Failed to play sound:", e));
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate(100);
      }
    }
  }, [show]);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {show && "Summary ready."}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            variants={checkVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-4 right-4 z-10 bg-green-500 text-white rounded-full p-1"
          >
            <Check className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
