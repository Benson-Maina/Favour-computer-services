import Link from "next/link";
import { Boxes, Mail, MessageSquare, Package, ShoppingBag, TrendingUp, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

const cards = [
  { key: "totalProducts", label: "Products", icon: Package, href: "/admin/products", format: (v: number) => String(v) },
  { key: "totalOrders", label: "Orders", icon: ShoppingBag, href: "/admin/orders", format: (v: number) => String(v) },
  { key: "totalRevenue", label: "Revenue", icon: TrendingUp, href: "/admin/orders", format: (v: number) => formatCurrency(v) },
  { key: "inventoryAlerts", label: "Inventory Alerts", icon: Warehouse, href: "/admin/inventory", format: (v: number) => String(v) },
  { key: "newInquiries", label: "New Inquiries", icon: Mail, href: "/admin/inquiries", format: (v: number) => String(v) },
  { key: "newBookings", label: "New Bookings", icon: MessageSquare, href: "/admin/bookings/cctv", format: (v: number) => String(v) }
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
          <Link key={key} href={href}>
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
        <CardContent className="flex items-start gap-3 p-5">
          <Boxes className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Quick navigation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the sidebar to manage products, orders, inventory, inquiries, and bookings. All counts above are loaded from live database records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
