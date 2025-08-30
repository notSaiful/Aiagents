
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { fontSans, fontSerif, fontPlayfair } from '@/lib/fonts';
import Footer from '@/components/layout/footer';
import PageTransition from '@/components/page-transition';
import { ThemeProvider } from '@/components/theme-provider';

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
    // The suppressHydrationWarning prop is added to the <html> tag to prevent
    // React from throwing errors when browser extensions (like Grammarly) inject
    // attributes into the DOM. This is the recommended, production-safe way to
    // handle these specific, unavoidable hydration mismatches.
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <body 
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col', 
          fontSans.variable, 
          fontSerif.variable, 
          fontPlayfair.variable
        )}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex-grow">
              <Header />
              <main><PageTransition>{children}</PageTransition></main>
            </div>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
