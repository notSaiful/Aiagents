import { Inter } from 'next/font/google';

export const fontSans = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
});

export const fontSerif = Inter({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] 
});

export const fontPlayfair = Inter({
  subsets: ['latin'],
  variable: '--font-playfair',
});
