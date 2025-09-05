
'use client';

import { PartyPopper } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useCharacterStore } from '@/store/character-store';
import { useEffect } from 'react';

interface StreakToastProps {
  streakDays: number;
}

export default function StreakToast({ streakDays }: StreakToastProps) {
  const { width, height } = useWindowSize();
  const setEmotion = useCharacterStore(state => state.setEmotion);

  useEffect(() => {
    setEmotion('pride');
  }, [setEmotion]);

  return (
    <>
      <Confetti
        width={width}
        height={height}
        numberOfPieces={50}
        recycle={false}
        gravity={0.1}
        run={true}
        confettiSource={{
            x: width - 200,
            y: height - 100,
            w: 400,
            h: 200,
        }}
        className="fixed top-0 left-0 w-full h-full"
      />
      <div className="flex items-center gap-3 w-full">
        <PartyPopper className="w-8 h-8 text-yellow-400" />
        <div className="grid gap-1">
            <p className="font-bold text-base">Streak Reached!</p>
            <p className="text-sm opacity-90">You've hit a {streakDays}-day streak! Keep the fire going! 🔥</p>
        </div>
      </div>
    </>
  );
}
