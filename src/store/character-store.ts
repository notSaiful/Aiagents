
import { create } from 'zustand';

export type Emotion = 
    | 'idle' 
    | 'joy' 
    | 'cheer' 
    | 'pride' 
    | 'surprised' 
    | 'confused' 
    | 'sad' 
    | 'determined' 
    | 'sleepy' 
    | 'encouraging';

interface CharacterState {
  emotion: Emotion;
  setEmotion: (emotion: Emotion, duration?: number) => void;
}

let timeoutId: NodeJS.Timeout | null = null;

export const useCharacterStore = create<CharacterState>((set) => ({
  emotion: 'idle',
  setEmotion: (emotion, duration) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    set({ emotion });

    if (duration) {
      timeoutId = setTimeout(() => {
        set({ emotion: 'idle' });
        timeoutId = null;
      }, duration);
    }
  },
}));
