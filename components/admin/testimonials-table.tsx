"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateTestimonialStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestimonialRecord } from "@/lib/admin-data";

export function TestimonialsTable({ testimonials, canWrite }: { testimonials: TestimonialRecord[]; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleApproved(testimonialId: string, approved: boolean) {
    const formData = new FormData();
    formData.set("testimonialId", testimonialId);
    formData.set("approved", String(approved));
    startTransition(async () => {
      const result = await updateTestimonialStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <AdminDataTable
      rows={testimonials}
      searchPlaceholder="Search name, quote..."
      getSearchText={(row) => `${row.name} ${row.role} ${row.quote}`}
      filters={[
        {
          key: "approved",
          label: "All testimonials",
          options: [
            { label: "Approved", value: "yes" },
            { label: "Pending", value: "no" }
          ],
          match: (row, value) => (value === "yes" ? row.approved : !row.approved)
        }
      ]}
      columns={[
        { key: "name", header: "Name", sortable: true, sortValue: (row) => row.name, render: (row) => row.name },
        { key: "role", header: "Role", render: (row) => row.role },
        { key: "quote", header: "Quote", render: (row) => <p className="line-clamp-2 max-w-md text-sm">{row.quote}</p> },
        { key: "rating", header: "Rating", render: (row) => `${row.rating}/5` },
        { key: "status", header: "Status", render: (row) => <Badge variant={row.approved ? "outline" : "default"}>{row.approved ? "Approved" : "Pending"}</Badge> },
        {
          key: "actions",
          header: "Actions",
          render: (row) =>
            canWrite ? (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={pending || row.approved} onClick={() => toggleApproved(row.id, true)}>Approve</Button>
                <Button size="sm" variant="ghost" disabled={pending || !row.approved} onClick={() => toggleApproved(row.id, false)}>Unapprove</Button>
              </div>
            ) : null
        }
      ]}
      emptyTitle="No testimonials yet."
    />
  );
}
