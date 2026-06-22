import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewsletterTable } from "@/components/admin/newsletter-table";
import { requireAdminPage } from "@/lib/admin-auth";
import { loadNewsletterSubscribers } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage() {
  await requireAdminPage("customers:read");
  const subscribers = await loadNewsletterSubscribers();
  return (
    <div>
      <AdminPageHeader title="Newsletter" description="View newsletter subscriber list." />
      <NewsletterTable subscribers={subscribers} />
    </div>
  );
}
