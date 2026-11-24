"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

type MainNavProps = {
  className?: string;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
};

export function MainNav({
  className,
  onNavigate,
  orientation = "horizontal",
}: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        orientation === "horizontal"
          ? "hidden items-center gap-8 md:flex"
          : "flex flex-col gap-1",
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "text-sm transition-colors",
              orientation === "vertical" && "rounded-lg px-3 py-2.5",
              isActive
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
              orientation === "vertical" &&
                isActive &&
                "bg-muted text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
