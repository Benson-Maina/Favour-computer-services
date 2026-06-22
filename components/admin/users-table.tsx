"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { setUserActiveStatus, updateUserRole } from "@/app/actions";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { ActionForm } from "@/components/action-form-status";
import { AdminSelect } from "@/components/admin/admin-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/admin-permissions";
import type { AdminUserRecord } from "@/lib/admin-data";

const roles: AppRole[] = ["customer", "staff", "admin", "super_admin"];

export function UsersTable({ users, currentUserId }: { users: AdminUserRecord[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <AdminDataTable
      rows={users}
      searchPlaceholder="Search name, email, phone, ID..."
      getSearchText={(row) => `${row.fullName} ${row.email ?? ""} ${row.phone ?? ""} ${row.id}`}
      filters={[
        {
          key: "role",
          label: "All roles",
          options: roles.map((role) => ({ label: role, value: role })),
          match: (row, value) => row.role === value
        },
        {
          key: "status",
          label: "All statuses",
          options: [
            { label: "Active", value: "active" },
            { label: "Disabled", value: "disabled" }
          ],
          match: (row, value) => (value === "active" ? row.isActive : !row.isActive)
        }
      ]}
      columns={[
        {
          key: "name",
          header: "User",
          sortable: true,
          sortValue: (row) => row.fullName,
          render: (row) => (
            <div>
              <p className="font-medium">{row.fullName}</p>
              <p className="text-xs text-muted-foreground">{row.email ?? "No email"}</p>
            </div>
          )
        },
        { key: "role", header: "Role", render: (row) => <Badge>{row.role}</Badge> },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge variant={row.isActive ? "outline" : "default"}>{row.isActive ? "Active" : "Disabled"}</Badge>
        },
        {
          key: "created",
          header: "Joined",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
          key: "actions",
          header: "Manage",
          render: (row) =>
            row.id === currentUserId ? (
              <span className="text-xs text-muted-foreground">Current account</span>
            ) : (
              <div className="space-y-2">
                <ActionForm action={updateUserRole} buttonLabel="Update Role" className="flex flex-wrap gap-2">
                  <input type="hidden" name="userId" value={row.id} />
                  <AdminSelect name="role" defaultValue={row.role} className="h-8 min-w-[130px] text-xs">
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </AdminSelect>
                </ActionForm>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    const formData = new FormData();
                    formData.set("userId", row.id);
                    formData.set("isActive", String(!row.isActive));
                    startTransition(async () => {
                      const result = await setUserActiveStatus({ ok: false, message: "" }, formData);
                      if (result.ok) toast.success(result.message);
                      else toast.error(result.message);
                      router.refresh();
                    });
                  }}
                >
                  {row.isActive ? "Disable" : "Reactivate"}
                </Button>
              </div>
            )
        }
      ]}
      emptyTitle="No users found."
    />
  );
}
