import type { Metadata } from "next";
import { LoginForm } from "@/components/account/auth-forms";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Favour Computer Services customer account."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <LoginForm next={next || "/account"} />
      </div>
    </section>
  );
}
