import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { fontSans, fontSerif, fontPlayfair } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'NotesGPT | Transform Your Notes Instantly',
  description: 'Paste your notes and instantly get aesthetic summaries, flashcards, and mind maps. Powered by Gemini.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-sans antialiased', 
          fontSans.variable, 
          fontSerif.variable, 
          fontPlayfair.variable
        )}
      >
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
