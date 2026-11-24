"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  productId: string;
  quantity?: number;
  email?: string;
  label?: string;
};

export function CheckoutButton({
  productId,
  quantity = 1,
  email,
  label = "Buy with Stripe",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: [{ productId, quantity }],
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={loading} onClick={startCheckout}>
        {loading ? "Redirecting…" : label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
