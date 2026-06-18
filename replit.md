# CartivaSho

India's #1 period relief e-commerce store — selling wellness devices, self-care products, nutrition, and kitchen/home accessories.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/cartivashop run dev` — run the frontend (port 20066)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + React Router DOM + Framer Motion + Tailwind CSS
- Backend: Express 5 (API server)
- Auth & DB: Supabase (optional — set env vars to activate)
- Payments: Razorpay (set env vars to activate)

## Where things live

- `artifacts/cartivashop/` — React+Vite frontend
  - `src/data/products.ts` — all product definitions (source of truth)
  - `src/types/index.ts` — TypeScript types
  - `src/context/` — React contexts (Cart, Wishlist, Compare, Auth)
  - `src/components/` — shared UI components
  - `src/pages/` — one file per route
  - `src/lib/supabase.ts` — Supabase client (conditional on env vars)
- `artifacts/api-server/src/routes/payments.ts` — Razorpay order + verify routes

## Architecture decisions

- Products live in a static `products.ts` file (no DB needed for catalog)
- Supabase used only for Auth + contact form + orders — app works fully without it
- Image fallback: `ImageWithFallback` component shows a shopping bag icon when product images 404
- Razorpay payment flow: frontend calls `/api/payments/create-order`, opens Razorpay modal, redirects to `/order-confirmation` on success
- React Router with `basename={import.meta.env.BASE_URL}` for path-based proxy routing

## Product Catalog

10 products across 6 categories:
- **Wellness**: Period Cramp Massager, Heating Pad Belt, TENS Pain Relief Patch
- **Self Care**: Aromatherapy Roll-On, Sleep & Recovery Mask
- **Nutrition**: Comfort Tea Collection
- **Bundles**: Complete Relief Bundle
- **Fitness**: Yoga & Stretch Mat
- **Kitchen & Home**: Electric Milk Frother, CartivaPro 3-in-1 PocketVac ← NEW

## Environment Variables Required

### Frontend (VITE_ prefix = exposed to browser)
- `VITE_SUPABASE_URL` — Supabase project URL (enables auth)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (enables auth)
- `VITE_RAZORPAY_KEY_ID` — Razorpay public key (optional, server returns it)

### API Server
- `RAZORPAY_KEY_ID` — Razorpay key ID
- `RAZORPAY_KEY_SECRET` — Razorpay key secret

## Supabase Tables Needed

Run this in Supabase SQL editor when you add credentials:

```sql
-- User profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  phone text,
  default_address text,
  city text,
  state text,
  pincode text
);

-- Contact form submissions
create table contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  items jsonb,
  total numeric,
  shipping_address text,
  payment_id text,
  status text default 'processing',
  created_at timestamptz default now()
);
```

## Gotchas

- Supabase client is only created when both env vars are set — app works in "demo mode" without them
- The `@tailwindcss/typography` plugin import was removed from index.css to avoid errors (not needed)
- Use `react-router-dom` `useSearchParams` for category filtering (not Next.js)

## User preferences

_Populate as you build._
