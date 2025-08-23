
'use client';

import { usePathname } from 'next/navigation';
import AuthButton from '@/components/auth-button';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't render header on login/signup pages
  if (pathname === '/login' || pathname === '/login/email' || pathname === '/signup') {
    return null;
  }
  
  return (
     <header className="absolute top-0 z-50 w-full">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center justify-end space-x-2">
            <AuthButton />
          </div>
        </div>
      </header>
  );
}
