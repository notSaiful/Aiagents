import AuthButton from '@/components/auth-button';

export default function Header() {
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
