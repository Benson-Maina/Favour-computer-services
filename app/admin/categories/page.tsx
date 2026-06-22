import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadCategoriesWithCounts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdminPage("products:write");
  const categories = await loadCategoriesWithCounts();
  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize products with simple category management." />
      <CategoriesManager categories={categories} />
    </div>
  );
}
