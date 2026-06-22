import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadProducts } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage store products."
};

export default async function AdminProductsPage() {
  await requireAdminPage("products:read");
  const [products, permissions] = await Promise.all([loadProducts(), getAdminPermissions()]);
  const canWrite = permissions.includes("products:write");

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Search, filter, and manage your product catalog."
        action={canWrite ? { label: "Add Product", href: "/admin/products/new" } : undefined}
      />
      <ProductsTable products={products} canWrite={canWrite} />
    </div>
  );
}
