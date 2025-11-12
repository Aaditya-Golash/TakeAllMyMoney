import './globals.css';
import { Press_Start_2P } from 'next/font/google';

const arcade = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-arcade' });

export const metadata = { title: 'Take All My Money', description: 'Throw money. Get nothing. Climb the board.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={arcade.variable}>
      <body className="min-h-screen bg-cream text-ink">
        <div className="bg-grid">
          <header className="max-w-3xl mx-auto px-6 pt-10 pb-4">
            <div className="flex items-center gap-3">
              <TopHat />
              <h1 className="font-arcade text-2xl sm:text-3xl">Take All My Money</h1>
              <Dice />
            </div>
            <p className="mt-3 opacity-80">No prizes. No refunds.</p>
          </header>
          <main className="max-w-3xl mx-auto px-6 pb-24">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}

function TopHat() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" className="fill-ink">
      <rect x="2" y="14" width="24" height="6" />
      <rect x="6" y="4" width="16" height="10" />
      <rect x="8" y="2" width="12" height="2" />
    </svg>
  );
}
function Dice() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="fill-ink">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.5" className="fill-cream" />
      <circle cx="15" cy="15" r="1.5" className="fill-cream" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-cream/80">
      <div className="max-w-3xl mx-auto px-6 py-6 text-xs leading-relaxed opacity-80">
        <strong>Disclaimer:</strong> You are purchasing a brief, digital on-site effect and a public receipt. There is
        <em> no prize, chance, or utility</em>. Payments are <em>non-refundable</em> except for accidental duplicates or confirmed fraud. 18+ only. Messages are public and moderated.
        Payments processed by Stripe. See <a className="underline" href="/terms">Terms</a> and <a className="underline" href="/privacy">Privacy</a>.
      </div>
    </footer>
  );
}
