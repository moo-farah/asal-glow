import { sql } from "@/lib/db";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  active: boolean;
};

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export type OrderRow = {
  id: string;
  status: string;
  amount_total: number;
  currency: string;
  email: string | null;
  stripe_checkout_session_id: string | null;
};

export async function getActiveProductsByIds(ids: string[]) {
  if (ids.length === 0) return [] as Product[];

  const rows = await sql`
    SELECT id, slug, name, description, price_cents, currency, image_url, active
    FROM products
    WHERE active = true
      AND id = ANY(${ids}::uuid[])
  `;

  return rows as Product[];
}

export async function createPendingOrder(params: {
  email?: string;
  userId?: string;
  currency: string;
  amountTotal: number;
  items: Array<{
    productId: string;
    name: string;
    unitAmount: number;
    quantity: number;
  }>;
}) {
  const { email, userId, currency, amountTotal, items } = params;

  const [order] = (await sql`
    INSERT INTO orders (user_id, email, status, amount_total, currency)
    VALUES (${userId ?? null}, ${email ?? null}, 'pending', ${amountTotal}, ${currency})
    RETURNING id, status, amount_total, currency, email, stripe_checkout_session_id
  `) as OrderRow[];

  await sql.transaction(
    items.map(
      (item) => sql`
        INSERT INTO order_items (order_id, product_id, name, unit_amount, quantity)
        VALUES (
          ${order.id}::uuid,
          ${item.productId}::uuid,
          ${item.name},
          ${item.unitAmount},
          ${item.quantity}
        )
      `,
    ),
  );

  return order;
}

export async function attachCheckoutSession(
  orderId: string,
  sessionId: string,
) {
  await sql`
    UPDATE orders
    SET stripe_checkout_session_id = ${sessionId},
        updated_at = now()
    WHERE id = ${orderId}::uuid
  `;
}

export async function markOrderPaid(params: {
  sessionId: string;
  paymentIntentId?: string | null;
}) {
  const { sessionId, paymentIntentId } = params;

  const rows = (await sql`
    UPDATE orders
    SET status = 'paid',
        stripe_payment_intent_id = COALESCE(${paymentIntentId ?? null}, stripe_payment_intent_id),
        updated_at = now()
    WHERE stripe_checkout_session_id = ${sessionId}
      AND status <> 'paid'
    RETURNING id, status
  `) as Array<{ id: string; status: string }>;

  return rows[0] ?? null;
}

export async function markOrderFailedByPaymentIntent(paymentIntentId: string) {
  await sql`
    UPDATE orders
    SET status = 'failed',
        updated_at = now()
    WHERE stripe_payment_intent_id = ${paymentIntentId}
      AND status = 'pending'
  `;
}

export async function markOrderRefundedByPaymentIntent(paymentIntentId: string) {
  await sql`
    UPDATE orders
    SET status = 'refunded',
        updated_at = now()
    WHERE stripe_payment_intent_id = ${paymentIntentId}
      AND status = 'paid'
  `;
}

export async function getOrderByCheckoutSession(sessionId: string) {
  const rows = (await sql`
    SELECT id, status, amount_total, currency, email, stripe_checkout_session_id
    FROM orders
    WHERE stripe_checkout_session_id = ${sessionId}
    LIMIT 1
  `) as OrderRow[];

  return rows[0] ?? null;
}
