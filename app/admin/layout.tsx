import { getAdminPermissions, getCurrentAdminRole, requireAdminPage } from "@/lib/admin-auth";
import { loadDashboardMetrics } from "@/lib/admin-data";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage("dashboard:read");
  const [adminRole, permissions, metrics] = await Promise.all([
    getCurrentAdminRole(),
    getAdminPermissions(),
    loadDashboardMetrics()
  ]);
  if (!adminRole) return null;

  return (
    <AdminShell
      permissions={permissions}
      adminRole={adminRole}
      badges={{
        newInquiries: metrics.newInquiries,
        newBookings: metrics.newBookings,
        inventoryAlerts: metrics.inventoryAlerts
      }}
    >
      {children}
    </AdminShell>
  );
}
