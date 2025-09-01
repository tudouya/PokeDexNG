import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const fontVariables = cn(fontSans.variable);
