import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export type AdminRole = "super_admin" | "admin" | "staff";
export type Permission =
  | "dashboard:read"
  | "products:write"
  | "inventory:write"
  | "orders:write"
  | "payments:write"
  | "customers:read"
  | "receipts:read"
  | "returns:write"
  | "audit:read";

const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: ["dashboard:read", "products:write", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read", "returns:write", "audit:read"],
  admin: ["dashboard:read", "products:write", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read", "returns:write", "audit:read"],
  staff: ["dashboard:read", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read"]
};

export function hasPermission(role: AdminRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const adminSupabase = createAdminClient();
  const client = adminSupabase ?? supabase;
  const { data: profile } = await client.from("users").select("role").eq("id", auth.user.id).single();
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
