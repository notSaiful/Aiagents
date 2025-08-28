
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Send } from 'lucide-react';
import { chatWithCharacter } from '@/ai/flows/chat-with-character';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TalkieProps {
  notes: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const CHARACTER_NAME = "Professor Aya";

export default function Talkie({ notes }: TalkieProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Set initial greeting from Professor Aya
  useEffect(() => {
    setMessages([
        { role: 'model', content: "Hello, sweetie! I'm Professor Aya. What can I help you understand from your notes today?" }
    ])
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCharacter({
        character: CHARACTER_NAME,
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
       // Restore user message to input if AI fails
       setMessages(prev => prev.slice(0, -1));
       setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
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
                <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="woman teacher" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-sm md:max-w-md rounded-xl px-4 py-3 text-base md:text-sm",
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
                    <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="woman teacher" />
                    <AvatarFallback>A</AvatarFallback>
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
            placeholder={`Message ${CHARACTER_NAME}...`}
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
