"use client";

import { useMemo, useState } from "react";
import { setUserActiveStatus, updateUserRole } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppRole } from "@/lib/admin-permissions";

export type AdminUserRecord = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
};

type AdminUserManagementProps = {
  users: AdminUserRecord[];
  currentUserId: string;
};

const roles: AppRole[] = ["customer", "staff", "admin", "super_admin"];

export function AdminUserManagement({ users, currentUserId }: AdminUserManagementProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const haystack = `${user.fullName} ${user.email ?? ""} ${user.phone ?? ""} ${user.id}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter === "active" && !user.isActive) return false;
      if (statusFilter === "disabled" && user.isActive) return false;
      return true;
    });
  }, [users, query, roleFilter, statusFilter]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">Search, filter, assign roles, and manage account access. Super admin only.</p>
          </div>
          <Badge variant="secondary">{filtered.length} users</Badge>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone, or Clerk ID" />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as AppRole | "all")} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All roles</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.length ? filtered.map((user) => (
            <div key={user.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email ?? "No email"} | {user.phone ?? "No phone"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Clerk ID: {user.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{user.role}</Badge>
                  <Badge variant={user.isActive ? "outline" : "default"}>{user.isActive ? "Active" : "Disabled"}</Badge>
                </div>
              </div>

              {user.id === currentUserId ? (
                <p className="mt-3 text-sm text-muted-foreground">This is your account. Role and status cannot be changed here.</p>
              ) : (
                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <ActionForm action={updateUserRole} buttonLabel="Save Role" className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="role" defaultValue={user.role} className="h-10 rounded-md border bg-background px-3 text-sm">
                      {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </ActionForm>

                  {user.isActive ? (
                    <ActionForm action={setUserActiveStatus} buttonLabel="Disable User" className="space-y-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="isActive" value="false" />
                    </ActionForm>
                  ) : (
                    <ActionForm action={setUserActiveStatus} buttonLabel="Reactivate User" className="space-y-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="isActive" value="true" />
                    </ActionForm>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No users match your filters.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
