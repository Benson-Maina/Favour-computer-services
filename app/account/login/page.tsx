import { redirect } from "next/navigation";

export default async function LegacyLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = next ? `/sign-in?redirect_url=${encodeURIComponent(next)}` : "/sign-in";
  redirect(target);
}
