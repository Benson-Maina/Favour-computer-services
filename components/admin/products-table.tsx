"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { bulkProductAction, quickUpdateProduct, updateProductLifecycle } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInventoryStatus } from "@/lib/admin-data";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ProductsTable({ products, canWrite }: { products: Product[]; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function runBulk(action: string, ids: string[]) {
    const formData = new FormData();
    formData.set("productIds", JSON.stringify(ids));
    formData.set("action", action);
    startTransition(async () => {
      const result = await bulkProductAction({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  async function runLifecycle(productId: string, action: "duplicate" | "delete") {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("action", action);
    startTransition(async () => {
      const result = await updateProductLifecycle({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  const categoryOptions = Array.from(new Set(products.map((p) => p.category))).map((value) => ({ label: value, value }));
  const brandOptions = Array.from(new Set(products.map((p) => p.brand))).map((value) => ({ label: value, value }));

  return (
    <AdminDataTable
      rows={products}
      searchPlaceholder="Search products, SKU..."
      getSearchText={(row) => `${row.name} ${row.sku} ${row.category} ${row.brand}`}
      bulkActions={
        canWrite
          ? [
              { label: "Activate", value: "activate" },
              { label: "Deactivate", value: "deactivate" },
              { label: "Archive", value: "archive" },
              { label: "Delete", value: "delete", variant: "destructive" }
            ]
          : []
      }
      onBulkAction={canWrite ? runBulk : undefined}
      filters={[
        {
          key: "category",
          label: "All categories",
          options: categoryOptions,
          match: (row, value) => row.category === value
        },
        {
          key: "brand",
          label: "All brands",
          options: brandOptions,
          match: (row, value) => row.brand === value
        },
        {
          key: "status",
          label: "All statuses",
          options: [
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Hidden", value: "hidden" },
            { label: "Archived", value: "archived" }
          ],
          match: (row, value) => (row.status ?? "active") === value
        },
        {
          key: "stockStatus",
          label: "All stock",
          options: [
            { label: "In stock", value: "healthy" },
            { label: "Low stock", value: "low_stock" },
            { label: "Out of stock", value: "out_of_stock" }
          ],
          match: (row, value) => getInventoryStatus(row) === value
        }
      ]}
      columns={[
        {
          key: "image",
          header: "Image",
          render: (row) => (
            <div className="size-10 overflow-hidden rounded bg-secondary">
              {row.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.images[0]} alt={row.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">—</div>
              )}
            </div>
          )
        },
        {
          key: "name",
          header: "Product",
          sortable: true,
          sortValue: (row) => row.name,
          searchValue: (row) => row.name,
          render: (row) => (
            <div>
              <p className="font-medium text-foreground">{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.slug}</p>
            </div>
          )
        },
        {
          key: "sku",
          header: "SKU",
          sortable: true,
          sortValue: (row) => row.sku,
          render: (row) => <span className="font-mono text-xs">{row.sku}</span>
        },
        { key: "category", header: "Category", render: (row) => row.category },
        { key: "brand", header: "Brand", render: (row) => row.brand },
        {
          key: "price",
          header: "Price",
          sortable: true,
          sortValue: (row) => row.salePrice ?? row.price,
          render: (row) => (
            <div>
              <p className="font-medium">{formatCurrency(row.salePrice ?? row.price)}</p>
              {row.salePrice ? <p className="text-xs text-muted-foreground line-through">{formatCurrency(row.price)}</p> : null}
            </div>
          )
        },
        {
          key: "stock",
          header: "Stock",
          sortable: true,
          sortValue: (row) => row.stock,
          render: (row) => {
            const status = getInventoryStatus(row);
            return (
              <Badge variant={status === "healthy" ? "outline" : "default"}>
                {row.stock}
              </Badge>
            );
          }
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge variant="secondary">{row.status ?? "active"}</Badge>
        },
        {
          key: "created",
          header: "Created",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
          key: "actions",
          header: "Actions",
          className: "text-right",
          render: (row) => (
            <div className="flex flex-wrap justify-end gap-1">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/products/${row.id}`}>Edit</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/products/${row.slug}`} target="_blank">View</Link>
              </Button>
              {canWrite ? (
                <>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => runLifecycle(row.id, "duplicate")}>
                    Duplicate
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => runLifecycle(row.id, "delete")}>
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          )
        }
      ]}
      emptyTitle="No products yet. Create your first product."
    />
  );
}

export function QuickProductUpdates({ product, canWrite }: { product: Product; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!canWrite) return null;

  function quickUpdate(field: "stock" | "price" | "status", value: string) {
    const formData = new FormData();
    formData.set("productId", product.id);
    formData.set("field", field);
    formData.set("value", value);
    startTransition(async () => {
      const result = await quickUpdateProduct({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <div className="mb-6 grid gap-3 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-3">
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-foreground">Quick stock</span>
        <input
          type="number"
          defaultValue={product.stock}
          className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
          onBlur={(event) => {
            if (event.target.value !== String(product.stock)) quickUpdate("stock", event.target.value);
          }}
          disabled={pending}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-foreground">Quick price</span>
        <input
          type="number"
          defaultValue={product.price}
          className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
          onBlur={(event) => {
            if (event.target.value !== String(product.price)) quickUpdate("price", event.target.value);
          }}
          disabled={pending}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-foreground">Quick status</span>
        <select
          defaultValue={product.status ?? "active"}
          className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
          onChange={(event) => quickUpdate("status", event.target.value)}
          disabled={pending}
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
          <option value="archived">Archived</option>
        </select>
      </label>
    </div>
  );
}
