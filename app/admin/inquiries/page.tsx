import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InquiriesTable } from "@/components/admin/inquiries-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadContactInquiries } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPage("customers:read");
  const { status } = await searchParams;
  const [inquiries, permissions] = await Promise.all([loadContactInquiries(), getAdminPermissions()]);
  const initialFilterValues: Record<string, string> = status ? { status } : {};
  return (
    <div>
      <AdminPageHeader title="Inquiries" description="Manage contact form submissions like an inbox." />
      <InquiriesTable inquiries={inquiries} canWrite={permissions.includes("customers:write")} initialFilterValues={initialFilterValues} />
    </div>
  );
}
