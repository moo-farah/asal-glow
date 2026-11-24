import Link from "next/link";
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

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Checkout canceled</CardTitle>
          <CardDescription>
            No charge was made. You can return and try again whenever you are ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your cart items are still available in the store.
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
