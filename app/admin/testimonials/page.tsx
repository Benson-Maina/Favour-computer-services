import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TestimonialsTable } from "@/components/admin/testimonials-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadTestimonials } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requireAdminPage("testimonials:write");
  const [testimonials, permissions] = await Promise.all([loadTestimonials(), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Approve testimonials shown on the storefront." />
      <TestimonialsTable testimonials={testimonials} canWrite={permissions.includes("testimonials:write")} />
    </div>
  );
}
