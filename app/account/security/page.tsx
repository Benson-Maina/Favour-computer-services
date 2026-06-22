import type { Metadata } from "next";
import { UserProfile } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Account Security",
  description: "Manage your password, email, and security settings."
};

export default function AccountSecurityPage() {
  return (
    <section className="container py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-primary">Account Security</p>
        <h1 className="text-4xl font-black">Password & Security</h1>
        <p className="mt-2 text-muted-foreground">Update your password, email address, and connected accounts.</p>
      </div>
      <UserProfile routing="hash" />
    </section>
  );
}
