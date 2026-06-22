import type { AdminRole, Permission } from "@/lib/admin-permissions";
import { hasPermission } from "@/lib/admin-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export type { AdminRole, Permission };
export { hasPermission, rolePermissions } from "@/lib/admin-permissions";

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const adminSupabase = createAdminClient();
  if (!adminSupabase) return null;

  const { data: profile } = await adminSupabase.from("users").select("role").eq("id", userId).maybeSingle();
  const role = profile?.role;
  return role === "super_admin" || role === "admin" || role === "staff" ? role : null;
}

export async function requirePermission(permission: Permission) {
  const role = await getCurrentAdminRole();
  if (!role || !hasPermission(role, permission)) {
    throw new Error("You do not have permission to perform this admin action.");
  }
  return role;
}

export async function requireAdminPage(permission: Permission) {
  const role = await getCurrentAdminRole();
  if (!role || !hasPermission(role, permission)) redirect("/");
  return role;
}
