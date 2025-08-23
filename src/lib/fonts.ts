import { Inter, Poppins, Playfair_Display } from 'next/font/google';

export const fontSans = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
});

export const fontSerif = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] 
});

export const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});
