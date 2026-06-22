import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentsTable } from "@/components/admin/payments-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadPayments } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  await requireAdminPage("payments:read");
  const [payments, permissions] = await Promise.all([loadPayments(), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Payments" description="Review and verify Paybill payment submissions." />
      <PaymentsTable payments={payments} canWrite={permissions.includes("payments:write")} />
    </div>
  );
}
