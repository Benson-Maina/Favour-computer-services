"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCategory, saveCategory } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryRecord } from "@/lib/admin-data";

export function CategoriesManager({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRecord | null>(null);

  return (
    <div className="space-y-6">
      <ActionForm action={saveCategory} buttonLabel={editing ? "Update Category" : "Add Category"} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto]">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Input name="name" defaultValue={editing?.name ?? ""} placeholder="Category name" required key={editing?.id ?? "new"} />
        {editing ? (
          <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
        ) : null}
      </ActionForm>

      <AdminDataTable
        rows={categories}
        searchPlaceholder="Search categories..."
        getSearchText={(row) => row.name}
        columns={[
          { key: "name", header: "Category Name", sortable: true, sortValue: (row) => row.name, render: (row) => row.name },
          { key: "count", header: "Products", sortable: true, sortValue: (row) => row.productCount, render: (row) => row.productCount },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(row)}>Edit</Button>
                <form
                  action={async (formData) => {
                    const result = await deleteCategory({ ok: false, message: "" }, formData);
                    if (result.ok) router.refresh();
                  }}
                >
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" size="sm" variant="ghost" disabled={row.productCount > 0}>Delete</Button>
                </form>
              </div>
            )
          }
        ]}
        emptyTitle="No categories yet."
      />
    </div>
  );
}
