
import { Inter } from 'next/font/google';

export const fontSans = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
});

// For consistency, we will use Inter for serif styles as well.
// This simplifies the font loading and ensures a consistent brand feel.
export const fontSerif = Inter({ 
  subsets: ['latin'], 
  variable: '--font-serif',
});

// Playfair is not used and can be removed to reduce load times.
export const fontPlayfair = Inter({
  subsets: ['latin'],
  variable: '--font-playfair',
});
