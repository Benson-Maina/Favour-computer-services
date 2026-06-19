"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container py-24 text-center">
      <h1 className="text-4xl font-black">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-xl text-muted-foreground">The page could not finish loading. Please retry, or contact Favour Computer Services if the issue continues.</p>
      <Button className="mt-6" onClick={reset}><RotateCcw className="mr-2 size-4" />Retry</Button>
    </section>
  );
}
