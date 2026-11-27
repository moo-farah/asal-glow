import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
  publicRoutes: [
    "/",
    "/about",
    "/routines",
    "/checkout",
    "/api/checkout",
    "/api/webhooks",
  ],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
