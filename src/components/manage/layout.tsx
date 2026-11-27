import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  ExternalLink,
  Film,
  FolderTree,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Users,
  X,
} from "lucide-react";
import { LogoMark, SamBee } from "@/components/brand";
import { useSession } from "@/lib/session";
import { sb } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { InstallAppButton } from "@/components/install-app";

export const ADMIN_SECTIONS = [
  "dashboard",
  "orders",
  "products",
  "categories",
  "sellers",
  "customers",
  "reviews",
  "videos",
  "requests",
  "applications",
  "settings",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

type NavItem = { id: AdminSection; label: string; icon: typeof LayoutDashboard; badge?: "orders" | "requests" | "applications" };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: "", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Online Trading Center",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingCart, badge: "orders" },
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: FolderTree },
      { id: "sellers", label: "Sellers", icon: Store },
      { id: "customers", label: "Customers", icon: Users },
      { id: "reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    group: "Home Care",
    items: [
      { id: "requests", label: "Care requests", icon: HeartHandshake, badge: "requests" },
      { id: "applications", label: "Job applications", icon: BriefcaseBusiness, badge: "applications" },
    ],
  },
  {
    group: "Content & system",
    items: [
      { id: "videos", label: "Videos", icon: Film },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export const SECTION_LABEL = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.id, i.label]))) as Record<AdminSection, string>;

export function useAdminCounts(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-counts"],
    enabled,
    refetchInterval: 60_000,
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [orders, requests, applications] = await Promise.all([
        sb().from("orders").select("id", head).eq("status", "pending"),
        sb().from("care_requests").select("id", head).eq("status", "new"),
        sb().from("job_applications").select("id", head).eq("stage", "new"),
      ]);
      return { orders: orders.count ?? 0, requests: requests.count ?? 0, applications: applications.count ?? 0 };
    },
  });
}

export function AdminLayout({
  section,
  onSection,
  onSearch,
  children,
}: {
  section: AdminSection;
  onSection: (s: AdminSection) => void;
  onSearch: (q: string) => void;
  children: ReactNode;
}) {
  const { profile, email, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [q, setQ] = useState("");
  const counts = useAdminCounts(true);
  const c = counts.data;
  const total = c ? c.orders + c.requests + c.applications : 0;

  useEffect(() => {
    setOpen(false);
    setBell(false);
  }, [section]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim());
  }

  const initials = (profile?.full_name || email || "A")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-ink">
      {open ? <button type="button" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
          <span className="h-9"><LogoMark kind="care" className="h-full" /></span>
          <div className="min-w-0 leading-none">
            <SamBee className="block text-lg" />
            <span className="text-[11px] font-bold tracking-wide text-faint uppercase">Admin</span>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="ml-auto grid size-8 place-items-center rounded-lg lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin">
          {NAV.map((g) => (
            <div key={g.group || "main"} className="mb-3">
              {g.group ? <p className="px-2.5 pt-2 pb-1.5 text-[11px] font-bold tracking-wider text-faint uppercase">{g.group}</p> : null}
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                const n = item.badge && c ? c[item.badge] : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSection(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "mb-0.5 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-semibold",
                      active ? "bg-mint text-sea-2" : "text-muted hover:bg-paper hover:text-ink",
                    )}
                  >
                    <Icon className={cn("size-[18px]", active ? "text-sea" : "text-faint")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {n ? <span className="rounded-full bg-sea px-1.5 py-px text-[11px] font-bold text-white">{n}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <InstallAppButton className="mb-1 flex h-9 w-full rounded-lg px-2.5 text-sm text-sea hover:bg-mint" />
          <Link to="/" className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-muted hover:bg-paper">
            <ExternalLink className="size-[18px] text-faint" aria-hidden /> View website
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-muted hover:bg-paper"
          >
            <LogOut className="size-[18px] text-faint" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur sm:px-5">
          <button type="button" onClick={() => setOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-lg text-ink hover:bg-paper lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <p className="hidden text-sm text-faint md:block">
            Admin <span className="px-1">/</span> <strong className="font-bold text-ink">{SECTION_LABEL[section]}</strong>
          </p>
          <form onSubmit={submit} className="ml-auto flex min-w-0 flex-1 justify-end md:flex-none">
            <label className="flex h-9 w-full max-w-sm min-w-0 items-center gap-2 rounded-lg border border-line bg-paper px-2.5 text-faint focus-within:border-sea focus-within:bg-white md:w-72">
              <Search className="size-4 shrink-0" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search orders, customers…"
                aria-label="Search orders and customers"
                className="h-full w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
            </label>
          </form>
          <div className="relative">
            <button
              type="button"
              onClick={() => setBell((v) => !v)}
              className="relative grid size-9 place-items-center rounded-lg border border-line bg-white text-ink hover:bg-paper"
              aria-label={`Notifications${total ? `, ${total} new` : ""}`}
              aria-expanded={bell}
            >
              <Bell className="size-[18px]" />
              {total ? <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{total}</span> : null}
            </button>
            {bell ? (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-line bg-white p-2 shadow-xl">
                <p className="px-2 py-1.5 text-xs font-bold tracking-wide text-faint uppercase">Needs attention</p>
                {[
                  { id: "orders" as const, n: c?.orders ?? 0, label: "pending orders", icon: ShoppingCart },
                  { id: "requests" as const, n: c?.requests ?? 0, label: "new care requests", icon: ClipboardList },
                  { id: "applications" as const, n: c?.applications ?? 0, label: "new job applications", icon: BriefcaseBusiness },
                ].map(({ id, n, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => onSection(id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-paper">
                    <Icon className="size-4 text-sea" aria-hidden />
                    <span className="flex-1">
                      <strong>{n}</strong> {label}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white" title={email ?? ""}>
            {initials}
          </span>
        </header>
        <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
