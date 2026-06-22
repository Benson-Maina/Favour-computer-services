import Link from "next/link";
import { Boxes, Mail, MessageSquare, Package, ShoppingBag, TrendingUp, Users, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

const cards = [
  { key: "totalProducts", label: "Products", icon: Package, href: "/admin/products", format: (v: number) => String(v) },
  { key: "totalOrders", label: "Orders", icon: ShoppingBag, href: "/admin/orders", format: (v: number) => String(v) },
  { key: "totalRevenue", label: "Revenue", icon: TrendingUp, href: "/admin/payments", format: (v: number) => formatCurrency(v) },
  { key: "inventoryAlerts", label: "Inventory Alerts", icon: Warehouse, href: "/admin/inventory?filter=alerts", format: (v: number) => String(v) },
  { key: "newInquiries", label: "New Inquiries", icon: Mail, href: "/admin/inquiries?status=new", format: (v: number) => String(v) },
  { key: "newBookings", label: "New Bookings", icon: MessageSquare, href: "/admin/bookings/cctv?status=new", format: (v: number) => String(v) }
] as const;

const quickLinks = [
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Inquiries", href: "/admin/inquiries", icon: Mail },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Boxes }
] as const;

export function AdminDashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time metrics from your store database.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, href, format }) => (
          <Link key={key} href={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <Icon className="mb-3 size-5 text-primary" />
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{format(metrics[key])}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Boxes className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Quick navigation</p>
              <p className="mt-1 text-sm text-muted-foreground">Jump directly to key management areas.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon className="size-4 text-primary" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
