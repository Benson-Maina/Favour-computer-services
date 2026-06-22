export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "x" | "youtube" | "linkedin";

export type SocialLinks = Record<SocialPlatform, string>;

export const socialPlatforms: { key: SocialPlatform; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X (Twitter)" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" }
];

export const emptySocialLinks = (): SocialLinks => ({
  facebook: "",
  instagram: "",
  tiktok: "",
  x: "",
  youtube: "",
  linkedin: ""
});

export function parseSocialLinks(value: unknown): SocialLinks {
  const base = emptySocialLinks();
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const record = value as Record<string, unknown>;
  for (const { key } of socialPlatforms) {
    const url = record[key];
    if (typeof url === "string" && url.trim()) base[key] = url.trim();
  }
  return base;
}

export function hasSocialLinks(links: SocialLinks) {
  return socialPlatforms.some(({ key }) => Boolean(links[key]));
}
