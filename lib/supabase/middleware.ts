import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      console.error("Supabase environment variables not configured");
      return response;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });

    // Refresh the session
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    // Check admin access for protected routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (error || !user) {
        console.warn("Unauthorized admin access attempt - no user session");
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Verify user has admin role
      if (process.env.NODE_ENV !== "production") {
        // In development, check ADMIN_BOOTSTRAP_ROLE env variable
        const bootstrapRole = process.env.ADMIN_BOOTSTRAP_ROLE;
        if (bootstrapRole !== "super_admin" && bootstrapRole !== "admin") {
          console.warn(`Unauthorized admin access - invalid bootstrap role: ${bootstrapRole}`);
          return NextResponse.redirect(new URL("/", request.url));
        }
      } else {
        // In production, check user profile role from Supabase
        try {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profileError || !profile) {
            console.warn("Unauthorized admin access - no user profile found");
            return NextResponse.redirect(new URL("/", request.url));
          }

          const validRoles = ["super_admin", "admin"];
          if (!validRoles.includes(profile.role)) {
            console.warn(`Unauthorized admin access - invalid role: ${profile.role}`);
            return NextResponse.redirect(new URL("/", request.url));
          }
        } catch (err) {
          console.error("Error checking admin role:", err);
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    // In case of error, allow the request to continue
    // but prevent access to admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
}
