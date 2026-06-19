import './styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: 'Fanta Buzzer',
  description: 'Webapp multiplayer realtime per quiz competitivi con buzzer.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Fanta Buzzer' },
  openGraph: {
    title: 'Fanta Buzzer',
    description: 'Webapp multiplayer realtime per quiz competitivi con buzzer.',
    type: 'website',
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={poppins.className}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
