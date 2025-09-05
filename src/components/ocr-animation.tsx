
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText, ScanLine } from 'lucide-react';
import { useProgress } from '@/context/progress-context';

interface OcrAnimationProps {
  show: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const paperVariants = {
    initial: { y: 0, scale: 1, opacity: 1 },
    animate: {
        y: -120,
        scale: 0.1,
        opacity: 0,
        rotateX: 70,
        transition: {
            duration: 1,
            ease: 'easeInOut'
        }
    }
}

export default function OcrAnimation({ show }: OcrAnimationProps) {
  const { progresses } = useProgress();
  const currentProgress = progresses.find(p => p.id.startsWith('extract-'));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        >
          <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div
                key="paper"
                variants={paperVariants}
                initial="initial"
                animate="animate"
            >
                <FileText className="w-24 h-24 text-foreground" />
            </motion.div>
            <ScanLine className="absolute w-32 h-32 text-primary animate-scanner-glow" />
          </div>
          <p className="text-lg font-semibold text-foreground mt-4 dot-loader">
            {currentProgress?.state.label || "Processing your document"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
