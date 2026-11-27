import { viewPaths } from "@better-auth-ui/core";
import { notFound } from "next/navigation";
import { Auth } from "@/components/auth/auth";

const validAuthPaths = new Set(
  Object.values(viewPaths.auth).filter(
    (path): path is string => typeof path === "string",
  ),
);

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (!validAuthPaths.has(path)) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16">
      <Auth path={path} />
    </main>
  );
}
