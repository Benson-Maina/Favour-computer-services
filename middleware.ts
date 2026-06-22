import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedAccountRoute = createRouteMatcher([
  "/account",
  "/account/orders(.*)",
  "/account/bookings(.*)",
  "/account/security(.*)"
]);
const isPublicAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/account/login(.*)",
  "/account/register(.*)",
  "/account/reset-password(.*)"
]);

async function hasAdminRole(userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const response = await fetch(
    `${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=role`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ role?: string }>;
  const role = rows[0]?.role;
  return role === "super_admin" || role === "admin" || role === "staff";
}

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (isAdminRoute(request)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
    if (!(await hasAdminRole(userId))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isProtectedAccountRoute(request) && !userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isPublicAuthRoute(request) && userId) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
