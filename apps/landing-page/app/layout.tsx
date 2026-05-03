import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Open Design — Designing intelligence with skills, taste, and code.',
  description:
    'Open Design is the open-source alternative to Claude Design. 12 coding-agent CLIs · 31 composable skills · 72 brand-grade design systems. Local-first, web-deployable, BYOK at every layer.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Atelier Zero paper canvas; matches `--paper` in globals.css.
  themeColor: '#efe7d2',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
