import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container py-24 text-center">
      <h1 className="text-4xl font-black">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you requested is not available.</p>
      <Button asChild className="mt-6"><Link href="/">Back Home</Link></Button>
    </section>
  );
}
