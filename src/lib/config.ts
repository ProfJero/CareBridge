/**
 * Business details shown across the site. Values that differ per deployment can
 * be overridden with VITE_* variables (Cloudflare Pages → Settings → Variables).
 */
const env = import.meta.env as Record<string, string | undefined>;

export const SITE = {
  name: "Sambea Son and Daughter Home Care",
  shortName: "Sambea S&D Home Care",
  town: "Assin Foso",
  region: "Central Region",
  country: "Ghana",
  tagline: "Compassionate home care in Assin Foso",
  /** Receives every form submission (applications, care requests, order alerts). */
  inbox: "beagracelyn@gmail.com",
  phone: env.VITE_CONTACT_PHONE ?? "",
  whatsapp: env.VITE_CONTACT_WHATSAPP ?? "",
  momoMerchant: env.VITE_MOMO_MERCHANT_NUMBER ?? "",
  momoMerchantName: env.VITE_MOMO_MERCHANT_NAME ?? "Sambea Son and Daughter Home Care",
} as const;

/** Publishable keys only — safe in the browser. Data is protected by RLS. */
export const SUPABASE_URL = env.VITE_SUPABASE_URL ?? "https://przzvfbnimlevhrarctk.supabase.co";
export const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_jb9NAdz9VQImh3SY4Awhpw_vZMCt-cU";

export const CLOUDINARY = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME ?? "",
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "",
};

export const GHANA_REGIONS = [
  "Central Region",
  "Greater Accra Region",
  "Ashanti Region",
  "Western Region",
  "Western North Region",
  "Eastern Region",
  "Volta Region",
  "Oti Region",
  "Bono Region",
  "Bono East Region",
  "Ahafo Region",
  "Northern Region",
  "Savannah Region",
  "North East Region",
  "Upper East Region",
  "Upper West Region",
] as const;

export const NEARBY_TOWNS = [
  "Assin Foso",
  "Assin Bereku",
  "Assin Praso",
  "Assin Manso",
  "Assin Nyankumasi",
  "Assin Darmang",
  "Twifo Praso",
  "Cape Coast",
] as const;

/** Mirrors the fee rule in the `place_order` database function. */
export function deliveryFee(method: "delivery" | "pickup", town: string, region: string) {
  if (method === "pickup") return 0;
  if (town.trim().toLowerCase().startsWith("assin fo")) return 10;
  if (region.toLowerCase().startsWith("central")) return 25;
  return 45;
}
