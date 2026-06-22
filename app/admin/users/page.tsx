import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersTable } from "@/components/admin/users-table";
import { requireAdminPage } from "@/lib/admin-auth";
import { getCurrentUserId } from "@/lib/auth";
import { loadUsers } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requireAdminPage("users:read");
  const [users, currentUserId] = await Promise.all([loadUsers(), getCurrentUserId()]);
  if (!currentUserId) return null;
  return (
    <div>
      <AdminPageHeader title="Users" description="Search, filter, assign roles, and manage account access." />
      <UsersTable users={users} currentUserId={currentUserId} />
    </div>
  );
}
