import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, getUserEmail } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View your CCTV installation and live streaming booking requests."
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function BookingsPage() {
  const { user } = await requireUser();
  const email = getUserEmail(user);
  const supabase = createAdminClient();
  const { data } = supabase
    ? await supabase.from("bookings").select("*").eq("email", email).order("created_at", { ascending: false })
    : { data: [] };
  const bookings = data ?? [];

  if (!bookings.length) {
    return (
      <section className="container py-16 text-center">
        <CalendarDays className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-4xl font-black">No bookings yet</h1>
        <p className="mt-2 text-muted-foreground">Service booking requests linked to your email will appear here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/cctv-installation-nairobi">Book CCTV Installation</Link></Button>
          <Button asChild variant="outline"><Link href="/live-streaming-nairobi">Book Live Streaming</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black">My Bookings</h1>
      <p className="mt-2 text-muted-foreground">CCTV installation and live streaming requests for {email}.</p>
      <div className="mt-8 space-y-4">
        {bookings.map((booking) => {
          const row = booking as Row;
          return (
            <Card key={text(row.id)}>
              <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">{text(row.service)}</h2>
                    <Badge>{text(row.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Submitted {new Date(text(row.created_at)).toLocaleDateString()}
                    {text(row.preferred_date) ? ` | Preferred: ${text(row.preferred_date)}` : ""}
                  </p>
                  <p className="mt-2 text-sm">{text(row.message)}</p>
                </div>
                <Button asChild variant="outline"><Link href="/contact">Contact Support</Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
