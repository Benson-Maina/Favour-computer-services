import type { User } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { privilegedRoles, type AppRole } from "@/lib/admin-permissions";
import { getUserDisplayName, getUserEmail, getUserPhone } from "@/lib/user-utils";

export type AppUserRole = AppRole;

export type AppUser = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: AppUserRole;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClerkWebhookUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address: string }>;
  phone_numbers?: Array<{ phone_number: string }>;
};

function profileFromClerkUser(user: User) {
  return {
    full_name: getUserDisplayName(user),
    phone: getUserPhone(user) || null,
    email: getUserEmail(user) || null
  };
}

function profileFromWebhook(data: ClerkWebhookUser) {
  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    data.email_addresses?.[0]?.email_address?.split("@")[0] ||
    "Customer";
  return {
    full_name: fullName,
    phone: data.phone_numbers?.[0]?.phone_number || null,
    email: data.email_addresses?.[0]?.email_address || null
  };
}

function isPrivilegedRole(role: unknown): role is AppUserRole {
  return typeof role === "string" && privilegedRoles.includes(role as AppUserRole);
}

async function upsertUserProfile(
  id: string,
  profile: { full_name: string; phone: string | null; email: string | null }
): Promise<AppUser | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("users")
    .select("id, role, is_active, deleted_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        deleted_at: null,
        is_active: true
      })
      .eq("id", id)
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
      id,
      full_name: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      role: "customer",
      is_active: true
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: raced } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
      return raced as AppUser | null;
    }
    console.error("User profile insert error:", error);
    return null;
  }
  return data as AppUser;
}

export async function syncClerkUser(user: User): Promise<AppUser | null> {
  return upsertUserProfile(user.id, profileFromClerkUser(user));
}

export async function syncClerkUserFromWebhook(data: ClerkWebhookUser): Promise<AppUser | null> {
  return upsertUserProfile(data.id, profileFromWebhook(data));
}

export async function softDeleteClerkUser(clerkUserId: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { data: existing } = await supabase
    .from("users")
    .select("role")
    .eq("id", clerkUserId)
    .maybeSingle();

  if (!existing) return true;

  if (isPrivilegedRole(existing.role)) {
    const { error } = await supabase
      .from("users")
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq("id", clerkUserId);
    if (error) {
      console.error("Privileged user soft-delete error:", error);
      return false;
    }
    return true;
  }

  const { error } = await supabase
    .from("users")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("id", clerkUserId);

  if (error) {
    console.error("User soft-delete error:", error);
    return false;
  }
  return true;
}

export async function backfillUserFromClerkApi(user: ClerkWebhookUser & { created_at?: number }) {
  const supabase = createAdminClient();
  if (!supabase) return { inserted: false, skipped: true };

  const profile = profileFromWebhook(user);
  const { data: existing } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("users")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email
      })
      .eq("id", user.id);
    return { inserted: false, skipped: false, preservedRole: existing.role };
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toISOString()
    : new Date().toISOString();

  const { error } = await supabase.from("users").insert({
    id: user.id,
    full_name: profile.full_name,
    phone: profile.phone,
    email: profile.email,
    role: "customer",
    is_active: true,
    created_at: createdAt
  });

  if (error) {
    console.error("Backfill insert error:", error);
    return { inserted: false, skipped: false, error: error.message };
  }
  return { inserted: true, skipped: false };
}
