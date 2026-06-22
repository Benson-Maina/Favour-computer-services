"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { bulkUpdateInquiryStatus, updateContactInquiryStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminSelect } from "@/components/admin/admin-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactInquiry } from "@/lib/admin-data";

const statuses = ["new", "read", "replied", "closed"] as const;

export function InquiriesTable({ inquiries, canWrite }: { inquiries: ContactInquiry[]; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateOne(inquiryId: string, status: string) {
    const formData = new FormData();
    formData.set("inquiryId", inquiryId);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateContactInquiryStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  function runBulk(action: string, ids: string[]) {
    const formData = new FormData();
    formData.set("inquiryIds", JSON.stringify(ids));
    formData.set("status", action);
    startTransition(async () => {
      const result = await bulkUpdateInquiryStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <AdminDataTable
      rows={inquiries}
      searchPlaceholder="Search subject, name, email..."
      getSearchText={(row) => `${row.subject} ${row.name} ${row.email} ${row.message}`}
      bulkActions={
        canWrite
          ? [
              { label: "Mark Read", value: "read" },
              { label: "Mark Replied", value: "replied" },
              { label: "Close", value: "closed" }
            ]
          : []
      }
      onBulkAction={canWrite ? runBulk : undefined}
      filters={[
        {
          key: "status",
          label: "All statuses",
          options: statuses.map((status) => ({ label: status[0].toUpperCase() + status.slice(1), value: status })),
          match: (row, value) => row.status === value
        }
      ]}
      columns={[
        {
          key: "subject",
          header: "Subject",
          sortable: true,
          sortValue: (row) => row.subject,
          render: (row) => (
            <div>
              <p className={`font-medium ${row.status === "new" ? "text-foreground" : "text-muted-foreground"}`}>{row.subject}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.message}</p>
            </div>
          )
        },
        {
          key: "customer",
          header: "Customer",
          sortable: true,
          sortValue: (row) => row.name,
          render: (row) => (
            <div>
              <p>{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.email}</p>
            </div>
          )
        },
        {
          key: "date",
          header: "Date",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleString()
        },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <Badge variant={row.status === "new" ? "default" : "outline"}>{row.status}</Badge>
          )
        },
        {
          key: "actions",
          header: "Actions",
          render: (row) =>
            canWrite ? (
              <div className="flex flex-wrap gap-1">
                {statuses.map((status) => (
                  <Button key={status} size="sm" variant="ghost" disabled={pending || row.status === status} onClick={() => updateOne(row.id, status)}>
                    {status}
                  </Button>
                ))}
              </div>
            ) : null
        }
      ]}
      emptyTitle="Inbox is empty."
    />
  );
}
