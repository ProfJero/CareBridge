import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Mail, MapPin, Menu, Phone, ShoppingBag, Store, User, X } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { SITE } from "@/lib/config";
import { cartCount, useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/videos", label: "Videos" },
  { to: "/careers", label: "Careers" },
  { to: "/sell", label: "Sell with us" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lines = useCart((state) => state.lines);
  const [count, setCount] = useState(0);
  const { userId, isAdmin } = useSession();

  useEffect(() => setCount(cartCount(lines)), [lines]);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-5">
          <Link to="/" className="min-w-0 flex-1 lg:flex-none" aria-label={`${SITE.name} home`}>
            <Wordmark />
          </Link>
          <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-base font-semibold",
                  isActive(item.to) ? "bg-mint text-sea-2" : "text-navy hover:bg-sky",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isAdmin ? (
              <Link
                to="/manage"
                className="hidden h-11 items-center rounded-full bg-gold-bg px-4 text-sm font-semibold text-gold md:inline-flex"
              >
                Admin console
              </Link>
            ) : null}
            <Link
              to="/account"
              className="grid size-11 place-items-center rounded-full text-navy hover:bg-sky"
              aria-label={userId ? "My account" : "Sign in"}
            >
              <User className="size-5" />
            </Link>
            <Link
              to="/shop/cart"
              className="relative grid size-11 place-items-center rounded-full text-navy hover:bg-sky"
              aria-label={`Cart, ${count} items`}
            >
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
              className="hidden h-11 items-center rounded-full bg-sea px-5 text-base font-semibold text-on-sea hover:bg-sea-2 sm:inline-flex"
            >
              Request care
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-navy hover:bg-sky lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-line bg-card px-4 pt-2 pb-5 lg:hidden" aria-label="Mobile">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex h-12 items-center rounded-xl px-3 text-lg font-semibold",
                      isActive(item.to) ? "bg-mint text-sea-2" : "text-navy",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/account" className="flex h-12 items-center rounded-xl px-3 text-lg font-semibold text-navy">
                  {userId ? "My account & orders" : "Sign in / Create account"}
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link to="/manage" className="flex h-12 items-center rounded-xl px-3 text-lg font-semibold text-gold">
                    Admin console
                  </Link>
                </li>
              ) : null}
            </ul>
            <Link
              to="/"
              hash="request-care"
              className="mt-3 flex h-12 items-center justify-center rounded-xl bg-sea text-lg font-semibold text-on-sea"
            >
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
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark light />
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-muted">
            A home-care service in {SITE.town}, {SITE.region}, {SITE.country}, West Africa. Support for daily living,
            elderly care, recovery and family respite — in the comfort of home.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Care</p>
          <ul className="mt-3 grid gap-2 text-base">
            <li><Link to="/" hash="services" className="hover:text-mint">Our services</Link></li>
            <li><Link to="/" hash="request-care" className="hover:text-mint">Request a care visit</Link></li>
            <li><Link to="/videos" className="hover:text-mint">Care videos</Link></li>
            <li><Link to="/careers" className="hover:text-mint">Careers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Marketplace</p>
          <ul className="mt-3 grid gap-2 text-base">
            <li><Link to="/shop" className="hover:text-mint">Shop all</Link></li>
            <li><Link to="/shop/cart" className="hover:text-mint">Cart</Link></li>
            <li><Link to="/account" className="hover:text-mint">My orders</Link></li>
            <li>
              <Link to="/sell" className="inline-flex items-center gap-1.5 hover:text-mint">
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
              {SITE.town}, {SITE.region}, {SITE.country}
            </li>
            <li className="flex items-start gap-2 break-all">
              <Mail className="mt-1 size-4 shrink-0" aria-hidden />
              <a href={`mailto:${SITE.inbox}`} className="hover:text-mint">{SITE.inbox}</a>
            </li>
            {SITE.phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-1 size-4 shrink-0" aria-hidden />
                <a href={`tel:${SITE.phone}`} className="hover:text-mint">{SITE.phone}</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-navy-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span className="flex gap-4">
            <Link to="/admin/login" className="hover:text-mint">Staff workspace</Link>
            <span>Care that feels like family.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
