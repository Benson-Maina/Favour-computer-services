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

export const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: ["dashboard:read", "products:write", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read", "returns:write", "audit:read"],
  admin: ["dashboard:read", "products:write", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read", "returns:write", "audit:read"],
  staff: ["dashboard:read", "inventory:write", "orders:write", "payments:write", "customers:read", "receipts:read"]
};

export function hasPermission(role: AdminRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
