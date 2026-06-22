"use client";

import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReceiptRecord } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

export function ReceiptsTable({ receipts }: { receipts: ReceiptRecord[] }) {
  return (
    <AdminDataTable
      rows={receipts}
      searchPlaceholder="Search receipt #, customer..."
      getSearchText={(row) => `${row.receiptNumber} ${row.customerName} ${row.orderId}`}
      columns={[
        { key: "number", header: "Receipt #", sortable: true, sortValue: (row) => row.receiptNumber, render: (row) => row.receiptNumber },
        {
          key: "order",
          header: "Order",
          render: (row) => (
            <Link href={`/admin/orders/${row.orderId}`} className="font-mono text-xs text-primary hover:underline">
              {row.orderId.slice(0, 8).toUpperCase()}
            </Link>
          )
        },
        { key: "customer", header: "Customer", sortable: true, sortValue: (row) => row.customerName, render: (row) => row.customerName },
        { key: "total", header: "Total", sortable: true, sortValue: (row) => row.total, render: (row) => formatCurrency(row.total) },
        { key: "payment", header: "Payment", render: (row) => <Badge variant="outline">{row.paymentStatus}</Badge> },
        {
          key: "date",
          header: "Date",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleString()
        },
        {
          key: "actions",
          header: "Actions",
          render: (row) => (
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/orders/${row.orderId}?print=1`} target="_blank">Print</Link>
            </Button>
          )
        }
      ]}
      emptyTitle="No receipts generated yet."
    />
  );
}
