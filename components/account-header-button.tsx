"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountHeaderButton() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="size-9" aria-hidden />;
  }

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <Button asChild variant="ghost" size="icon" aria-label="Sign in">
      <Link href="/sign-in"><UserRound className="size-5" /></Link>
    </Button>
  );
}
