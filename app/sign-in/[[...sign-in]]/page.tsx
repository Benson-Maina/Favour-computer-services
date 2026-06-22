import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Favour Computer Services customer account."
};

export default function SignInPage() {
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/account"
        fallbackRedirectUrl="/account"
      />
    </section>
  );
}
