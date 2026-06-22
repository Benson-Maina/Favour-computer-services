import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BlogPostsTable } from "@/components/admin/blog-posts-table";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadBlogPosts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  await requireAdminPage("blog:read");
  const posts = await loadBlogPosts();
  return (
    <div>
      <AdminPageHeader title="Blog" description="View published and draft blog posts." />
      <BlogPostsTable posts={posts} />
    </div>
  );
}
