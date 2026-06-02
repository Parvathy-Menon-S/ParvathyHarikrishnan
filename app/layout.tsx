import type { Metadata, Viewport } from 'next';
import {
  Playfair_Display,
  EB_Garamond,
  DM_Sans,
  Cormorant_Garamond,
  Lato,
  Pinyon_Script,
} from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400'],
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  variable: '--font-pinyon-script',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'You Are Invited',
  description: 'A wedding invitation',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        playfair.variable,
        garamond.variable,
        dmSans.variable,
        cormorant.variable,
        lato.variable,
        pinyonScript.variable,
      ].join(' ')}
    >
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
