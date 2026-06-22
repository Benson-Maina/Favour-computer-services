import type { AdminRole, AppRole, Permission } from "@/lib/admin-permissions";
import { hasPermission, rolePermissions } from "@/lib/admin-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";
import type { AppUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";

export type { AdminRole, Permission };
export { hasPermission, rolePermissions, canAssignRole, canManageUser } from "@/lib/admin-permissions";

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const adminSupabase = createAdminClient();
  if (!adminSupabase) return null;

  const { data: profile } = await adminSupabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.deleted_at || profile.is_active === false) return null;
  return profile as AppUser;
}

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const profile = await getCurrentAppUser();
  if (!profile) return null;
  const role = profile.role;
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

export async function requireSuperAdmin() {
  const role = await getCurrentAdminRole();
  if (role !== "super_admin") {
    throw new Error("Only a super administrator can perform this action.");
  }
  return role;
}

export async function getAdminPermissions(): Promise<Permission[]> {
  const role = await getCurrentAdminRole();
  return role ? rolePermissions[role] : [];
}

export function isAdminRole(role: AppRole): role is AdminRole {
  return role === "super_admin" || role === "admin" || role === "staff";
}
