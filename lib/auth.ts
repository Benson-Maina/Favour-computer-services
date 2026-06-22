import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncClerkUser, type AppUser } from "@/lib/user-sync";

export { getUserDisplayName, getUserPhone, getUserEmail } from "@/lib/user-utils";

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUser(): Promise<User | null> {
  return currentUser();
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!data || data.deleted_at || data.is_active === false) return null;
  return data as AppUser;
}

export async function requireUser(): Promise<{ userId: string; user: User; appUser: AppUser | null }> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be signed in.");
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in.");

  const appUser = await syncClerkUser(user);
  if (appUser && (appUser.deleted_at || appUser.is_active === false)) {
    throw new Error("Your account is disabled. Contact support.");
  }

  return { userId, user, appUser };
}
