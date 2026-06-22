export type AppRole = "customer" | "staff" | "admin" | "super_admin";
export type AdminRole = "super_admin" | "admin" | "staff";

export type Permission =
  | "dashboard:read"
  | "products:read"
  | "products:write"
  | "inventory:read"
  | "inventory:write"
  | "orders:read"
  | "orders:write"
  | "payments:read"
  | "payments:write"
  | "customers:read"
  | "customers:write"
  | "bookings:read"
  | "bookings:write"
  | "blog:read"
  | "blog:write"
  | "testimonials:write"
  | "settings:write"
  | "users:read"
  | "users:write"
  | "roles:assign"
  | "audit:read"
  | "receipts:read"
  | "returns:write";

const allPermissions: Permission[] = [
  "dashboard:read",
  "products:read",
  "products:write",
  "inventory:read",
  "inventory:write",
  "orders:read",
  "orders:write",
  "payments:read",
  "payments:write",
  "customers:read",
  "customers:write",
  "bookings:read",
  "bookings:write",
  "blog:read",
  "blog:write",
  "testimonials:write",
  "settings:write",
  "users:read",
  "users:write",
  "roles:assign",
  "audit:read",
  "receipts:read",
  "returns:write"
];

export const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: allPermissions,
  admin: [
    "dashboard:read",
    "products:read",
    "products:write",
    "inventory:read",
    "inventory:write",
    "orders:read",
    "orders:write",
    "payments:read",
    "payments:write",
    "customers:read",
    "customers:write",
    "bookings:read",
    "bookings:write",
    "blog:read",
    "blog:write",
    "testimonials:write",
    "receipts:read",
    "returns:write"
  ],
  staff: [
    "dashboard:read",
    "inventory:read",
    "inventory:write",
    "orders:read",
    "orders:write",
    "bookings:read",
    "customers:read",
    "receipts:read"
  ]
};

export const roleHierarchy: Record<AppRole, number> = {
  customer: 0,
  staff: 1,
  admin: 2,
  super_admin: 3
};

export const privilegedRoles: AppRole[] = ["super_admin", "admin", "staff"];

export function hasPermission(role: AdminRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function canAssignRole(actorRole: AdminRole, targetCurrentRole: AppRole, targetNewRole: AppRole) {
  if (actorRole !== "super_admin") return false;
  if (targetCurrentRole === "super_admin" && targetNewRole !== "super_admin") return true;
  if (targetNewRole === "super_admin" || targetNewRole === "admin") return actorRole === "super_admin";
  return roleHierarchy[targetNewRole] <= roleHierarchy[actorRole];
}

export function canManageUser(actorRole: AdminRole, targetRole: AppRole) {
  if (actorRole !== "super_admin") return false;
  if (targetRole === "super_admin") return actorRole === "super_admin";
  return true;
}
