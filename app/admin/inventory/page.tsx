import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadProducts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage({
  searchParams
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdminPage("inventory:read");
  const { filter } = await searchParams;
  const [products, permissions] = await Promise.all([loadProducts(), getAdminPermissions()]);
  const initialFilterValues: Record<string, string> =
    filter === "alerts" || filter === "low_stock" ? { stock: filter === "alerts" ? "alerts" : "low_stock" } : {};

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Monitor stock levels and adjust inventory inline." />
      <InventoryTable products={products} canWrite={permissions.includes("inventory:write")} initialFilterValues={initialFilterValues} />
    </div>
  );
}
