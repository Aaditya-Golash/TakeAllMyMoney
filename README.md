# Take All My Money

A retro-styled web app where people gleefully torch their cash to climb a public leaderboard. No rewards. No refunds. Just bragging rights.

> **Not gambling.** There is no chance, no prizes, only intentional gratuity.

## Stack

- [Next.js 14 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe Checkout](https://stripe.com/checkout)
- Deploy on [Vercel](https://vercel.com/)

## Screenshots

_Add screenshots of the landing page and leaderboard here._

## Getting Started

```bash
pnpm install
cp .env.example .env.local
# Fill in .env.local with your credentials
pnpm dev
```

Visit `http://localhost:3000` to start burning money.

### npm registry troubleshooting

If `pnpm install` fails with a 403 from the npm registry, try the following fixes in order:

1. Explicitly point pnpm at the public registry:

   ```bash
   pnpm config set registry https://registry.npmjs.org/
   pnpm install
   ```

2. Remove any corporate or scoped registry overrides that require auth:

   ```bash
   rm -f .npmrc
   npm config delete registry
   pnpm config delete registry
   pnpm install
   ```

3. As a fallback, install dependencies with `npm install` or try an alternative like Bun (`bun install`).

4. When everything else fails, build and run the app inside Docker using the provided `Dockerfile` pattern from the Stripe docs.

## Environment Variables

See [`.env.example`](./.env.example) for the full list of required values.
No database required; the leaderboard aggregates directly from Stripe.

## Stripe Setup

1. Create a Stripe account and switch to **Test mode**.
2. Create a [test API key pair](https://dashboard.stripe.com/test/apikeys) and copy the secret key into `STRIPE_SECRET_KEY`.
3. Webhooks are optional. The app computes the leaderboard by reading successful PaymentIntents from the Stripe API.
   If you do add webhooks later, you can handle them in a custom endpoint.
4. Mirror your Stripe env vars in your Vercel project settings when you deploy.

## Deployment

- Set environment variables in Vercel (Site URL, Stripe secret key).
- Deploy via `vercel` or GitHub integration.

## Legal & Safety

This project is gratuity-only. Users are paying voluntarily for nothing of monetary value in return. No refunds except in cases of fraud or Stripe disputes.

## Commands

- `pnpm dev` – run locally with hot reload.
- `pnpm build` – build for production.
- `pnpm start` – start the production server.
- `pnpm lint` – run ESLint.

## Acceptance Checklist

- Landing page shows amount chips, handle/message inputs, and the big “Throw $X” button.
- Clicking the CTA starts a Stripe Checkout session for the selected amount.
- Completing a payment redirects to `/success`.
- Leaderboard embedded on the homepage, updates for 24h, 7d, and all-time periods, computed from Stripe.
