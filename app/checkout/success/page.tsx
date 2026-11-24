"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Payment received</CardTitle>
          <CardDescription>
            Thanks for shopping with Asal Glow. Stripe is confirming your order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {sessionId ? (
            <p>
              Session: <span className="font-mono text-foreground">{sessionId}</span>
            </p>
          ) : (
            <p>No session id was returned. If you paid, check your email receipt.</p>
          )}
          <p>
            Final order status is updated by the Stripe webhook in Neon.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/" className={cn(buttonVariants())}>
            Back home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center px-4 py-16">
          <p className="text-sm text-muted-foreground">Loading checkout status…</p>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
