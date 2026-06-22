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

type UserAccess = {
  role?: string;
  is_active?: boolean;
  deleted_at?: string | null;
};

async function fetchUserAccess(userId: string): Promise<UserAccess | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const response = await fetch(
    `${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=role,is_active,deleted_at`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return null;
  const rows = (await response.json()) as UserAccess[];
  return rows[0] ?? null;
}

function isActiveUser(access: UserAccess | null) {
  if (!access) return true;
  return access.is_active !== false && !access.deleted_at;
}

function hasAdminRole(access: UserAccess | null) {
  if (!isActiveUser(access)) return false;
  const role = access?.role;
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
    const access = await fetchUserAccess(userId);
    if (!hasAdminRole(access)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isProtectedAccountRoute(request)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
    const access = await fetchUserAccess(userId);
    if (!isActiveUser(access)) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isPublicAuthRoute(request) && userId) {
    const access = await fetchUserAccess(userId);
    if (isActiveUser(access)) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
