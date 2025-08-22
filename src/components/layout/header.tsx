
'use client';

import AuthButton from '@/components/auth-button';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user, loading } = useAuth();

  // Don't render header on login pages or while loading
  if (loading || !user) {
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
