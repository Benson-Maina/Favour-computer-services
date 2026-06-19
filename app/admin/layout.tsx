import { requirePermission } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("dashboard:read");
  return children;
}
