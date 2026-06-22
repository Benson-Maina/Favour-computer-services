import type { User } from "@clerk/nextjs/server";

export function getUserDisplayName(user: User, fallback = "Customer") {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || fallback;
}

export function getUserPhone(user: User) {
  return user.phoneNumbers[0]?.phoneNumber ?? "";
}

export function getUserEmail(user: User) {
  return user.emailAddresses[0]?.emailAddress ?? "";
}
