import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadProducts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  await requireAdminPage("inventory:read");
  const [products, permissions] = await Promise.all([loadProducts(), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Inventory" description="Monitor stock levels and adjust inventory inline." />
      <InventoryTable products={products} canWrite={permissions.includes("inventory:write")} />
    </div>
  );
}
