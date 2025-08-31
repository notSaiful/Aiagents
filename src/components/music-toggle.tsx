
'use client';

import { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize Audio on the client side only
    const audio = new Audio('/background-music.mp3');
    audio.loop = true;
    audio.volume = 0.2;
    audioRef.current = audio;

    try {
        const savedPreference = localStorage.getItem('music-preference');
        if (savedPreference === 'on') {
            setIsPlaying(true);
        }
    } catch (error) {
        console.error("Could not access local storage:", error);
    }

    return () => {
      // Cleanup audio element on component unmount
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Don't run this effect on initial server render

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(error => {
        // Autoplay is often blocked by browsers.
        // We can inform the user but not force it.
        console.warn('Music autoplay was blocked by the browser.', error);
        setIsPlaying(false);
        toast({
            title: "Music blocked",
            description: "Click the music icon to start the background music.",
            duration: 5000,
        });
      });
      try {
        localStorage.setItem('music-preference', 'on');
      } catch (error) {
        console.error("Could not access local storage:", error);
      }
    } else {
      audio.pause();
      try {
        localStorage.setItem('music-preference', 'off');
      } catch (error) {
        console.error("Could not access local storage:", error);
      }
    }
  }, [isPlaying, isMounted, toast]);

  const toggleMusic = () => {
    if (!isMounted) return;
    setIsPlaying(prev => !prev);
  };
  
  if (!isMounted) {
    // Render a placeholder or nothing on the server
    return <Button variant="outline" size="icon" disabled className="bg-transparent border-0" />;
  }

  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={toggleMusic}
      className={cn(
        'transition-all duration-300',
        isPlaying && 'text-accent-foreground animate-pulse'
      )}
    >
      <Music className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle Music</span>
    </Button>
  );
}
