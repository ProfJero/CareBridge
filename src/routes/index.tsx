import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Mail, MapPin, ShoppingBag } from "lucide-react";
import { JonnyBee } from "@/components/brand";
import { InstallAppButton } from "@/components/install-app";
import { SHOP, SITE } from "@/lib/config";

export const Route = createFileRoute("/")({
  component: StartPage,
  head: () => ({
    meta: [
      { title: "JonnyBee Son and Daughter — Home Care & Online Trading in Assin Foso" },
      {
        name: "description",
        content:
          "JonnyBee Son and Daughter, Assin Foso, Central Region, Ghana. Choose Home Care Services (Your Family, Our Care!) or the Online Trading Platform (Shop Smart, Trade Smart with JonnyBee!).",
      },
    ],
  }),
});

const CHOICES = [
  {
    to: "/care",
    banner: "banner-care",
    alt: `${SITE.name} — ${SITE.tagline} Personal care assistance, elderly care, child care, housekeeping, meal preparation, companionship and health monitoring support in Assin Foso.`,
    title: "Home Care Services",
    slogan: SITE.tagline,
    copy: SITE.promise,
    cta: "Enter Home Care",
    icon: HeartHandshake,
  },
  {
    to: "/shop",
    banner: "banner-shop",
    alt: `${SHOP.name} — ${SHOP.promise} Online shopping, e-commerce solutions, airtime and data, bills, TV subscription and mobile money in Assin Foso.`,
    title: "Online Trading Platform",
    slogan: SHOP.promise,
    copy: SHOP.slogan,
    cta: "Enter Online Shop",
    icon: ShoppingBag,
  },
] as const;

/** The starter page: visitors choose Home Care or the Online Trading Platform, and each opens its own site. */
function StartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5">
          <span className="min-w-0 leading-none">
            <JonnyBee className="block text-2xl" />
            <span className="mt-0.5 block truncate text-[11px] font-bold tracking-wide text-sea uppercase sm:text-xs">Son and Daughter</span>
          </span>
          <InstallAppButton compact className="min-h-9 text-sm" />
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-5 sm:pt-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-sea-2">
              <MapPin className="size-4" aria-hidden /> {SITE.town}, {SITE.region}, {SITE.country}
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold text-navy sm:text-4xl">Welcome to JonnyBee. Where would you like to go?</h1>
            <p className="mt-3 text-lg text-muted">Choose a service below. Each one opens its own pages.</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {CHOICES.map(({ to, banner, alt, title, slogan, copy, cta, icon: Icon }, index) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-sea/40 focus-visible:ring-4 focus-visible:ring-sea"
              >
                <img
                  src={`/brand/${banner}.webp`}
                  srcSet={`/brand/${banner}-720.webp 720w, /brand/${banner}.webp 1280w`}
                  sizes="(min-width: 1024px) 620px, 100vw"
                  alt={alt}
                  width={1280}
                  height={853}
                  className="aspect-[3/2] w-full object-cover"
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
                <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-navy">
                      <Icon className="size-6 shrink-0 text-sea" aria-hidden /> {title}
                    </h2>
                    <p className="mt-1 font-semibold text-sea italic">{slogan}</p>
                    <p className="mt-1 text-base text-muted">{copy}</p>
                  </div>
                  <span className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-navy px-6 text-lg font-bold text-on-navy group-hover:bg-sea">
                    {cta} <ArrowRight className="size-5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-navy text-on-navy">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} JonnyBee Son and Daughter · {SITE.town}, {SITE.region}, {SITE.country}</span>
          <span className="flex flex-wrap gap-x-5 gap-y-1">
            <a href={`mailto:${SITE.inbox}`} className="inline-flex min-h-7 items-center gap-1.5 hover:text-white">
              <Mail className="size-4" aria-hidden /> {SITE.inbox}
            </a>
            <Link to="/manage" className="inline-flex min-h-7 items-center hover:text-white">Staff login</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
