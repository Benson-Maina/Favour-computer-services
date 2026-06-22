import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadOrders, loadPayments } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  await requireAdminPage("orders:read");
  const [orders, payments, permissions] = await Promise.all([loadOrders(), loadPayments(), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Orders" description="Manage customer orders, payment status, and fulfillment." />
      <OrdersTable orders={orders} payments={payments} canWrite={permissions.includes("orders:write")} />
    </div>
  );
}
