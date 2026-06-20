import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/account/auth-forms";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset email."
};

export default function ResetPasswordPage() {
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <PasswordResetForm />
      </div>
    </section>
  );
}
