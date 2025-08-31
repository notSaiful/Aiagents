
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthButton from '@/components/auth-button';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';
import { Trophy, User, BookOpen, Timer, TrendingUp } from 'lucide-react';
import BreakModeDialog from '../break-mode-dialog';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isBreakModeOpen, setIsBreakModeOpen] = useState(false);

  // Don't render header on login/signup pages or pricing page for a cleaner look
  if (pathname === '/login' || pathname === '/login/email' || pathname === '/signup') {
    return null;
  }
  
  // A slightly different header for the pricing page
  if (pathname === '/pricing') {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
             <BookOpen className="h-6 w-6" />
             <span className="font-bold">NotesGPT</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>
    )
  }
  
  return (
     <header className="absolute top-0 z-50 w-full">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
             <BookOpen className="h-6 w-6" />
             <span className="sr-only">NotesGPT Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/pricing">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Pricing
                </Link>
            </Button>
            <BreakModeDialog open={isBreakModeOpen} onOpenChange={setIsBreakModeOpen}>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsBreakModeOpen(true)}
                    className="h-10 w-10"
                >
                    <Timer className="h-5 w-5" />
                    <span className="sr-only">Start Break</span>
                </Button>
            </BreakModeDialog>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>
  );
}
