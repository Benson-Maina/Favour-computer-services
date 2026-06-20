"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { loginCustomer, registerCustomer, sendPasswordReset, updatePassword } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type State = { ok: boolean; message: string };

function Message({ state }: { state: State }) {
  if (!state.message) return null;
  return <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p>;
}

export function LoginForm({ next = "/account" }: { next?: string }) {
  const [state, action, pending] = useActionState(loginCustomer, { ok: false, message: "" });
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h1 className="text-3xl font-black">Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Access orders, profile details, saved addresses, and admin tools if your account has an admin role.</p>
        </div>
        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
          <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required minLength={6} />
          <Button disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogIn className="mr-2 size-4" />}
            Login
          </Button>
          <Message state={state} />
        </form>
        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <Link href="/account/register" className="text-primary hover:underline">Create account</Link>
          <Link href="/account/reset-password" className="text-primary hover:underline">Reset password</Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerCustomer, { ok: false, message: "" });
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h1 className="text-3xl font-black">Register</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create a customer account for checkout history, profile details, and saved delivery addresses.</p>
        </div>
        <form action={action} className="space-y-4">
          <Input name="fullName" placeholder="Full name" autoComplete="name" required minLength={2} />
          <Input name="phone" placeholder="Phone" autoComplete="tel" minLength={7} />
          <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
          <Input name="password" type="password" placeholder="Password" autoComplete="new-password" required minLength={8} />
          <Input name="confirmPassword" type="password" placeholder="Confirm password" autoComplete="new-password" required minLength={8} />
          <Button disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
            Create Account
          </Button>
          <Message state={state} />
        </form>
        <p className="text-sm text-muted-foreground">Already registered? <Link href="/account/login" className="text-primary hover:underline">Login</Link></p>
      </CardContent>
    </Card>
  );
}

export function PasswordResetForm() {
  const [state, action, pending] = useActionState(sendPasswordReset, { ok: false, message: "" });
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h1 className="text-3xl font-black">Reset Password</h1>
        <form action={action} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
          <Button disabled={pending} className="w-full">{pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Send Reset Link</Button>
          <Message state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, { ok: false, message: "" });
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h1 className="text-3xl font-black">Set New Password</h1>
        <form action={action} className="space-y-4">
          <Input name="password" type="password" placeholder="New password" autoComplete="new-password" required minLength={8} />
          <Input name="confirmPassword" type="password" placeholder="Confirm password" autoComplete="new-password" required minLength={8} />
          <Button disabled={pending} className="w-full">{pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Update Password</Button>
          <Message state={state} />
        </form>
        {state.ok ? <Button asChild variant="outline" className="w-full"><Link href="/account">Go to Account</Link></Button> : null}
      </CardContent>
    </Card>
  );
}
