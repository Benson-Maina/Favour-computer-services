"use client";

import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { ActionForm } from "@/components/action-form-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reviewPayment } from "@/app/actions";
import type { Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PaymentsTable({ payments, canWrite }: { payments: Payment[]; canWrite: boolean }) {
  return (
    <AdminDataTable
      rows={payments}
      searchPlaceholder="Search transaction code, order..."
      getSearchText={(row) => `${row.transactionCode} ${row.orderId}`}
      filters={[
        {
          key: "status",
          label: "All statuses",
          options: [
            { label: "Pending review", value: "pending" },
            { label: "Verified", value: "verified" },
            { label: "Rejected", value: "rejected" }
          ],
          match: (row, value) => {
            if (value === "verified") return row.verified;
            if (value === "rejected") return row.rejected;
            return !row.verified && !row.rejected;
          }
        }
      ]}
      columns={[
        {
          key: "transaction",
          header: "Transaction",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => (
            <div>
              <p className="font-mono text-sm font-semibold">{row.transactionCode}</p>
              <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
            </div>
          )
        },
        {
          key: "order",
          header: "Order",
          render: (row) => (
            <Link href={`/admin/orders/${row.orderId}`} className="font-mono text-xs text-primary hover:underline">
              {row.orderId.slice(0, 8).toUpperCase()}
            </Link>
          )
        },
        { key: "amount", header: "Amount", sortable: true, sortValue: (row) => row.amount, render: (row) => formatCurrency(row.amount) },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <Badge variant={row.verified ? "outline" : row.rejected ? "default" : "secondary"}>
              {row.verified ? "Verified" : row.rejected ? "Rejected" : "Pending"}
            </Badge>
          )
        },
        {
          key: "actions",
          header: "Review",
          render: (row) =>
            canWrite && !row.verified && !row.rejected ? (
              <ActionForm action={reviewPayment} buttonLabel="Submit" className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input type="hidden" name="paymentId" value={row.id} />
                <input type="hidden" name="orderId" value={row.orderId} />
                <select name="action" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
                  <option value="verify">Verify</option>
                  <option value="reject">Reject</option>
                </select>
                <Input name="rejectionReason" placeholder="Rejection reason" className="h-9" />
                <input type="hidden" name="actor" value="Admin" />
              </ActionForm>
            ) : row.confirmationUrl ? (
              <Button asChild size="sm" variant="outline"><a href={row.confirmationUrl} target="_blank">Screenshot</a></Button>
            ) : null
        }
      ]}
      emptyTitle="No payments recorded."
    />
  );
}
