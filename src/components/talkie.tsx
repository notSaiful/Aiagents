'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Send, ChevronLeft } from 'lucide-react';
import { chatWithCharacter } from '@/ai/flows/chat-with-character';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TalkieProps {
  notes: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

type Character = 'Professor Aya' | 'Mischievous Luna' | 'Mr. Haque' | 'Meme Bro';

const characterData = {
    'Professor Aya': {
        avatarUrl: '/aya.png',
        fallback: 'A',
        description: 'A caring and knowledgeable mentor.',
        greeting: "Hello. I'm Professor Aya. How can I assist with your studies today?"
    },
    'Mischievous Luna': {
        avatarUrl: '/luna.png',
        fallback: 'L',
        description: 'A playful and loving companion who helps you study.',
        greeting: "Hi there! I'm Luna. Ready to make learning fun together?"
    },
    'Mr. Haque': {
        avatarUrl: '/Mr. haque.png',
        fallback: 'H',
        description: 'A confident and protective tutor with a soft spot for you.',
        greeting: "You're here. Good. I'm Mr. Haque. Let's get straight to the point, what do you need?"
    },
    'Meme Bro': {
        avatarUrl: '/meme-bro.png',
        fallback: 'M',
        description: 'Your chaotic best friend who turns studying into a meme.',
        greeting: "Wassup, fam! It's your boy, Meme Bro. Let's cook up some knowledge. 🔥"
    }
}

export default function Talkie({ notes }: TalkieProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (selectedCharacter) {
        setMessages([
            { role: 'model', content: characterData[selectedCharacter].greeting }
        ]);
        setInput('');
    }
  }, [selectedCharacter]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCharacter) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCharacter({
        character: selectedCharacter,
        message: input,
        notes: notes,
        chatHistory: messages,
      });
      
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Character chat failed:', error);
      toast({
        title: 'Chat Error',
        description: 'I seem to be at a loss for words. Please try again.',
        variant: 'destructive',
      });
       setMessages(prev => prev.slice(0, prev.length -1));
       setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedCharacter) {
    return (
        <div className="h-[500px] flex flex-col">
            <CardHeader className="text-center">
                <CardTitle>Choose a Character</CardTitle>
                <CardDescription>Select a character to start your study session.</CardDescription>
            </CardHeader>
            <div className="flex-1 grid grid-cols-2 gap-4 p-4">
                {(Object.keys(characterData) as Character[]).map((charKey) => {
                    const character = charKey;
                    const data = characterData[character];
                    return (
                        <button
                            key={character}
                            onClick={() => setSelectedCharacter(character)}
                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted transition-colors text-center"
                        >
                             <Avatar className="w-16 h-16 mb-2">
                                <AvatarImage src={data.avatarUrl} alt={character} />
                                <AvatarFallback>{data.fallback}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{character}</p>
                            <p className="text-xs text-muted-foreground mt-1">{data.description}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
  }

  const currentCharacterData = characterData[selectedCharacter];

  return (
    <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between border-b p-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCharacter(null)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <div className="flex items-center gap-3">
                 <span className="font-semibold">{selectedCharacter}</span>
                 <Avatar className="w-8 h-8">
                    <AvatarImage src={currentCharacterData.avatarUrl} alt={selectedCharacter} />
                    <AvatarFallback>{currentCharacterData.fallback}</AvatarFallback>
                </Avatar>
            </div>
        </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'model' && (
              <>
                <Avatar className="w-10 h-10">
                    <AvatarImage src={currentCharacterData.avatarUrl} alt={selectedCharacter} />
                    <AvatarFallback>{currentCharacterData.fallback}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-sm md:max-w-md rounded-xl px-4 py-3 text-sm",
                    'bg-muted text-muted-foreground'
                  )}
                >
                  <p>{message.content}</p>
                </div>
              </>
            )}
            {message.role === 'user' && (
              <>
                <div
                  className={cn(
                    "max-w-sm md:max-w-md rounded-xl px-4 py-3 text-sm",
                    'bg-primary text-primary-foreground'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                 <Avatar className="w-10 h-10">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={currentCharacterData.avatarUrl} alt={selectedCharacter} />
                    <AvatarFallback>{currentCharacterData.fallback}</AvatarFallback>
                </Avatar>
                <div className="max-w-sm md:max-w-md rounded-xl px-4 py-3 bg-muted text-muted-foreground">
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${selectedCharacter}...`}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <LoaderCircle className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
}
