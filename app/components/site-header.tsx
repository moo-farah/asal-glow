import Link from "next/link";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "./account-menu";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
          <Link
            href="/"
            className="font-heading text-lg tracking-tight text-foreground md:text-xl"
          >
            Asal Glow
          </Link>
        </div>

        <Suspense fallback={null}>
          <MainNav />
        </Suspense>

        <div className="flex items-center gap-1">
          <Suspense fallback={<div className="size-8" aria-hidden />}>
            <AccountMenu />
          </Suspense>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            className="relative"
          >
            <ShoppingBag className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
