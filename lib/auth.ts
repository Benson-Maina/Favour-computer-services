import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { syncClerkUser } from "@/lib/user-sync";

export { getUserDisplayName, getUserPhone, getUserEmail } from "@/lib/user-utils";

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUser(): Promise<User | null> {
  return currentUser();
}

export async function requireUser(): Promise<{ userId: string; user: User }> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be signed in.");
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in.");
  await syncClerkUser(user);
  return { userId, user };
}
