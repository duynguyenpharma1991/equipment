function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// NEXT_PUBLIC_* variables must be referenced statically so Next can inline them.
export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    key: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

/**
 * Canonical origin for sitemap, hreflang, Open Graph and JSON-LD.
 * Order: explicit NEXT_PUBLIC_SITE_URL -> Vercel's production domain (system
 * variable, no protocol) -> localhost for local development.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = explicit || (vercelProd ? `https://${vercelProd}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export function getFallbackContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
}
