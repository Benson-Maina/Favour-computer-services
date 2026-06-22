"use client";

import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlogPostRecord } from "@/lib/admin-data";

export function BlogPostsTable({ posts }: { posts: BlogPostRecord[] }) {
  return (
    <AdminDataTable
      rows={posts}
      searchPlaceholder="Search blog posts..."
      getSearchText={(row) => `${row.title} ${row.category}`}
      filters={[
        {
          key: "status",
          label: "All statuses",
          options: [
            { label: "Published", value: "published" },
            { label: "Draft", value: "draft" },
            { label: "Scheduled", value: "scheduled" }
          ],
          match: (row, value) => {
            if (value === "published") return row.published;
            if (value === "draft") return row.draft;
            return Boolean(row.scheduledAt);
          }
        }
      ]}
      columns={[
        { key: "title", header: "Title", sortable: true, sortValue: (row) => row.title, render: (row) => row.title },
        { key: "category", header: "Category", render: (row) => row.category || "Uncategorized" },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <Badge variant="outline">
              {row.published ? "Published" : row.scheduledAt ? "Scheduled" : row.draft ? "Draft" : "Unpublished"}
            </Badge>
          )
        },
        {
          key: "date",
          header: "Created",
          sortable: true,
          sortValue: (row) => row.createdAt,
          render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
          key: "actions",
          header: "Actions",
          render: (row) => (
            <Button asChild size="sm" variant="outline">
              <Link href={`/blog/${row.slug}`} target="_blank">View</Link>
            </Button>
          )
        }
      ]}
      emptyTitle="No blog posts yet."
    />
  );
}
