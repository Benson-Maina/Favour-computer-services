import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BadgePercent,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Tags,
  Users,
  Video,
  Warehouse
} from "lucide-react";
import type { Permission } from "@/lib/admin-permissions";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  badgeKey?: "newInquiries" | "newBookings" | "inventoryAlerts";
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard:read" }]
  },
  {
    title: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Package, permission: "products:read" },
      { title: "Categories", href: "/admin/categories", icon: Tags, permission: "products:write" },
      { title: "Brands", href: "/admin/brands", icon: BadgePercent, permission: "products:write" },
      { title: "Inventory", href: "/admin/inventory", icon: Warehouse, permission: "inventory:read", badgeKey: "inventoryAlerts" }
    ]
  },
  {
    title: "Sales",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingBag, permission: "orders:read" },
      { title: "Payments", href: "/admin/payments", icon: CreditCard, permission: "payments:read" },
      { title: "Receipts", href: "/admin/receipts", icon: Receipt, permission: "receipts:read" }
    ]
  },
  {
    title: "Services",
    items: [
      { title: "CCTV Bookings", href: "/admin/bookings/cctv", icon: Video, permission: "bookings:read", badgeKey: "newBookings" },
      { title: "Live Streaming", href: "/admin/bookings/live-streaming", icon: CalendarCheck, permission: "bookings:read" }
    ]
  },
  {
    title: "Customers",
    items: [
      { title: "Users", href: "/admin/users", icon: Users, permission: "users:read" },
      { title: "Reviews", href: "/admin/reviews", icon: Star, permission: "customers:read" },
      { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquare, permission: "testimonials:write" }
    ]
  },
  {
    title: "Content",
    items: [{ title: "Blog", href: "/admin/blog", icon: BookOpen, permission: "blog:read" }]
  },
  {
    title: "Communications",
    items: [
      { title: "Inquiries", href: "/admin/inquiries", icon: Mail, permission: "customers:read", badgeKey: "newInquiries" },
      { title: "Newsletter", href: "/admin/newsletter", icon: Archive, permission: "customers:read" }
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings, permission: "settings:write" },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: Shield, permission: "audit:read" }
    ]
  }
];

export function filterNavGroups(permissions: Permission[]) {
  return adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => permissions.includes(item.permission))
    }))
    .filter((group) => group.items.length > 0);
}

export function getAdminPagePermission(pathname: string): Permission {
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)) {
        return item.permission;
      }
    }
  }
  return "dashboard:read";
}
