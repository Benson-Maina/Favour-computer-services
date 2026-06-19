# Favour Computer Services

Production-ready Next.js 15 electronics e-commerce site for Favour Computer Services in Nairobi, Kenya.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS and shadcn-style UI primitives
- Supabase Auth, Storage, PostgreSQL, Row Level Security
- Server Components and Server Actions
- SEO routes for `sitemap.xml` and `robots.txt`
- Vercel deployment config

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for business and payment settings only.
4. Run `supabase/cleanup.sql` only when you intentionally want to empty development records.
5. Use the storage buckets created by `schema.sql`, especially `products` and `payments`.
6. Add `.env.local` values from Supabase project settings.

## Deployment

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy.

No card payments are integrated. Checkout shows Paybill instructions and accepts payment confirmation uploads for admin verification.
