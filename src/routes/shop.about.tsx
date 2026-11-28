import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Banknote, Eye, Gift, Laptop, ShoppingCart, Smartphone, Tv, Zap, Handshake, HeartHandshake, MapPin, ShieldCheck, ShoppingBag, Sparkles, Star, Target, Truck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { JonnyBee } from "@/components/brand";
import { SHOP, SITE } from "@/lib/config";

export const Route = createFileRoute("/shop/about")({
  component: AboutShop,
  head: () => ({
    meta: [
      { title: "About — JonnyBee Son and Daughter Online Trading Platform" },
      { name: "description", content: `${SHOP.about} ${SHOP.slogan}` },
    ],
  }),
});

const VALUE_ICONS = [HeartHandshake, ShieldCheck, Star, BadgeCheck, Truck, Handshake];
const SERVICE_ICONS = [ShoppingCart, Laptop, Smartphone, Zap, Tv, Banknote, Gift, Handshake];

function AboutShop() {
  return (
    <SiteShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-bold text-sea-2">
              <MapPin className="size-4" aria-hidden /> {SHOP.location}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-extrabold text-ink sm:text-5xl">
              <JonnyBee /> <span className="text-navy">Son and Daughter</span> <span className="text-sea">Online Trading Platform</span>
            </h1>
            <p className="mt-3 font-display text-2xl font-bold text-navy italic">“{SHOP.slogan}”</p>
            <p className="mt-6 text-lg leading-relaxed text-muted">{SHOP.about}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{SHOP.goal}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/shop" className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-sea px-6 text-lg font-bold text-on-sea hover:bg-sea-2">
                <ShoppingBag className="size-5" aria-hidden /> Start shopping
              </Link>
              <Link to="/sell" className="inline-flex h-13 items-center justify-center rounded-xl border border-line bg-white px-6 text-lg font-bold text-navy hover:bg-sky">
                Trade with us
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-line">
            <img src="/brand/banner-shop-720.webp" alt={`${SHOP.name} — ${SHOP.slogan}`} width={720} height={480} className="w-full" />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">What we offer</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">Our Services</h2>
          <p className="mt-2 max-w-2xl text-lg text-muted">
            Shop online here. For airtime, bills, TV subscriptions, mobile money transfers and business solutions, contact us at{" "}
            <a href={`mailto:${SITE.inbox}`} className="font-bold break-words text-sea">{SITE.inbox}</a>
            {SITE.phone ? <> or <a href={`tel:${SITE.phone}`} className="font-bold text-sea">{SITE.phone}</a></> : null}.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {SHOP.services.map((service, i) => {
              const Icon = SERVICE_ICONS[i] ?? Sparkles;
              return (
                <li key={service} className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-mint text-sea"><Icon className="size-5" aria-hidden /></span>
                  <span className="text-base font-bold text-ink">{service}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-14 md:grid-cols-2">
        <article className="rounded-3xl bg-navy p-7 text-on-navy sm:p-9">
          <span className="grid size-12 place-items-center rounded-xl bg-white/10"><Eye className="size-6" aria-hidden /></span>
          <h2 className="mt-5 font-display text-2xl font-extrabold">Our Vision</h2>
          <p className="mt-3 text-lg leading-relaxed text-navy-muted">{SHOP.vision}</p>
        </article>
        <article className="rounded-3xl bg-sea p-7 text-on-sea sm:p-9">
          <span className="grid size-12 place-items-center rounded-xl bg-white/15"><Target className="size-6" aria-hidden /></span>
          <h2 className="mt-5 font-display text-2xl font-extrabold">Our Mission</h2>
          <p className="mt-3 text-lg leading-relaxed text-white/85">{SHOP.mission}</p>
        </article>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">What we stand for</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">Our Values</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {SHOP.values.map((value, i) => {
              const Icon = VALUE_ICONS[i] ?? Sparkles;
              return (
                <li key={value} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 sm:p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-sea"><Icon className="size-5" aria-hidden /></span>
                  <span className="text-base font-bold text-ink sm:text-lg">{value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-mint p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">Visit us or shop from anywhere within Assin Municipality</h2>
            <p className="mt-1 text-lg text-muted">
              {SHOP.location} · <a href={`mailto:${SITE.inbox}`} className="font-bold text-sea">{SITE.inbox}</a>
            </p>
          </div>
          <Link to="/shop" className="inline-flex h-12 shrink-0 items-center rounded-xl bg-navy px-5 font-bold text-on-navy">
            Browse products
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
