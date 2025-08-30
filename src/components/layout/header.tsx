
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthButton from '@/components/auth-button';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';
import { Trophy, UserCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  // Don't render header on login/signup pages
  if (pathname === '/login' || pathname === '/login/email' || pathname === '/signup') {
    return null;
  }
  
  return (
     <header className="absolute top-0 z-50 w-full">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-end gap-4">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </>
                </Link>
            </Button>
          </nav>
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>
  );
}
