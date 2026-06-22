"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateReviewStatus } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReviewRecord } from "@/lib/admin-data";

export function ReviewsTable({ reviews, canWrite }: { reviews: ReviewRecord[]; canWrite: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleApproved(reviewId: string, approved: boolean) {
    const formData = new FormData();
    formData.set("reviewId", reviewId);
    formData.set("approved", String(approved));
    startTransition(async () => {
      const result = await updateReviewStatus({ ok: false, message: "" }, formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <AdminDataTable
      rows={reviews}
      searchPlaceholder="Search product, customer, comment..."
      getSearchText={(row) => `${row.productName} ${row.userName} ${row.comment}`}
      filters={[
        {
          key: "approved",
          label: "All reviews",
          options: [
            { label: "Approved", value: "yes" },
            { label: "Pending", value: "no" }
          ],
          match: (row, value) => (value === "yes" ? row.approved : !row.approved)
        }
      ]}
      columns={[
        { key: "product", header: "Product", sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
        { key: "customer", header: "Customer", sortable: true, sortValue: (row) => row.userName, render: (row) => row.userName },
        { key: "rating", header: "Rating", sortable: true, sortValue: (row) => row.rating, render: (row) => `${row.rating}/5` },
        { key: "comment", header: "Comment", render: (row) => <p className="line-clamp-2 max-w-xs text-sm">{row.comment}</p> },
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
      emptyTitle="No reviews yet."
    />
  );
}
