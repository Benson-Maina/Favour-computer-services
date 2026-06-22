"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type State = { ok: boolean; message: string };

export function ActionForm({
  action,
  children,
  buttonLabel,
  className
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  children: React.ReactNode;
  buttonLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className={className ?? "space-y-4"}>
      {children}
      <Button disabled={pending} className="w-full">
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {buttonLabel}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{state.message}</p>
      ) : null}
    </form>
  );
}
