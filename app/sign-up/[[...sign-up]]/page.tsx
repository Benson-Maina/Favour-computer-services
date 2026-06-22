import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Favour Computer Services customer account."
};

export default function SignUpPage() {
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/account"
        fallbackRedirectUrl="/account"
      />
    </section>
  );
}
