"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { bulkUpdateInquiryStatus, deleteContactInquiry, updateContactInquiryStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactInquiry } from "@/lib/admin-data";

const statuses = ["new", "read", "replied", "closed"] as const;

export function InquiriesTable({
  inquiries,
  canWrite,
  initialFilterValues = {}
}: {
  inquiries: ContactInquiry[];
  canWrite: boolean;
  initialFilterValues?: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unreadCount = inquiries.filter((i) => i.status === "new").length;

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

  function deleteOne(inquiryId: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    const formData = new FormData();
    formData.set("inquiryId", inquiryId);
    startTransition(async () => {
      const result = await deleteContactInquiry({ ok: false, message: "" }, formData);
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
    <div>
      {unreadCount > 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">
          <Badge className="mr-2">{unreadCount}</Badge>
          unread inquiry{unreadCount === 1 ? "" : "s"}
        </p>
      ) : null}
      <AdminDataTable
        rows={inquiries}
        searchPlaceholder="Search subject, name, email..."
        getSearchText={(row) => `${row.subject} ${row.name} ${row.email} ${row.message}`}
        initialFilterValues={initialFilterValues}
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
                <p className="text-xs text-muted-foreground">{row.phone}</p>
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
                  {row.status === "new" ? (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => updateOne(row.id, "read")}>
                      Mark Read
                    </Button>
                  ) : null}
                  {row.status !== "replied" && row.status !== "closed" ? (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => updateOne(row.id, "replied")}>
                      Mark Replied
                    </Button>
                  ) : null}
                  {row.status !== "closed" ? (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => updateOne(row.id, "closed")}>
                      Close
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => deleteOne(row.id)}>
                    Delete
                  </Button>
                </div>
              ) : null
          }
        ]}
        emptyTitle="Inbox is empty."
      />
    </div>
  );
}
