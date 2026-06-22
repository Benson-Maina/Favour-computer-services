"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminSelect } from "@/components/admin/admin-select";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/types";

const statuses = ["new", "contacted", "scheduled", "completed", "cancelled"] as const;

export function BookingsTable({ bookings, canWrite }: { bookings: Booking[]; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
    <AdminDataTable
      rows={bookings}
      searchPlaceholder="Search customer, service, phone..."
      getSearchText={(row) => `${row.name} ${row.email} ${row.phone} ${row.service} ${row.message}`}
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
          header: "Update",
          render: (row) =>
            canWrite ? (
              <AdminSelect defaultValue={row.status} className="h-8 min-w-[130px] text-xs" disabled={pending} onChange={(event) => updateStatus(row.id, event.target.value)}>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </AdminSelect>
            ) : null
        }
      ]}
      emptyTitle="No bookings yet."
    />
  );
}
