
'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the AuthButton component with SSR turned off.
// This ensures the component only renders on the client-side, preventing
// hydration mismatches caused by browser extensions modifying the DOM.
const AuthButton = dynamic(() => import('@/components/auth-button'), {
  ssr: false,
  loading: () => <Skeleton className="h-8 w-8 rounded-full" />,
});

export default function Header() {
  const pathname = usePathname();

  // Don't render header on login/signup pages
  if (pathname === '/login' || pathname === '/login/email' || pathname === '/signup') {
    return null;
  }
  
  return (
     <header className="absolute top-0 z-50 w-full">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-end">
          <AuthButton />
        </div>
      </header>
  );
}
