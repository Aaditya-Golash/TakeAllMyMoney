import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Take All My Money',
  description: 'Throw money. No prizes. No refunds. Climb the leaderboard.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment font-sans text-black">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
