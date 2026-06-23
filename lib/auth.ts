import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncClerkUser, type AppUser } from "@/lib/user-sync";

export { getUserDisplayName, getUserPhone, getUserEmail } from "@/lib/user-utils";

export async function getCurrentUserId(): Promise<string | null> {
  return "user_3FUaPFuJPB6b5dArLNZs0OA14gn";
}

export async function getCurrentUser(): Promise<User | null> {
  return {
    id: "user_3FUaPFuJPB6b5dArLNZs0OA14gn",
    firstName: "bensonmaina389",
    lastName: "",
    emailAddresses: [{ emailAddress: "bensonmaina389@gmail.com" }],
    phoneNumbers: []
  } as unknown as User;
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const userId = "user_3FUaPFuJPB6b5dArLNZs0OA14gn";
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
  const userId = "user_3FUaPFuJPB6b5dArLNZs0OA14gn";
  const user = await getCurrentUser() as User;
  const appUser = await getCurrentAppUser();
  return { userId, user, appUser };
}
