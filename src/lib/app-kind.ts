/**
 * Three installable apps share one website. Which one a visitor installs depends on
 * where they are: the shop pages install the Online Trading Center app, the admin
 * dashboard installs the Admin app, and everything else installs the Home Care app.
 */
export type AppKind = "care" | "shop" | "admin";

export const APPS: Record<AppKind, { name: string; shortName: string; manifest: string; appleIcon: string; theme: string; label: string }> = {
  care: {
    name: "SamBee Home Care",
    shortName: "SamBee Care",
    manifest: "/apps/care.webmanifest",
    appleIcon: "/apps/care-apple-180.png",
    theme: "#0b1f8f",
    label: "Get the Home Care app",
  },
  shop: {
    name: "SamBee Online Trading Center",
    shortName: "SamBee Shop",
    manifest: "/apps/shop.webmanifest",
    appleIcon: "/apps/shop-apple-180.png",
    theme: "#0b1f8f",
    label: "Get the Shop app",
  },
  admin: {
    name: "SamBee Admin",
    shortName: "SamBee Admin",
    manifest: "/apps/admin.webmanifest",
    appleIcon: "/apps/admin-apple-180.png",
    theme: "#0b1f8f",
    label: "Get the Admin app",
  },
};

export function appForPath(pathname: string, search = ""): AppKind {
  // An installed app keeps its identity even on shared pages like /account.
  const fromQuery = new URLSearchParams(search).get("app");
  if (fromQuery === "care" || fromQuery === "shop" || fromQuery === "admin") return fromQuery;
  if (pathname.startsWith("/manage") || pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/shop") || pathname.startsWith("/sell")) return "shop";
  return "care";
}
