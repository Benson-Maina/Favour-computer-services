import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/auth-forms";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a Favour Computer Services customer account."
};

export default function RegisterPage() {
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </section>
  );
}
