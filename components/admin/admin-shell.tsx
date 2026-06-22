"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Permission } from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

type BadgeCounts = {
  newInquiries?: number;
  newBookings?: number;
  inventoryAlerts?: number;
};

export function AdminShell({
  children,
  permissions,
  adminRole,
  badges
}: {
  children: React.ReactNode;
  permissions: Permission[];
  adminRole: string;
  badges?: BadgeCounts;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar permissions={permissions} adminRole={adminRole} badges={badges} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-64 shadow-xl">
            <AdminSidebar permissions={permissions} adminRole={adminRole} badges={badges} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
            <p className="text-sm font-semibold text-foreground lg:hidden">Admin</p>
          </div>
          <ThemeToggle />
        </header>
        <main className={cn("flex-1 p-4 md:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}
