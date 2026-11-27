"use client";

import Link from "next/link";
import { UserButton } from "@/components/auth/user/user-button";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="size-8" aria-hidden />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/auth/sign-in"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <UserButton
      size="icon"
      align="end"
      hideSettings
      links={[
        {
          href: "/account",
          label: "Account",
          visibility: "authenticated",
        },
      ]}
    />
  );
}
