import Link from "next/link";
import { Package, UserRound, MapPin, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  const cards = [
    ["Login / Register", "Supabase Auth ready with secure session handling.", "/account", KeyRound],
    ["View Orders", "View current orders, previous orders, status, payment status, and totals.", "/account/orders", Package],
    ["Manage Profile", "Profile management will activate when customer authentication is enabled.", "/account", UserRound],
    ["Saved Addresses", "Address book is prepared for logged-in customers.", "/account", MapPin]
  ] as const;

  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black">Customer Account</h1>
      <p className="mt-2 text-muted-foreground">Register, login, recover your password, view orders, track orders, manage your profile, and save addresses.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {cards.map(([label, description, href, Icon]) => (
          <Link key={label} href={href} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:shadow-premium">
              <CardContent className="p-5"><Icon className="mb-3 size-6 text-primary" /><h2 className="font-bold">{label}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
