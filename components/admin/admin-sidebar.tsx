"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { filterNavGroups, type AdminNavGroup } from "@/lib/admin-nav";
import type { Permission } from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

type BadgeCounts = {
  newInquiries?: number;
  newBookings?: number;
  inventoryAlerts?: number;
};

export function AdminSidebar({
  permissions,
  adminRole,
  badges
}: {
  permissions: Permission[];
  adminRole: string;
  badges?: BadgeCounts;
}) {
  const pathname = usePathname();
  const groups = useMemo(() => filterNavGroups(permissions), [permissions]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("admin-nav-groups");
    if (stored) {
      try {
        setOpenGroups(JSON.parse(stored) as Record<string, boolean>);
      } catch {
        /* ignore */
      }
    } else {
      const initial: Record<string, boolean> = {};
      groups.forEach((group) => {
        initial[group.title] = true;
      });
      setOpenGroups(initial);
    }
  }, [groups]);

  function toggleGroup(title: string) {
    setOpenGroups((current) => {
      const next = { ...current, [title]: !current[title] };
      localStorage.setItem("admin-nav-groups", JSON.stringify(next));
      return next;
    });
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function badgeFor(key?: keyof BadgeCounts) {
    if (!key || !badges) return null;
    const value = badges[key];
    if (!value) return null;
    return (
      <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
        {value > 99 ? "99+" : value}
      </span>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-5">
        <Link href="/admin" className="block">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Favour Admin</p>
          <p className="text-sm font-semibold text-foreground">Store Management</p>
        </Link>
        <p className="mt-1 text-xs capitalize text-muted-foreground">{adminRole.replace("_", " ")}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <NavGroup
            key={group.title}
            group={group}
            open={openGroups[group.title] ?? true}
            onToggle={() => toggleGroup(group.title)}
            isActive={isActive}
            badgeFor={badgeFor}
          />
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Back to storefront
        </Link>
      </div>
    </aside>
  );
}

function NavGroup({
  group,
  open,
  onToggle,
  isActive,
  badgeFor
}: {
  group: AdminNavGroup;
  open: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  badgeFor: (key?: keyof BadgeCounts) => React.ReactNode;
}) {
  const hasActive = group.items.some((item) => isActive(item.href));

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground",
          hasActive && "text-foreground"
        )}
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        {group.title}
      </button>
      {open ? (
        <ul className="mt-1 space-y-0.5 pl-1">
          {group.items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                  {badgeFor(item.badgeKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
