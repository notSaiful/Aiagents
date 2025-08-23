
'use client';

import { usePathname } from 'next/navigation';
import AuthButton from '@/components/auth-button';

export default function Header() {
  const pathname = usePathname();

  // Don't render header on login/signup pages
  if (pathname === '/login' || pathname === '/login/email' || pathname === '/signup') {
    return null;
  }
  
  return (
     <header className="absolute top-0 z-50 w-full" suppressHydrationWarning>
        <div className="container flex h-16 max-w-screen-2xl items-center justify-end">
          <AuthButton />
        </div>
      </header>
  );
}
