
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Timer, X, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BreakModeDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export default function BreakModeDialog({ children, open, onOpenChange }: BreakModeDialogProps) {
  const [timeLeft, setTimeLeft] = useState(FIVE_MINUTES_IN_SECONDS);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Client-side only initialization for Audio
    if (typeof window !== 'undefined') {
        const audio = new Audio('/background-music.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;
    }

    return () => {
        // Cleanup on unmount
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (open && !isBreakActive) {
        startBreak();
    } else if (!open && isBreakActive) {
        endBreak(false); // End break if dialog is closed externally
    }
  }, [open, isBreakActive]);


  useEffect(() => {
    if (!isBreakActive) return;

    if (isMusicPlaying) {
      audioRef.current?.play().catch(error => {
        console.warn('Music autoplay was blocked.', error);
        toast({
          title: "Music blocked",
          description: "Your browser prevented audio from playing automatically.",
          variant: "destructive"
        });
        setIsMusicPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isMusicPlaying, isBreakActive, toast]);


  const startBreak = () => {
    setIsBreakActive(true);
    setIsMusicPlaying(true);
    setTimeLeft(FIVE_MINUTES_IN_SECONDS);

    timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
                endBreak(true);
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);
  };

  const endBreak = (completed: boolean) => {
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }

    audioRef.current?.pause();
    setIsBreakActive(false);
    onOpenChange(false); // Close the dialog
    
    if (completed) {
        toast({
            title: "Break Over!",
            description: "Time to get back to your notes. You've got this!",
        });
    }
  };
  
  const toggleMusic = () => {
    setIsMusicPlaying(prev => !prev);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto bg-primary/20 rounded-full p-4 w-fit">
            <Timer className="w-10 h-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold font-serif pt-2">
            Break Time
          </DialogTitle>
          <DialogDescription>
            Relax and recharge your mind.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-8">
            <p className="text-6xl font-bold font-mono tracking-tighter">
                {formatTime(timeLeft)}
            </p>
        </div>

        <DialogFooter className="flex-row sm:justify-center justify-center gap-2">
           <Button type="button" variant="outline" size="icon" onClick={toggleMusic}>
                {isMusicPlaying ? <Volume2 /> : <VolumeX />}
                <span className="sr-only">Toggle Music</span>
          </Button>
          <Button type="button" variant="secondary" onClick={() => endBreak(false)}>
            <X className="mr-2 h-4 w-4" />
            End Break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
