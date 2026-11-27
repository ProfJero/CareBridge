/**
 * Business details shown across the site. Values that differ per deployment can
 * be overridden with VITE_* variables (Cloudflare Pages → Settings → Variables).
 */
const env = import.meta.env as Record<string, string | undefined>;

export const SITE = {
  name: "JonnyBee Home Care",
  shortName: "JonnyBee Care",
  town: "Assin Foso",
  region: "Central Region",
  country: "Ghana",
  tagline: "Caring Today... Supporting Tomorrow",
  /** Receives every form submission (applications, care requests, order alerts). */
  inbox: "beagracelyn@gmail.com",
  phone: env.VITE_CONTACT_PHONE ?? "",
  whatsapp: env.VITE_CONTACT_WHATSAPP ?? "",
  momoMerchant: env.VITE_MOMO_MERCHANT_NUMBER ?? "",
  momoMerchantName: env.VITE_MOMO_MERCHANT_NAME ?? "JonnyBee Online Trading Platform",
} as const;

/** The e-commerce arm: JonnyBee Online Trading Platform. */
export const SHOP = {
  name: "JonnyBee Online Trading Platform",
  shortName: "JonnyBee",
  slogan: "Shop Smart, Trade Better!",
  promise: "Your Trusted Online Trading Partner!",
  area: "Assin Municipality",
  about:
    "JonnyBee Online Trading Platform is a customer-focused online trading business based in Assin Foso, Assin Municipality, Central Region, Ghana, West Africa. We are committed to making shopping convenient, accessible, and reliable by connecting customers with products and services through online platforms.",
  goal:
    "Our goal is to provide customers with a simple and enjoyable shopping experience while building trust through good customer service, quality products, and dependable transactions.",
  vision: "To become a trusted and recognized online trading platform serving customers in Assin Municipality, Ghana, and beyond.",
  mission:
    "To provide convenient online shopping and trading opportunities while delivering excellent customer service and creating value for our customers and business partners.",
  values: ["Customer satisfaction", "Trust and integrity", "Quality", "Reliability", "Convenience", "Professional service"],
  location: "Assin Municipality, Central Region, Ghana, West Africa",
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

/** Mirrors the fee rule in the `place_order` database function. Delivery is free while `freeDelivery` is on. */
export function deliveryFee(method: "delivery" | "pickup", town: string, region: string, freeDelivery = true) {
  if (method === "pickup" || freeDelivery) return 0;
  if (town.trim().toLowerCase().startsWith("assin fo")) return 10;
  if (region.toLowerCase().startsWith("central")) return 25;
  return 45;
}
