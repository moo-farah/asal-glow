import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/server";

async function AccountDetails() {
  await connection();

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { user } = session;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your account</CardTitle>
        <CardDescription>
          Signed in to Asal Glow. Orders will show up here once checkout is
          tied to this account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Name</span>
          <br />
          {user.name}
        </p>
        <p>
          <span className="text-muted-foreground">Email</span>
          <br />
          {user.email}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center px-4 py-16">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading account…</p>
        }
      >
        <AccountDetails />
      </Suspense>
    </main>
  );
}
