import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, MapPin, Menu, Phone, ShoppingBag, Store, User, X } from "lucide-react";
import { LogoMark, SamBee, Wordmark } from "@/components/brand";
import { SHOP, SITE } from "@/lib/config";
import { cartCount, useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";
import { InstallAppButton } from "@/components/install-app";

const BASE_NAV = [
  { to: "/", label: "Home Care" },
  { to: "/shop", label: "Online Shop" },
  { to: "/shop/stores", label: "Shops" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/careers", label: "Careers" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lines = useCart((state) => state.lines);
  const [count, setCount] = useState(0);
  const { userId, isAdmin, store } = useSession();
  const NAV = [...BASE_NAV, { to: "/sell" as const, label: store ? "My shop" : "Sell with us" }];
  const shopMode = pathname.startsWith("/shop") || pathname.startsWith("/sell");

  useEffect(() => setCount(cartCount(lines)), [lines]);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : to === "/shop" ? pathname.startsWith("/shop") && !pathname.startsWith("/shop/stores") : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <div className="bg-navy text-on-navy">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs font-semibold sm:px-5 sm:text-sm">
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0" aria-hidden /> {SITE.town}, {SITE.region}, {SITE.country}
          </span>
          <span className="hidden truncate italic text-navy-muted md:block">
            {shopMode ? SHOP.slogan : SITE.tagline}
          </span>
          <span className="flex shrink-0 items-center gap-4">
            <a href={`mailto:${SITE.inbox}`} className="hidden items-center gap-1.5 hover:underline lg:inline-flex">
              <Mail className="size-3.5" aria-hidden /> {SITE.inbox}
            </a>
            <InstallAppButton tone="dark" compact className="text-xs sm:text-sm" />
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 shadow-[0_1px_0_rgba(11,31,143,0.04)] backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-5">
          <Link to={shopMode ? "/shop" : "/"} className="min-w-0 flex-1 xl:flex-none" aria-label={shopMode ? SHOP.name : SITE.name}>
            <Wordmark kind={shopMode ? "shop" : "care"} compact />
          </Link>
          <nav className="ml-4 hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-3.5 text-[15px] font-bold whitespace-nowrap",
                  isActive(item.to) ? "bg-navy text-on-navy" : "text-navy hover:bg-sky",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {isAdmin ? (
              <Link
                to="/manage"
                className="hidden h-10 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-bold text-navy hover:bg-sky md:inline-flex"
              >
                <LayoutDashboard className="size-4" aria-hidden /> Dashboard
              </Link>
            ) : null}
            <Link to="/account" className="grid size-11 place-items-center rounded-full text-navy hover:bg-sky" aria-label={userId ? "My account" : "Sign in"}>
              <User className="size-5" />
            </Link>
            <Link to="/shop/cart" className="relative grid size-11 place-items-center rounded-full text-navy hover:bg-sky" aria-label={`Cart, ${count} items`}>
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-sea px-1 text-xs font-bold text-on-sea">
                  {count}
                </span>
              ) : null}
            </Link>
            <Link
              to="/"
              hash="request-care"
              className="hidden h-11 items-center rounded-full bg-sea px-5 text-[15px] font-bold whitespace-nowrap text-on-sea hover:bg-sea-2 sm:inline-flex xl:hidden 2xl:inline-flex"
            >
              Request care
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-navy hover:bg-sky xl:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-line bg-white px-4 pt-2 pb-5 xl:hidden" aria-label="Mobile">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn("flex h-12 items-center rounded-xl px-3 text-lg font-bold", isActive(item.to) ? "bg-mint text-sea-2" : "text-navy")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop/about" className="flex h-12 items-center rounded-xl px-3 text-lg font-bold text-navy">
                  About the Online Trading Center
                </Link>
              </li>
              <li>
                <Link to="/account" className="flex h-12 items-center rounded-xl px-3 text-lg font-bold text-navy">
                  {userId ? "My account & orders" : "Sign in / Create account"}
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link to="/manage" className="flex h-12 items-center gap-2 rounded-xl px-3 text-lg font-bold text-sea">
                    <LayoutDashboard className="size-5" aria-hidden /> Admin dashboard
                  </Link>
                </li>
              ) : null}
            </ul>
            <Link to="/" hash="request-care" className="mt-3 flex h-12 items-center justify-center rounded-xl bg-sea text-lg font-bold text-on-sea">
              Request care
            </Link>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-on-navy">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.3fr_1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-14"><LogoMark kind="care" badge className="h-full" /></span>
            <span>
              <SamBee light className="block text-2xl" />
              <span className="text-sm font-bold text-navy-muted">Son and Daughter Home Care</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-muted">
            Home care in {SITE.town}, {SITE.region}, {SITE.country}, West Africa. <em>{SITE.tagline}</em>
          </p>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="h-14"><LogoMark kind="shop" badge className="h-full" /></span>
            <span>
              <SamBee light className="block text-2xl" />
              <span className="text-sm font-bold text-navy-muted">Online Trading Center</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-muted">
            Convenient, reliable online shopping from {SITE.town}. <em>{SHOP.slogan}</em>
          </p>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Explore</p>
          <ul className="mt-3 grid gap-2 text-base">
            <li><Link to="/" hash="services" className="hover:underline">Home care services</Link></li>
            <li><Link to="/" hash="request-care" className="hover:underline">Request a care visit</Link></li>
            <li><Link to="/shop" className="hover:underline">Shop online</Link></li>
            <li><Link to="/shop/about" className="hover:underline">About the Trading Center</Link></li>
            <li><Link to="/videos" className="hover:underline">Videos</Link></li>
            <li><Link to="/tutorials" className="hover:underline">How-to tutorials (English &amp; Twi)</Link></li>
            <li><Link to="/shop/stores" className="hover:underline">All shops</Link></li>
            <li><Link to="/careers" className="hover:underline">Careers</Link></li>
            <li>
              <Link to="/sell" className="inline-flex items-center gap-1.5 hover:underline">
                <Store className="size-4" aria-hidden /> Become a seller
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Contact</p>
          <ul className="mt-3 grid gap-2 text-base text-navy-muted">
            <li className="flex items-start gap-2">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
              {SHOP.location}
            </li>
            <li className="flex items-start gap-2 break-all">
              <Mail className="mt-1 size-4 shrink-0" aria-hidden />
              <a href={`mailto:${SITE.inbox}`} className="hover:text-white">{SITE.inbox}</a>
            </li>
            {SITE.phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-1 size-4 shrink-0" aria-hidden />
                <a href={`tel:${SITE.phone}`} className="hover:text-white">{SITE.phone}</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-navy-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SamBee Son and Daughter. All rights reserved.</span>
          <span className="flex gap-4">
            <Link to="/manage" className="hover:text-white">Staff login</Link>
            <span>Assin Foso · Ghana</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
