import { NextResponse } from "next/server";
import {
  attachCheckoutSession,
  createPendingOrder,
  getActiveProductsByIds,
  type CheckoutItemInput,
} from "@/lib/orders";
import { getAppUrl, stripe } from "@/lib/stripe";

type CheckoutBody = {
  items?: CheckoutItemInput[];
  email?: string;
  userId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const items = body.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Add at least one product to checkout." },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { error: "Each item needs a productId and quantity >= 1." },
          { status: 400 },
        );
      }
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await getActiveProductsByIds(productIds);

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 },
      );
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        productId: product.id,
        name: product.name,
        unitAmount: product.price_cents,
        quantity: item.quantity,
        currency: product.currency,
      };
    });

    const currency = lineItems[0]?.currency ?? "usd";
    if (lineItems.some((item) => item.currency !== currency)) {
      return NextResponse.json(
        { error: "All products must share the same currency." },
        { status: 400 },
      );
    }

    const amountTotal = lineItems.reduce(
      (sum, item) => sum + item.unitAmount * item.quantity,
      0,
    );

    const order = await createPendingOrder({
      email: body.email,
      userId: body.userId,
      currency,
      amountTotal,
      items: lineItems,
    });

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      line_items: lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: item.currency,
          unit_amount: item.unitAmount,
          product_data: {
            name: item.name,
          },
        },
      })),
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        orderId: order.id,
        ...(body.userId ? { userId: body.userId } : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    await attachCheckoutSession(order.id, session.id);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout." },
      { status: 500 },
    );
  }
}
