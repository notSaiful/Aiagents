
'use client';

import { useProgress } from '@/context/progress-context';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProgressRibbon() {
  const { progresses } = useProgress();
  const hasProgress = progresses.length > 0;
  const currentProgress = hasProgress ? progresses[0] : { id: '', state: { value: 0, label: '' } };

  return (
    <AnimatePresence>
      {hasProgress && (
        <motion.div
          className="w-full h-auto bg-primary/20"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="p-2 text-center">
            <p className="text-xs font-semibold text-primary-foreground mb-1">
              {currentProgress.state.label}
            </p>
            <Progress value={currentProgress.state.value} className="h-1.5" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
