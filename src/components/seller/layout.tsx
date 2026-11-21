import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { LogoMark, SamBee } from "@/components/brand";
import { InstallAppButton } from "@/components/install-app";
import { useSession } from "@/lib/session";
import type { Store } from "@/lib/types";
import { cn } from "@/lib/cn";

export const SELLER_SECTIONS = ["overview", "orders", "products", "marketing", "promos", "customers", "reviews", "settings", "plan", "help"] as const;
export type SellerSection = (typeof SELLER_SECTIONS)[number];

const NAV: { group: string; items: { id: SellerSection; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { group: "", items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }] },
  {
    group: "Sell",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "products", label: "Products", icon: Package },
      { id: "customers", label: "Customers", icon: Users },
      { id: "reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    group: "Grow",
    items: [
      { id: "marketing", label: "Marketing & sharing", icon: Megaphone },
      { id: "promos", label: "Promo codes", icon: TicketPercent },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "settings", label: "Shop settings", icon: Settings },
      { id: "plan", label: "Plan & fees", icon: Receipt },
      { id: "help", label: "Help & tutorials", icon: GraduationCap },
    ],
  },
];

export const SELLER_LABEL = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.id, i.label]))) as Record<SellerSection, string>;

export function SellerLayout({
  store,
  section,
  onSection,
  pendingOrders,
  onAddProduct,
  children,
}: {
  store: Store;
  section: SellerSection;
  onSection: (s: SellerSection) => void;
  pendingOrders: number;
  onAddProduct: () => void;
  children: ReactNode;
}) {
  const { signOut, profile, email } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [section]);
  const initials = (profile?.full_name || email || "S")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-ink">
      {open ? <button type="button" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
          <Link to="/shop" className="flex min-w-0 items-center gap-2.5">
            <span className="h-8"><LogoMark kind="shop" className="h-full" /></span>
            <span className="min-w-0 leading-none">
              <SamBee className="block text-lg" />
              <span className="text-[11px] font-bold tracking-wide text-faint uppercase">Seller centre</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="ml-auto grid size-8 place-items-center rounded-lg lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl bg-paper p-2.5">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-mint font-extrabold text-sea">
            {store.logo_url ? <img src={store.logo_url} alt="" className="size-full object-cover" /> : store.name[0]?.toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 truncate text-sm font-bold">
              {store.name}
              {store.verified ? <BadgeCheck className="size-4 shrink-0 text-sea" aria-label="Verified" /> : null}
            </span>
            <span className={cn("text-xs font-semibold", store.status === "active" ? "text-leaf" : "text-danger")}>
              {store.status === "active" ? "● Live" : "● Paused"}
            </span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Seller">
          {NAV.map((g) => (
            <div key={g.group || "main"} className="mb-3">
              {g.group ? <p className="px-2.5 pt-2 pb-1.5 text-[11px] font-bold tracking-wider text-faint uppercase">{g.group}</p> : null}
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSection(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn("mb-0.5 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-semibold", active ? "bg-mint text-sea-2" : "text-muted hover:bg-paper hover:text-ink")}
                  >
                    <Icon className={cn("size-[18px]", active ? "text-sea" : "text-faint")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.id === "orders" && pendingOrders ? <span className="rounded-full bg-sea px-1.5 py-px text-[11px] font-bold text-white">{pendingOrders}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <InstallAppButton className="mb-1 flex h-9 w-full rounded-lg px-2.5 text-sm text-sea hover:bg-mint" />
          <Link to="/shop" className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-muted hover:bg-paper">
            <ExternalLink className="size-[18px] text-faint" aria-hidden /> Go to marketplace
          </Link>
          <button type="button" onClick={() => void signOut()} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-muted hover:bg-paper">
            <LogOut className="size-[18px] text-faint" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur sm:px-5">
          <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg text-ink hover:bg-paper lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <p className="min-w-0 truncate text-sm text-faint">
            Seller centre <span className="px-1">/</span> <strong className="font-bold text-ink">{SELLER_LABEL[section]}</strong>
          </p>
          <Link
            to="/shop/store/$slug"
            params={{ slug: store.slug }}
            className="ml-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-bold text-navy hover:bg-paper"
          >
            <ExternalLink className="size-4" aria-hidden /> <span className="hidden sm:inline">View my shop</span><span className="sm:hidden">My shop</span>
          </Link>
          <button type="button" onClick={onAddProduct} className="hidden h-9 items-center rounded-lg bg-sea px-3 text-sm font-bold text-white sm:inline-flex">
            + Add product
          </button>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white" title={email ?? ""}>{initials}</span>
        </header>
        <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
