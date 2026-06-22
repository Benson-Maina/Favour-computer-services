import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import type { SocialLinks, SocialPlatform } from "@/lib/social-links";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  links: SocialLinks;
  className?: string;
  iconClassName?: string;
  variant?: "default" | "footer";
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.07a4.85 4.85 0 0 1-1.01-.62z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const iconMap: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTokIcon,
  x: XIcon,
  youtube: Youtube,
  linkedin: Linkedin
};

const labelMap: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn"
};

export function SocialLinksIcons({ links, className, iconClassName, variant = "default" }: SocialLinksProps) {
  const entries = (Object.keys(links) as SocialPlatform[]).filter((key) => links[key]);

  if (!entries.length) return null;

  const baseIcon = iconClassName ?? "size-4";
  const linkClass =
    variant === "footer"
      ? "inline-flex size-9 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      : "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {entries.map((platform) => {
        const Icon = iconMap[platform];
        return (
          <a
            key={platform}
            href={links[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label={labelMap[platform]}
          >
            <Icon className={baseIcon} />
          </a>
        );
      })}
    </div>
  );
}
