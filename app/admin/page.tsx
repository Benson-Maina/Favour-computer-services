import type { Metadata } from "next";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadDashboardMetrics } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Store overview for Favour Computer Services."
};

export default async function AdminPage() {
  await requireAdminPage("dashboard:read");
  const metrics = await loadDashboardMetrics();
  return <AdminDashboardOverview metrics={metrics} />;
}
