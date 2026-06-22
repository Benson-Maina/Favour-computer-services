import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrandsManager } from "@/components/admin/brands-manager";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadBrandsWithCounts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  await requireAdminPage("products:write");
  const brands = await loadBrandsWithCounts();
  return (
    <div>
      <AdminPageHeader title="Brands" description="Manage product brands used in your catalog." />
      <BrandsManager brands={brands} />
    </div>
  );
}
