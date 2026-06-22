"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AuditLogRecord } from "@/lib/admin-data";

export function AuditLogsTable({ logs }: { logs: AuditLogRecord[] }) {
  return (
    <AdminDataTable
      rows={logs}
      searchPlaceholder="Search action, entity, details..."
      getSearchText={(row) => `${row.action} ${row.entity} ${row.details} ${row.user}`}
      columns={[
        {
          key: "action",
          header: "Action",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => (
            <div>
              <p className="font-medium text-foreground">{row.action}</p>
              <p className="text-xs text-muted-foreground">{row.entity}</p>
            </div>
          )
        },
        { key: "details", header: "Details", render: (row) => <p className="max-w-xl text-sm text-muted-foreground">{row.details}</p> },
        { key: "user", header: "User", render: (row) => row.user },
        {
          key: "date",
          header: "Date",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleString()
        }
      ]}
      emptyTitle="No audit logs yet."
    />
  );
}
