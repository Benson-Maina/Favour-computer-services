import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadBookings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "CCTV Bookings" };

export default async function AdminCctvBookingsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  await requireAdminPage("bookings:read");
  const { status, search } = await searchParams;
  const [bookings, permissions] = await Promise.all([loadBookings("cctv"), getAdminPermissions()]);
  const initialFilterValues: Record<string, string> = status ? { status } : {};
  return (
    <div>
      <AdminPageHeader title="CCTV Bookings" description="Installation and quote requests for CCTV services." />
      <BookingsTable
        bookings={bookings}
        canWrite={permissions.includes("bookings:write")}
        initialFilterValues={initialFilterValues}
        initialSearch={search ?? ""}
      />
    </div>
  );
}
