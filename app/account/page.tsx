import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, LogOut, MapPin, Package, Shield, UserRound } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { deleteAddress, saveAddress, saveProfile } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, getUserDisplayName, getUserPhone, getUserEmail } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Customer Account",
  description: "Manage your Favour Computer Services customer profile, addresses, and orders."
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown) {
  return Boolean(value);
}

export default async function AccountPage() {
  const { userId, user } = await requireUser();
  const supabase = createAdminClient();
  const [profileResult, addressesResult] = supabase
    ? await Promise.all([
        supabase.from("users").select("*").eq("id", userId).maybeSingle(),
        supabase.from("addresses").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      ])
    : [{ data: null }, { data: [] }];

  const profile = (profileResult.data ?? {}) as Row;
  const addresses = (addressesResult.data ?? []) as Row[];
  const fullName = text(profile.full_name, getUserDisplayName(user));
  const phone = text(profile.phone, getUserPhone(user));
  const email = getUserEmail(user);

  return (
    <section className="container py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Customer Account</p>
          <h1 className="text-4xl font-black">Account Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your profile, delivery addresses, orders, and bookings.</p>
        </div>
        <SignOutButton redirectUrl="/">
          <Button variant="outline"><LogOut className="mr-2 size-4" />Sign Out</Button>
        </SignOutButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Profile</h2>
            </div>
            <ActionForm action={saveProfile} buttonLabel="Save Profile">
              <label className="grid gap-2 text-sm font-medium">Full name<Input name="fullName" defaultValue={fullName} required minLength={2} /></label>
              <label className="grid gap-2 text-sm font-medium">Email<Input value={email} disabled /></label>
              <label className="grid gap-2 text-sm font-medium">Phone<Input name="phone" defaultValue={phone} minLength={7} /></label>
            </ActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Orders</h2>
            </div>
            <p className="text-sm text-muted-foreground">View order status, payment status, totals, and line items.</p>
            <Button asChild className="mt-5 w-full"><Link href="/account/orders">View Orders</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Bookings</h2>
            </div>
            <p className="text-sm text-muted-foreground">Track CCTV installation and live streaming booking requests.</p>
            <Button asChild className="mt-5 w-full" variant="outline"><Link href="/account/bookings">View Bookings</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Password & Security</h2>
              <p className="text-sm text-muted-foreground">Update your password, email, and security settings.</p>
            </div>
          </div>
          <Button asChild variant="outline"><Link href="/account/security">Manage Security</Link></Button>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Add Address</h2>
            </div>
            <ActionForm action={saveAddress} buttonLabel="Save Address">
              <label className="grid gap-2 text-sm font-medium">Label<Input name="label" placeholder="Home, Office, Shop pickup" required minLength={2} /></label>
              <label className="grid gap-2 text-sm font-medium">Recipient<Input name="recipientName" defaultValue={fullName} required minLength={2} /></label>
              <label className="grid gap-2 text-sm font-medium">Phone<Input name="phone" defaultValue={phone} required minLength={7} /></label>
              <label className="grid gap-2 text-sm font-medium">Address<Input name="addressLine" required minLength={5} /></label>
              <label className="grid gap-2 text-sm font-medium">City<Input name="city" defaultValue="Nairobi" required minLength={2} /></label>
              <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" />Set as default</label>
            </ActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Saved Addresses</h2>
            <div className="space-y-4">
              {addresses.length ? addresses.map((address) => (
                <div key={text(address.id)} className="rounded-md border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{text(address.label)}{bool(address.is_default) ? " (Default)" : ""}</p>
                      <p className="text-sm text-muted-foreground">{text(address.recipient_name)} | {text(address.phone)}</p>
                    </div>
                    <ActionForm action={deleteAddress} buttonLabel="Delete" className="w-28">
                      <input type="hidden" name="id" value={text(address.id)} />
                    </ActionForm>
                  </div>
                  <ActionForm action={saveAddress} buttonLabel="Update Address">
                    <input type="hidden" name="id" value={text(address.id)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input name="label" defaultValue={text(address.label)} required />
                      <Input name="recipientName" defaultValue={text(address.recipient_name)} required />
                      <Input name="phone" defaultValue={text(address.phone)} required />
                      <Input name="city" defaultValue={text(address.city, "Nairobi")} required />
                    </div>
                    <Input name="addressLine" defaultValue={text(address.address_line)} required />
                    <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" defaultChecked={bool(address.is_default)} />Default address</label>
                  </ActionForm>
                </div>
              )) : <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No saved addresses yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
