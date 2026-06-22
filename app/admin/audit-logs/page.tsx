import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadAuditLogs } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AdminAuditLogsPage() {
  await requireAdminPage("audit:read");
  const logs = await loadAuditLogs();
  return (
    <div>
      <AdminPageHeader title="Audit Logs" description="Review admin activity and system changes." />
      <AuditLogsTable logs={logs} />
    </div>
  );
}
