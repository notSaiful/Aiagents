import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', inter.variable)} suppressHydrationWarning>
        <AuthProvider>
            <Header />
            <main>{children}</main>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
