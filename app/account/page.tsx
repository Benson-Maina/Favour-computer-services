import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, MapPin, Package, UserRound } from "lucide-react";
import { deleteAddress, logoutCustomer, saveAddress, saveProfile } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  const serverSupabase = await createClient();
  const { data: userData } = serverSupabase ? await serverSupabase.auth.getUser() : { data: { user: null } };
  if (!userData.user) redirect("/account/login?next=/account");

  const supabase = createAdminClient();
  const [profileResult, addressesResult] = supabase
    ? await Promise.all([
        supabase.from("users").select("*").eq("id", userData.user.id).single(),
        supabase.from("addresses").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false })
      ])
    : [{ data: null }, { data: [] }];

  const profile = (profileResult.data ?? {}) as Row;
  const addresses = (addressesResult.data ?? []) as Row[];
  const fullName = text(profile.full_name, text(userData.user.user_metadata?.full_name, ""));
  const phone = text(profile.phone, text(userData.user.user_metadata?.phone, ""));

  return (
    <section className="container py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Customer Account</p>
          <h1 className="text-4xl font-black">Profile & Orders</h1>
          <p className="mt-2 text-muted-foreground">Manage your customer details, delivery addresses, and order history.</p>
        </div>
        <form action={logoutCustomer}>
          <Button variant="outline"><LogOut className="mr-2 size-4" />Logout</Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Profile</h2>
            </div>
            <ActionForm action={saveProfile} buttonLabel="Save Profile">
              <label className="grid gap-2 text-sm font-medium">Full name<Input name="fullName" defaultValue={fullName} required minLength={2} /></label>
              <label className="grid gap-2 text-sm font-medium">Email<Input value={userData.user.email ?? ""} disabled /></label>
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
            <p className="text-sm text-muted-foreground">View order status, payment status, totals, and line items for purchases made while signed in.</p>
            <Button asChild className="mt-5 w-full"><Link href="/account/orders">View Orders</Link></Button>
          </CardContent>
        </Card>
      </div>

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
