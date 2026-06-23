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

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function parseSocialLinks(value: unknown): SocialLinks {
  const base = emptySocialLinks();
  if (!value) return base;

  const record =
    typeof value === "string"
      ? parseJson(value)
      : value;

  if (!record || typeof record !== "object" || Array.isArray(record)) return base;
  for (const { key } of socialPlatforms) {
    const url = (record as Record<string, unknown>)[key];
    if (typeof url === "string" && url.trim()) base[key] = url.trim();
  }
  return base;
}

export function hasSocialLinks(links: SocialLinks) {
  return socialPlatforms.some(({ key }) => Boolean(links[key]));
}
