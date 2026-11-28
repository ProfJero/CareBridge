import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, LayoutDashboard, Mail, MapPin, Menu, Phone, ShoppingBag, Store, User, X } from "lucide-react";
import { LogoMark, JonnyBee, Wordmark } from "@/components/brand";
import { SHOP, SITE } from "@/lib/config";
import { sectionForPath, type Section } from "@/lib/app-kind";
import { cartCount, useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";
import { InstallAppButton } from "@/components/install-app";

type NavItem = { to: string; label: string; hash?: string; match: (path: string) => boolean };

/**
 * One layout, two separate experiences. Home Care pages show only home-care
 * navigation; the Online Trading Platform shows only shopping navigation. The
 * start page (/) is where visitors choose between them.
 */
export function SiteShell({ children, section: forced }: { children: ReactNode; section?: Section }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const section = forced ?? sectionForPath(pathname);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <TopBar section={section} />
      {section === "care" ? <CareHeader open={open} setOpen={setOpen} pathname={pathname} /> : <ShopHeader open={open} setOpen={setOpen} pathname={pathname} />}
      <main className="flex-1">{children}</main>
      {section === "care" ? <CareFooter /> : <ShopFooter />}
    </div>
  );
}

function TopBar({ section }: { section: Section }) {
  return (
    <div className="bg-navy text-on-navy">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs font-semibold sm:px-5 sm:text-sm">
        <Link to="/" className="inline-flex min-h-7 min-w-0 items-center gap-1.5 truncate hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden /> All JonnyBee services
        </Link>
        <span className="hidden truncate italic text-navy-muted md:block">{section === "care" ? SITE.tagline : SHOP.promise}</span>
        <span className="flex shrink-0 items-center gap-4">
          {section === "shop" ? (
            <Link to="/tutorials" className="hidden min-h-7 items-center gap-1.5 hover:underline sm:inline-flex">
              <GraduationCap className="size-3.5" aria-hidden /> How-to videos
            </Link>
          ) : (
            <span className="hidden items-center gap-1.5 lg:inline-flex">
              <MapPin className="size-3.5" aria-hidden /> {SITE.town}, {SITE.region}
            </span>
          )}
          <InstallAppButton tone="dark" compact className="min-h-7 text-xs sm:text-sm" />
        </span>
      </div>
    </div>
  );
}

function NavLinks({ items, mobile = false }: { items: NavItem[]; mobile?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  return (
    <>
      {items.map((item) => {
        const active = item.match(pathname) && (!item.hash || hash === item.hash);
        return (
          <Link
            key={`${item.to}#${item.hash ?? ""}`}
            to={item.to}
            hash={item.hash}
            className={cn(
              mobile
                ? "flex h-12 items-center rounded-xl px-3 text-lg font-bold"
                : "inline-flex h-10 items-center rounded-full px-4 text-[15px] font-bold whitespace-nowrap",
              active ? (mobile ? "bg-mint text-sea-2" : "bg-navy text-on-navy") : "text-navy hover:bg-sky",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function MenuButton({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="grid size-11 shrink-0 place-items-center rounded-full text-navy hover:bg-sky lg:hidden"
      onClick={() => setOpen(!open)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      {open ? <X className="size-6" /> : <Menu className="size-6" />}
    </button>
  );
}

// ───────────────────────── Home Care ─────────────────────────

const CARE_NAV: NavItem[] = [
  { to: "/care", label: "Home", match: (p) => p === "/care" },
  { to: "/care", hash: "services", label: "Our services", match: () => false },
  { to: "/careers", label: "Careers", match: (p) => p.startsWith("/careers") },
  { to: "/videos", label: "Care videos", match: (p) => p.startsWith("/videos") },
];

function CareHeader({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void; pathname: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 shadow-[0_1px_0_rgba(11,31,143,0.04)] backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-5">
        <Link to="/care" className="min-w-0 flex-1 lg:flex-none" aria-label={SITE.name}>
          <Wordmark kind="care" compact />
        </Link>
        <nav className="ml-4 hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Home care">
          <NavLinks items={CARE_NAV} />
        </nav>
        <Link
          to="/care"
          hash="request-care"
          className="hidden h-11 shrink-0 items-center rounded-full bg-sea px-5 text-[15px] font-bold whitespace-nowrap text-on-sea hover:bg-sea-2 sm:inline-flex"
        >
          Request care
        </Link>
        <MenuButton open={open} setOpen={setOpen} />
      </div>
      {open ? (
        <nav className="border-t border-line bg-white px-4 pt-2 pb-5 lg:hidden" aria-label="Home care menu">
          <div className="grid gap-1">
            <NavLinks items={CARE_NAV} mobile />
          </div>
          <Link to="/care" hash="request-care" className="mt-3 flex h-12 items-center justify-center rounded-xl bg-sea text-lg font-bold text-on-sea">
            Request care
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

function CareFooter() {
  return (
    <footer className="bg-navy text-on-navy">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-16"><LogoMark kind="care" badge className="h-full" /></span>
            <span>
              <JonnyBee light className="block text-2xl" />
              <span className="text-sm font-bold text-navy-muted">Son and Daughter Home Care Services</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-muted">
            <em>{SITE.tagline}</em> {SITE.promise}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Home care</p>
          <ul className="mt-3 grid gap-1 text-base [&_a]:inline-flex [&_a]:min-h-7 [&_a]:items-center">
            <li><Link to="/care" hash="services" className="hover:underline">Our services</Link></li>
            <li><Link to="/care" hash="request-care" className="hover:underline">Request a care visit</Link></li>
            <li><Link to="/careers" className="hover:underline">Careers</Link></li>
            <li><Link to="/videos" className="hover:underline">Care videos</Link></li>
          </ul>
        </div>
        <ContactColumn location={`${SITE.town}, ${SITE.region}, ${SITE.country}, West Africa`} />
      </div>
      <FooterBottom name="JonnyBee Son and Daughter Home Care Services" />
    </footer>
  );
}

// ───────────────────────── Online Trading Platform ─────────────────────────

function ShopHeader({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void; pathname: string }) {
  const lines = useCart((state) => state.lines);
  const [count, setCount] = useState(0);
  const { userId, isAdmin, store } = useSession();
  useEffect(() => setCount(cartCount(lines)), [lines]);
  const nav: NavItem[] = [
    { to: "/sell", label: store ? "My shop" : "Sell with us", match: (p) => p.startsWith("/sell") },
    { to: "/shop/stores", label: "Shops", match: (p) => p.startsWith("/shop/stores") || p.startsWith("/shop/store/") },
    {
      to: "/shop",
      label: "Online Shop",
      match: (p) => p.startsWith("/shop") && !p.startsWith("/shop/stores") && !p.startsWith("/shop/store/"),
    },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 shadow-[0_1px_0_rgba(11,31,143,0.04)] backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-5">
        <Link to="/shop" className="min-w-0 flex-1 lg:flex-none" aria-label={SHOP.name}>
          <Wordmark kind="shop" compact />
        </Link>
        <nav className="ml-4 hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Online trading platform">
          <NavLinks items={nav} />
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {isAdmin ? (
            <Link to="/manage" className="hidden h-10 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-bold text-navy hover:bg-sky xl:inline-flex">
              <LayoutDashboard className="size-4" aria-hidden /> Dashboard
            </Link>
          ) : null}
          <Link to="/account" className="hidden size-11 place-items-center rounded-full text-navy hover:bg-sky min-[360px]:grid" aria-label={userId ? "My account" : "Sign in"}>
            <User className="size-5" />
          </Link>
          <Link to="/shop/cart" className="relative grid size-11 place-items-center rounded-full text-navy hover:bg-sky" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-sea px-1 text-xs font-bold text-on-sea">{count}</span>
            ) : null}
          </Link>
          <MenuButton open={open} setOpen={setOpen} />
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line bg-white px-4 pt-2 pb-5 lg:hidden" aria-label="Online trading platform menu">
          <div className="grid gap-1">
            <NavLinks items={nav} mobile />
            <Link to="/shop/about" className="flex h-12 items-center rounded-xl px-3 text-lg font-bold text-navy">About us</Link>
            <Link to="/tutorials" className="flex h-12 items-center rounded-xl px-3 text-lg font-bold text-navy">How-to videos (English &amp; Twi)</Link>
            <Link to="/account" className="flex h-12 items-center rounded-xl px-3 text-lg font-bold text-navy">
              {userId ? "My account & orders" : "Sign in / Create account"}
            </Link>
            {isAdmin ? (
              <Link to="/manage" className="flex h-12 items-center gap-2 rounded-xl px-3 text-lg font-bold text-sea">
                <LayoutDashboard className="size-5" aria-hidden /> Admin dashboard
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function ShopFooter() {
  return (
    <footer className="bg-navy text-on-navy">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-16"><LogoMark kind="shop" badge className="h-full" /></span>
            <span>
              <JonnyBee light className="block text-2xl" />
              <span className="text-sm font-bold text-navy-muted">Son and Daughter Online Trading Platform</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-muted">
            <em>{SHOP.promise}</em> {SHOP.slogan}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Online trading</p>
          <ul className="mt-3 grid gap-1 text-base [&_a]:inline-flex [&_a]:min-h-7 [&_a]:items-center">
            <li><Link to="/shop" className="hover:underline">Online Shop</Link></li>
            <li><Link to="/shop/stores" className="hover:underline">Shops</Link></li>
            <li>
              <Link to="/sell" className="inline-flex items-center gap-1.5 hover:underline">
                <Store className="size-4" aria-hidden /> Sell with us
              </Link>
            </li>
            <li><Link to="/shop/about" className="hover:underline">About us</Link></li>
            <li><Link to="/tutorials" className="hover:underline">How-to videos (English &amp; Twi)</Link></li>
            <li><Link to="/account" className="hover:underline">My orders</Link></li>
          </ul>
        </div>
        <ContactColumn location={SHOP.location} />
      </div>
      <FooterBottom name="JonnyBee Son and Daughter Online Trading Platform" />
    </footer>
  );
}

// ───────────────────────── shared ─────────────────────────

function ContactColumn({ location }: { location: string }) {
  return (
    <div>
      <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Contact us</p>
      <ul className="mt-3 grid gap-2 text-base text-navy-muted [&_a]:inline-flex [&_a]:min-h-7 [&_a]:items-center">
        <li className="flex items-start gap-2">
          <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
          {location}
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
  );
}

function FooterBottom({ name }: { name: string }) {
  return (
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-navy-muted sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
        <span className="flex gap-4">
          <Link to="/" className="inline-flex min-h-7 items-center hover:text-white">All JonnyBee services</Link>
          <Link to="/manage" className="inline-flex min-h-7 items-center hover:text-white">Staff login</Link>
        </span>
      </div>
    </div>
  );
}
