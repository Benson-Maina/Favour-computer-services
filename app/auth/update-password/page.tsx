import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new account password."
};

export default function UpdatePasswordPage() {
  return (
    <section className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </section>
  );
}
