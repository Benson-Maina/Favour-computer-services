"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { NewsletterRecord } from "@/lib/admin-data";

export function NewsletterTable({ subscribers }: { subscribers: NewsletterRecord[] }) {
  return (
    <AdminDataTable
      rows={subscribers}
      searchPlaceholder="Search email..."
      getSearchText={(row) => row.email}
      columns={[
        { key: "email", header: "Email", sortable: true, sortValue: (row) => row.email, render: (row) => row.email },
        {
          key: "date",
          header: "Subscribed",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleString()
        }
      ]}
      emptyTitle="No newsletter subscribers yet."
    />
  );
}
