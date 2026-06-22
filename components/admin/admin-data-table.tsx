"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminSelect } from "@/components/admin/admin-select";
import { cn } from "@/lib/utils";

export type AdminColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  searchValue?: (row: T) => string;
};

export type AdminFilter<T> = {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  match: (row: T, value: string) => boolean;
};

type AdminDataTableProps<T extends { id: string }> = {
  rows: T[];
  columns: AdminColumn<T>[];
  filters?: AdminFilter<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  bulkActions?: { label: string; value: string; variant?: "default" | "destructive" }[];
  onBulkAction?: (action: string, ids: string[]) => void;
  emptyTitle?: string;
  getSearchText?: (row: T) => string;
};

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  filters = [],
  searchPlaceholder = "Search...",
  pageSize = 15,
  bulkActions = [],
  onBulkAction,
  emptyTitle = "No records found.",
  getSearchText
}: AdminDataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState(bulkActions[0]?.value ?? "");

  const filtered = useMemo(() => {
    let result = [...rows];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((row) => {
        const text = getSearchText?.(row) ?? columns.map((col) => col.searchValue?.(row) ?? "").join(" ");
        return text.toLowerCase().includes(q);
      });
    }
    filters.forEach((filter) => {
      const value = filterValues[filter.key];
      if (value && value !== "all") result = result.filter((row) => filter.match(row, value));
    });
    if (sortKey) {
      const column = columns.find((col) => col.key === sortKey);
      if (column?.sortValue) {
        result.sort((a, b) => {
          const av = column.sortValue!(a);
          const bv = column.sortValue!(b);
          if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
          return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
      }
    }
    return result;
  }, [rows, query, filterValues, sortKey, sortDir, columns, filters, getSearchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(row.id));

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleAllPage(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      pageRows.forEach((row) => (checked ? next.add(row.id) : next.delete(row.id)));
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <AdminSelect
              key={filter.key}
              value={filterValues[filter.key] ?? "all"}
              onChange={(event) => {
                setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }));
                setPage(1);
              }}
              className="w-auto min-w-[140px]"
            >
              <option value="all">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          ))}
        </div>
      </div>

      {bulkActions.length && onBulkAction ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <AdminSelect value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} className="w-auto min-w-[160px]">
            {bulkActions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </AdminSelect>
          <Button
            size="sm"
            variant={bulkActions.find((a) => a.value === bulkAction)?.variant === "destructive" ? "destructive" : "default"}
            disabled={!selected.size}
            onClick={() => onBulkAction(bulkAction, Array.from(selected))}
          >
            Apply
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {bulkActions.length ? (
                <TableHead className="w-10">
                  <Checkbox checked={allPageSelected} onCheckedChange={(value) => toggleAllPage(Boolean(value))} aria-label="Select all on page" />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-foreground">
                      {column.header}
                      <span className={cn("text-[10px]", sortKey === column.key ? "text-primary" : "text-muted-foreground")}>
                        {sortKey === column.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row) => (
                <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                  {bulkActions.length ? (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={(value) =>
                          setSelected((current) => {
                            const next = new Set(current);
                            if (value) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          })
                        }
                        aria-label={`Select ${row.id}`}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (bulkActions.length ? 1 : 0)} className="py-10 text-center text-muted-foreground">
                  {emptyTitle}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="min-w-[80px] text-center text-foreground">
            Page {currentPage} / {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
