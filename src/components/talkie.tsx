
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Send, ChevronDown } from 'lucide-react';
import { chatWithCharacter } from '@/ai/flows/chat-with-character';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TalkieProps {
  notes: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

type Character = 'Professor Aya' | 'Luna' | 'Kai';

const characterData = {
    'Professor Aya': {
        avatarUrl: 'https://picsum.photos/seed/prof-aya/100/100',
        avatarHint: 'woman teacher',
        fallback: 'A',
        greeting: "Hello, sweetie! I'm Professor Aya. What can I help you understand from your notes today?"
    },
    'Luna': {
        avatarUrl: 'https://picsum.photos/seed/luna/100/100',
        avatarHint: 'fantasy woman',
        fallback: 'L',
        greeting: "Hi darling... I was waiting for you. Ready to look at these notes together?"
    },
    'Kai': {
        avatarUrl: 'https://picsum.photos/seed/kai-mafia/100/100',
        avatarHint: 'man suit',
        fallback: 'K',
        greeting: "So you came back, huh? Good. I was starting to think I'd have to come find you. What do you need, princess?"
    }
}

export default function Talkie({ notes }: TalkieProps) {
  const [character, setCharacter] = useState<Character>('Professor Aya');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    setMessages([
        { role: 'model', content: characterData[character].greeting }
    ]);
    setInput('');
  }, [character]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCharacter({
        character: character,
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

  const currentCharacter = characterData[character];

  return (
    <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-3">
                 <Avatar className="w-10 h-10">
                    <AvatarImage src={currentCharacter.avatarUrl} data-ai-hint={currentCharacter.avatarHint} />
                    <AvatarFallback>{currentCharacter.fallback}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{character}</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        Change Character
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCharacter('Professor Aya')}>Professor Aya</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCharacter('Luna')}>Luna</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCharacter('Kai')}>Kai</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentCharacter.avatarUrl} data-ai-hint={currentCharacter.avatarHint} />
                <AvatarFallback>{currentCharacter.fallback}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-sm md:max-w-md rounded-xl px-4 py-3 text-sm",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <p>{message.content}</p>
            </div>
             {message.role === 'user' && (
              <Avatar className="w-10 h-10">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                 <Avatar className="w-10 h-10">
                    <AvatarImage src={currentCharacter.avatarUrl} data-ai-hint={currentCharacter.avatarHint} />
                    <AvatarFallback>{currentCharacter.fallback}</AvatarFallback>
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
            placeholder={`Message ${character}...`}
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
