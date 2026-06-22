import type { User } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserDisplayName, getUserPhone } from "@/lib/user-utils";

export type AppUserRole = "customer" | "staff" | "admin" | "super_admin";

export type AppUser = {
  id: string;
  full_name: string;
  phone: string | null;
  role: AppUserRole;
  created_at: string;
};

function clerkProfile(user: User) {
  return {
    full_name: getUserDisplayName(user),
    phone: getUserPhone(user) || null
  };
}

export async function syncClerkUser(user: User): Promise<AppUser | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const profile = clerkProfile(user);
  const { data: existing } = await supabase
    .from("users")
    .select("id, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id)
      .select("*")
      .single();
    if (error) {
      console.error("User profile update error:", error);
      return null;
    }
    return data as AppUser;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: "customer"
    })
    .select("*")
    .single();

  if (error) {
    console.error("User profile insert error:", error);
    return null;
  }
  return data as AppUser;
}

export async function syncClerkUserFromWebhook(data: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address: string }>;
  phone_numbers?: Array<{ phone_number: string }>;
}): Promise<AppUser | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    data.email_addresses?.[0]?.email_address?.split("@")[0] ||
    "Customer";
  const phone = data.phone_numbers?.[0]?.phone_number || null;

  const { data: existing } = await supabase
    .from("users")
    .select("id, role, created_at")
    .eq("id", data.id)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("users")
      .update({ full_name: fullName, phone })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) {
      console.error("Webhook user update error:", error);
      return null;
    }
    return updated as AppUser;
  }

  const { data: inserted, error } = await supabase
    .from("users")
    .insert({ id: data.id, full_name: fullName, phone, role: "customer" })
    .select("*")
    .single();

  if (error) {
    console.error("Webhook user insert error:", error);
    return null;
  }
  return inserted as AppUser;
}
