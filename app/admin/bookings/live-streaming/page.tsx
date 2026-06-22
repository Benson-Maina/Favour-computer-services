import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getAdminPermissions, requireAdminPage } from "@/lib/admin-auth";
import { loadBookings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Live Streaming Bookings" };

export default async function AdminLiveStreamingBookingsPage() {
  await requireAdminPage("bookings:read");
  const [bookings, permissions] = await Promise.all([loadBookings("live-streaming"), getAdminPermissions()]);
  return (
    <div>
      <AdminPageHeader title="Live Streaming Bookings" description="Live streaming service booking requests." />
      <BookingsTable bookings={bookings} canWrite={permissions.includes("bookings:write")} />
    </div>
  );
}
