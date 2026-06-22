import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadReviews } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  await requireAdminPage("customers:read");
  const [reviews, permissions] = await Promise.all([loadReviews(), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Reviews" description="Moderate product reviews from customers." />
      <ReviewsTable reviews={reviews} canWrite={permissions.includes("customers:write")} />
    </div>
  );
}
