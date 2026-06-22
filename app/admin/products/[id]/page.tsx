import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { QuickProductUpdates } from "@/components/admin/products-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadCategoryBrandOptions, loadProductById } from "@/lib/admin-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProductById(id);
  return { title: product ? `Edit ${product.name}` : "Edit Product" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("products:read");
  const { id } = await params;
  const [product, { categories, brands }, permissions] = await Promise.all([
    loadProductById(id),
    loadCategoryBrandOptions(),
    getAdminPermissions()
  ]);
  if (!product) notFound();
  const canWrite = permissions.includes("products:write");

  return (
    <div>
      <AdminPageHeader title={product.name} description={`SKU ${product.sku} · ${product.status ?? "active"}`} />
      <QuickProductUpdates product={product} canWrite={canWrite} />
      <ProductForm product={product} categories={categories} brands={brands} canWrite={canWrite} />
    </div>
  );
}
