import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadCategoryBrandOptions } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "New Product",
  description: "Create a new product."
};

export default async function NewProductPage() {
  await requireAdminPage("products:write");
  const [{ categories, brands }, permissions] = await Promise.all([loadCategoryBrandOptions(), getAdminPermissions()]);

  return (
    <div>
      <AdminPageHeader title="Create Product" description="Add essential product details. Advanced fields are optional." />
      <ProductForm categories={categories} brands={brands} canWrite={permissions.includes("products:write")} />
    </div>
  );
}
