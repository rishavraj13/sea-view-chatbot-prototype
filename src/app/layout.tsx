import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { SITE_METADATA } from '@/content';
import { ChatProvider } from '@/components/ChatContext';

const displayFont = localFont({
  src: '../../public/fonts/FamiljenGrotesk-Bold.woff2',
  weight: '700',
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = localFont({
  src: '../../public/fonts/InstrumentSans-Regular.woff2',
  weight: '400 700',
  variable: '--font-body',
  display: 'swap',
});

const serifFont = localFont({
  src: '../../public/fonts/InstrumentSerif-Italic.woff2',
  style: 'italic',
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${serifFont.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
