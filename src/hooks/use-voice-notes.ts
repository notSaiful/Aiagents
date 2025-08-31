
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Define the shape of the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Define the shape of the SpeechRecognitionEvent
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Define the shape of the SpeechRecognitionErrorEvent
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Augment the window object to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useVoiceNotes() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  useEffect(() => {
    if (!isSupported) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new (SpeechRecognition as any)();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPart;
            } else {
                interimTranscript += transcriptPart;
            }
        }
        // Update with the most current transcript (final or interim)
        setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setError('No speech detected. Please check your microphone.');
        } else if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please enable it in your browser settings.');
        } else {
            setError(`An error occurred: ${event.error}`);
        }
        stopListening();
    };
  
    recognition.onend = () => {
        setIsListening(false);
    };
    
    return () => {
        recognitionRef.current?.stop();
    };

  }, [isSupported, stopListening]);
  
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Could not start voice recognition.");
      }
    }
  };

  return { isListening, transcript, startListening, stopListening, error, isSupported };
}
