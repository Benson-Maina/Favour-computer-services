import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReceiptsTable } from "@/components/admin/receipts-table";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadReceipts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Receipts" };

export default async function AdminReceiptsPage() {
  await requireAdminPage("receipts:read");
  const receipts = await loadReceipts();
  return (
    <div>
      <AdminPageHeader title="Receipts" description="View generated order receipts." />
      <ReceiptsTable receipts={receipts} />
    </div>
  );
}
