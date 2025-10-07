import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F8F2E7',
        midnight: '#111827',
        mint: '#B5F5D1',
        royal: '#355CFF',
        cherry: '#FF4B4B',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
      boxShadow: {
        pixel: '4px 4px 0 #000',
      },
    },
  },
  plugins: [],
};

export default config;
