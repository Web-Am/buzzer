import './styles/globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Fanta Buzzer',
  description: 'Webapp multiplayer realtime per quiz competitivi con buzzer.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
