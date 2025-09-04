
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ProgressState {
  value: number; // 0-100
  label: string;
}

interface ProgressItem {
  id: string;
  state: ProgressState;
}

interface ProgressContextType {
  progresses: ProgressItem[];
  startProgress: (id: string, initialState: ProgressState) => void;
  setProgress: (id: string, newState: ProgressState) => void;
  finishProgress: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progresses, setProgresses] = useState<ProgressItem[]>([]);

  const startProgress = useCallback((id: string, initialState: ProgressState) => {
    setProgresses((prev) => [...prev, { id, state: initialState }]);
  }, []);

  const setProgress = useCallback((id: string, newState: ProgressState) => {
    setProgresses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, state: newState } : p))
    );
  }, []);

  const finishProgress = useCallback((id: string) => {
    // Add a small delay before removing to allow for exit animations
    setTimeout(() => {
        setProgresses((prev) => prev.filter((p) => p.id !== id));
    }, 500)
  }, []);

  const value = { progresses, startProgress, setProgress, finishProgress };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
