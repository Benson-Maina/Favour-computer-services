"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminSelect } from "@/components/admin/admin-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/types";

const statuses = ["new", "contacted", "scheduled", "completed", "cancelled"] as const;

export function BookingsTable({
  bookings,
  canWrite,
  initialFilterValues = {},
  initialSearch = ""
}: {
  bookings: Booking[];
  canWrite: boolean;
  initialFilterValues?: Record<string, string>;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewing, setViewing] = useState<Booking | null>(null);

  function updateStatus(bookingId: string, status: string) {
    const formData = new FormData();
    formData.set("bookingId", bookingId);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateBookingStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <AdminDataTable
        rows={bookings}
        searchPlaceholder="Search customer, service, phone..."
        getSearchText={(row) => `${row.name} ${row.email} ${row.phone} ${row.service} ${row.message}`}
        initialFilterValues={initialFilterValues}
        initialSearch={initialSearch}
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
            key: "customer",
            header: "Customer",
            sortable: true,
            sortValue: (row) => row.name,
            render: (row) => (
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.phone} · {row.email}</p>
              </div>
            )
          },
          {
            key: "service",
            header: "Service",
            sortable: true,
            sortValue: (row) => row.service,
            render: (row) => row.service
          },
          {
            key: "date",
            header: "Date",
            sortable: true,
            sortValue: (row) => row.preferredDate || row.createdAt,
            render: (row) => (
              <div>
                <p>{row.preferredDate ? new Date(row.preferredDate).toLocaleDateString() : "—"}</p>
                <p className="text-xs text-muted-foreground">Submitted {new Date(row.createdAt).toLocaleDateString()}</p>
              </div>
            )
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <Badge variant={row.status === "new" ? "default" : "outline"}>{row.status}</Badge>
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => setViewing(row)}>View</Button>
                {canWrite && row.status === "new" ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => updateStatus(row.id, "contacted")}>
                    Assign
                  </Button>
                ) : null}
                {canWrite && row.status !== "completed" && row.status !== "cancelled" ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => updateStatus(row.id, "completed")}>
                    Complete
                  </Button>
                ) : null}
                {canWrite && row.status !== "cancelled" ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => updateStatus(row.id, "cancelled")}>
                    Cancel
                  </Button>
                ) : null}
                {canWrite ? (
                  <AdminSelect defaultValue={row.status} className="h-8 min-w-[120px] text-xs" disabled={pending} onChange={(event) => updateStatus(row.id, event.target.value)}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </AdminSelect>
                ) : null}
              </div>
            )
          }
        ]}
        emptyTitle="No bookings yet."
      />
      {viewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewing(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">{viewing.service}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{viewing.name} · {viewing.phone} · {viewing.email}</p>
            <p className="mt-4 text-sm text-foreground">{viewing.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
