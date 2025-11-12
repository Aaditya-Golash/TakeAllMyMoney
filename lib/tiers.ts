export type Tier = {
  // Keeping our type compatible with the external repo
  name: string;
  min: number;
  max: number;
  color: string;     // text color class (from pocket-splash-ui)
  bgColor: string;   // background class (from pocket-splash-ui)
  animation: string; // optional animation class
  // Back-compat aliases used elsewhere in this repo
  colorClass?: string;
  bgClass?: string;
};

// Copied to match pocket-splash-ui tiers and ranges
const TIERS: Tier[] = [
  { name: 'Broke-boy',        min: 2,     max: 24.99,   color: 'text-gray-500',   bgColor: 'bg-gray-100',                                            animation: 'animate-shake' },
  { name: 'Mid-spender',      min: 25,    max: 99.99,   color: 'text-teal-600',   bgColor: 'bg-teal-50',                                            animation: 'animate-slide-in-right' },
  { name: 'Tryna Flex',       min: 100,   max: 499.99,  color: 'text-yellow-600', bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',         animation: 'animate-spin-slow' },
  { name: 'Rich AF',          min: 500,   max: 9999.99, color: 'text-pink-600',   bgColor: 'bg-pink-50',                                            animation: 'animate-pulse-glow' },
  { name: 'Old-Money Energy', min: 10000, max: 24999.99,color: 'text-green-700',  bgColor: 'bg-green-50',                                           animation: 'animate-zoom-slow' },
  { name: 'The Black Pill',   min: 25000, max: 39999.99,color: 'text-blue-900',   bgColor: 'bg-gradient-to-r from-slate-900 to-blue-900 text-white',animation: 'animate-whale-dive' },
  { name: 'Reality Shattered',min: 40000, max: 59999.99,color: 'text-purple-200', bgColor: 'bg-gradient-to-r from-purple-900 to-black text-white',  animation: 'animate-glitch' },
  { name: 'Truth Seeker',     min: 60000, max: 79999.99,color: 'text-green-200',  bgColor: 'bg-gradient-to-r from-black to-green-900 text-white',   animation: 'animate-matrix' },
  { name: 'Fully Awakened',   min: 80000, max: 99999.99,color: 'text-purple-200', bgColor: 'bg-gradient-to-r from-indigo-950 via-purple-950 to-black text-white', animation: 'animate-cosmic' },
  { name: 'Beyond Comprehension', min: 100000, max: 1000000, color: 'text-purple-600', bgColor: 'bg-gradient-to-r from-purple-100 to-indigo-100', animation: 'animate-stars' },
].map(t => ({ ...t, colorClass: t.color, bgClass: t.bgColor }));

export const TIER_STARTING_AMOUNTS = [2, 25, 100, 500, 10000, 25000, 40000, 60000, 80000, 100000];

// Secret tiers (numbers hidden within amount). We’ll include names/colors but not emojis.
const SECRET_TIERS: Record<string, Tier> = {
  '69':   { name: 'm word pass', min: 0, max: 0, color: 'text-pink-600 font-bold',  bgColor: 'bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 border-4 border-pink-600', animation: 'animate-rainbow-glow' },
  '420':  { name: 'r word pass', min: 0, max: 0, color: 'text-green-600 font-bold', bgColor: 'bg-gradient-to-r from-green-200 via-green-400 to-green-200 border-4 border-green-600', animation: 'animate-rainbow-glow' },
  '666':  { name: 'f word pass', min: 0, max: 0, color: 'text-red-600 font-bold',   bgColor: 'bg-gradient-to-r from-red-300 via-red-500 to-red-300 border-4 border-red-700', animation: 'animate-rainbow-glow' },
  '6767': { name: 'n word pass', min: 0, max: 0, color: 'text-white font-bold',     bgColor: 'bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 text-white border-4 border-yellow-400', animation: 'animate-rainbow-glow' },
};

function getSecretTier(amount: number): Tier | null {
  const s = String(amount);
  if (SECRET_TIERS[s]) return SECRET_TIERS[s];
  for (const k of Object.keys(SECRET_TIERS)) {
    if (s.includes(k)) return SECRET_TIERS[k];
  }
  return null;
}

export function getTierForAmount(amountUsd: number): Tier | null {
  if (!Number.isFinite(amountUsd)) return null;
  const secret = getSecretTier(Math.floor(amountUsd));
  if (secret) return secret;
  return TIERS.find(t => amountUsd >= t.min && amountUsd <= t.max) || null;
}
