
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Send, MessageSquare, X, Sparkles } from 'lucide-react';
import { supportChat } from '@/ai/flows/support-chat';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function SupportChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm Notey, your AI assistant for NotesGPT. How can I help you today? ✨",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!user) {
    return null;
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await supportChat({
        message: input,
        chatHistory: messages,
      });
      
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Support chat failed:', error);
      toast({
        title: 'Chat Error',
        description: 'I seem to be having trouble connecting. Please try again in a moment.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, prev.length -1));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-6 z-50">
         <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
         >
            <Button
                size="icon"
                className="w-16 h-16 rounded-full shadow-2xl bg-accent hover:bg-accent/90"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                <span className="sr-only">Toggle Support Chat</span>
            </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
           <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
            className="fixed bottom-28 right-6 z-40 w-[calc(100%-3rem)] max-w-sm"
          >
            <Card className="h-[500px] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/50 border-b text-center">
                    <CardTitle className="flex items-center justify-center gap-2 font-serif">
                        <Sparkles className="w-6 h-6 text-primary"/>
                        Notey Support
                    </CardTitle>
                    <CardDescription>Your friendly NotesGPT assistant</CardDescription>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        "flex items-start gap-3 text-sm",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'model' && (
                            <Avatar className="w-8 h-8 border-2 border-primary/50">
                                <AvatarFallback><Sparkles /></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                                "max-w-xs rounded-xl px-3 py-2",
                                message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted text-muted-foreground rounded-bl-none'
                            )}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="w-8 h-8 border-2 border-primary/50">
                                <AvatarFallback><Sparkles /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-xs rounded-xl px-3 py-2 bg-muted text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-3 bg-muted/50">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about features..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
