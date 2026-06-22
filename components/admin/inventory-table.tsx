"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { adjustInventory } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInventoryStatus } from "@/lib/admin-data";
import type { Product } from "@/lib/types";

function StockAdjustForm({ product, canWrite }: { product: Product; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!canWrite) return null;

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("productId", product.id);
        startTransition(async () => {
          const result = await adjustInventory({ ok: false, message: "" }, formData);
          if (result.ok) toast.success(result.message);
          else toast.error(result.message);
          router.refresh();
        });
      }}
    >
      <Input name="change" type="number" placeholder="+5 / -2" className="h-8 w-20" required />
      <Input name="reason" placeholder="Reason" className="h-8 min-w-[120px] flex-1" required />
      <input type="hidden" name="actor" value="Admin" />
      <Button type="submit" size="sm" disabled={pending}>Adjust</Button>
    </form>
  );
}

export function InventoryTable({
  products,
  canWrite,
  initialFilterValues = {}
}: {
  products: Product[];
  canWrite: boolean;
  initialFilterValues?: Record<string, string>;
}) {
  const statusLabel = { healthy: "Healthy", low_stock: "Low Stock", out_of_stock: "Out of Stock" };
  const statusVariant = { healthy: "outline" as const, low_stock: "secondary" as const, out_of_stock: "default" as const };

  return (
    <AdminDataTable
      rows={products}
      searchPlaceholder="Search inventory..."
      getSearchText={(row) => `${row.name} ${row.sku}`}
      filters={[
        {
          key: "stock",
          label: "All stock levels",
          options: [
            { label: "In stock", value: "healthy" },
            { label: "Low stock", value: "low_stock" },
            { label: "Out of stock", value: "out_of_stock" },
            { label: "Alerts (low + out)", value: "alerts" }
          ],
          match: (row, value) => {
            const status = getInventoryStatus(row);
            if (value === "alerts") return status === "low_stock" || status === "out_of_stock";
            return status === value;
          }
        }
      ]}
      initialFilterValues={initialFilterValues}
      columns={[
        {
          key: "product",
          header: "Product",
          sortable: true,
          sortValue: (row) => row.name,
          render: (row) => (
            <div>
              <p className="font-medium text-foreground">{row.name}</p>
              <p className="text-xs text-muted-foreground">SKU {row.sku}</p>
            </div>
          )
        },
        {
          key: "stock",
          header: "Current Stock",
          sortable: true,
          sortValue: (row) => row.stock,
          render: (row) => <span className="font-semibold">{row.stock}</span>
        },
        {
          key: "threshold",
          header: "Low Stock Threshold",
          sortValue: (row) => row.lowStockThreshold,
          render: (row) => row.lowStockThreshold
        },
        {
          key: "status",
          header: "Inventory Status",
          render: (row) => {
            const status = getInventoryStatus(row);
            return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
          }
        },
        {
          key: "adjust",
          header: "Quick Adjust",
          render: (row) => <StockAdjustForm product={row} canWrite={canWrite} />
        }
      ]}
      emptyTitle="No products in inventory."
    />
  );
}
