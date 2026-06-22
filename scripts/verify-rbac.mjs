const rolePermissions = {
  super_admin: [
    "dashboard:read", "products:read", "products:write", "inventory:read", "inventory:write",
    "orders:read", "orders:write", "payments:read", "payments:write", "customers:read", "customers:write",
    "bookings:read", "bookings:write", "blog:read", "blog:write", "testimonials:write", "settings:write",
    "users:read", "users:write", "roles:assign", "audit:read", "receipts:read", "returns:write"
  ],
  admin: [
    "dashboard:read", "products:read", "products:write", "inventory:read", "inventory:write",
    "orders:read", "orders:write", "payments:read", "payments:write", "customers:read", "customers:write",
    "bookings:read", "bookings:write", "blog:read", "blog:write", "testimonials:write", "receipts:read", "returns:write"
  ],
  staff: [
    "dashboard:read", "inventory:read", "inventory:write", "orders:read", "orders:write",
    "bookings:read", "customers:read", "receipts:read"
  ]
};

const roleHierarchy = { customer: 0, staff: 1, admin: 2, super_admin: 3 };

function hasPermission(role, permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

function canAssignRole(actorRole, targetCurrentRole, targetNewRole) {
  if (actorRole !== "super_admin") return false;
  if (targetNewRole === "super_admin" || targetNewRole === "admin") return actorRole === "super_admin";
  return roleHierarchy[targetNewRole] <= roleHierarchy[actorRole];
}

function canManageUser(actorRole, targetRole) {
  if (actorRole !== "super_admin") return false;
  return true;
}

const adminRoles = ["staff", "admin", "super_admin"];

const actionExpectations = [
  { action: "adjustInventory", permission: "inventory:write", allowed: ["staff", "admin", "super_admin"] },
  { action: "updateOrderStatus", permission: "orders:write", allowed: ["staff", "admin", "super_admin"] },
  { action: "reviewPayment", permission: "payments:write", allowed: ["admin", "super_admin"] },
  { action: "saveProduct", permission: "products:write", allowed: ["admin", "super_admin"] },
  { action: "saveSiteSettings", permission: "settings:write", allowed: ["super_admin"] },
  { action: "updateBookingStatus", permission: "bookings:write", allowed: ["admin", "super_admin"] },
  { action: "updateContactInquiryStatus", permission: "customers:write", allowed: ["admin", "super_admin"] }
];

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures += 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

for (const adminRole of adminRoles) {
  const permissions = rolePermissions[adminRole];
  assert(permissions.includes("dashboard:read"), `${adminRole} can access dashboard`);
  assert(!permissions.includes("settings:write") || adminRole === "super_admin", `${adminRole} settings access matches policy`);
  assert(!permissions.includes("users:write") || adminRole === "super_admin", `${adminRole} user write access matches policy`);
  assert(!permissions.includes("payments:write") || adminRole !== "staff", `${adminRole} payment write access matches policy`);
}

assert(!hasPermission("staff", "payments:write"), "staff cannot approve payments");
assert(hasPermission("admin", "products:write"), "admin can manage products");
assert(hasPermission("super_admin", "users:read"), "super_admin can read users");
assert(canAssignRole("super_admin", "customer", "admin"), "super_admin can promote customer to admin");
assert(!canAssignRole("admin", "customer", "admin"), "admin cannot assign admin role");
assert(canManageUser("super_admin", "admin"), "super_admin can manage admin users");
assert(!canManageUser("admin", "customer"), "admin cannot manage users");

for (const check of actionExpectations) {
  for (const role of adminRoles) {
    const allowed = check.allowed.includes(role);
    const actual = hasPermission(role, check.permission);
    assert(actual === allowed, `${role} ${check.action} (${check.permission}) expected ${allowed} got ${actual}`);
  }
}

console.log(`\nRBAC verification complete. Failures: ${failures}`);
process.exit(failures ? 1 : 0);
