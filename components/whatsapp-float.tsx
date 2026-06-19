import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/utils";

export function WhatsappFloat() {
  return (
    <Link
      href={whatsappUrl("Hello Favour Computer Services. I would like assistance.")}
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      aria-label="WhatsApp Favour Computer Services"
      target="_blank"
    >
      <MessageCircle className="size-5" />
      <span>WhatsApp</span>
    </Link>
  );
}
