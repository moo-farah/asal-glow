# Asal Glow

Asal Glow is a direct-to-consumer skincare shop. The name comes from *asal* — honey — and the catalog is built around a short, honey-led routine: a daily serum, a clarifying clay mask, and a hydrating moisturizer. The storefront is meant to feel quiet and warm: midnight burgundy, powder white, and amber, set in Fraunces for headings and DM Sans for body text.

The project exists so that catalog, checkout, and order history live in one place. A customer pays through Stripe Checkout. The app records a pending order in Neon before the customer leaves the site, then Stripe’s webhook moves that order to paid, failed, or refunded. Prices stay in the database, so the amount charged is the catalog price, not a value sent from the browser.

## Catalog

Seeded in `db/schema.sql`:

| Product | Slug | Price |
| --- | --- | --- |
| Honey Glow Serum | `honey-glow-serum` | $38 |
| Asal Clay Mask | `asal-clay-mask` | $28 |
| Dew Moisturizer | `dew-moisturizer` | $42 |

Products are active by default. Checkout only sells rows where `active` is true, and every line in one order must share the same currency.

## Tech stack

- **Next.js 16** (App Router) and **React 19**
- **TypeScript**
- **Tailwind CSS 4** with a shadcn/ui theme (`base-nova`), Base UI primitives, and Lucide icons
- **Neon** Postgres through `@neondatabase/serverless`
- **Stripe** Checkout Sessions and signed webhooks

## How checkout works

1. `CheckoutButton` posts `{ items: [{ productId, quantity }] }` to `POST /api/checkout`.
2. The route loads those products from Neon, rejects anything inactive or missing, and inserts an order with status `pending` plus one `order_items` row per line.
3. It creates a Stripe Checkout Session in `payment` mode. Success returns to `/checkout/success`, cancel to `/checkout/cancel`. The order id is stored on the session metadata.
4. `POST /api/webhooks/stripe` verifies the Stripe signature, then updates the order:
   - `checkout.session.completed` → `paid`
   - `payment_intent.payment_failed` → `failed` (only while still `pending`)
   - `charge.refunded` → `refunded` (only if the order was `paid`)

The success page thanks the customer and shows the Checkout session id. The order is not marked paid in the browser. That happens only after the webhook writes to Neon.

## Project layout

```
app/
  layout.tsx                 Site chrome, fonts, and metadata
  page.tsx                   Shop
  components/                Header, desktop nav, mobile nav
  api/checkout/route.ts      Create a pending order and a Checkout Session
  api/webhooks/stripe/       Verify Stripe events and update order status
  checkout/success/          Return URL after payment
  checkout/cancel/           Return URL if the customer leaves Checkout
components/
  checkout-button.tsx        Client button that starts checkout
  ui/                        shadcn/ui components
lib/
  db.ts                      Neon SQL client
  orders.ts                  Products, orders, and status transitions
  stripe.ts                  Stripe client and app URL
db/schema.sql                products, orders, order_items, and seed data
neon.ts                      Neon branch config
```

Navigation also points at `/routines` and `/about`. Those routes are part of the shop information architecture; the commerce path above is what the API implements today.

## Local setup

Requires Node.js 20+, a Neon database, and a Stripe account (test mode is enough).

```bash
npm install
```

Apply `db/schema.sql` to your Neon database, then add the variables below to `.env.local`. Env files are gitignored.

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Neon connection string. On Vercel, use the pooled host. |
| `STRIPE_SECRET_KEY` | Secret key that creates Checkout Sessions. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret that verifies webhook payloads. |
| `NEXT_PUBLIC_APP_URL` | Origin for Stripe success and cancel URLs, with no trailing slash. Defaults to `http://localhost:3000`. |

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Forward Stripe events to the local webhook while developing:

```bash
npm run stripe:listen
```

That listens for `checkout.session.completed`, `payment_intent.payment_failed`, and `charge.refunded`, and prints a `whsec_...` secret. Put that value in `STRIPE_WEBHOOK_SECRET` for local work only. Production needs its own endpoint in the Stripe Dashboard, aimed at `https://<your-domain>/api/webhooks/stripe`, and its own signing secret.

```bash
npm run build
npm run lint
```
