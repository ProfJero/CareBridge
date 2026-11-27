import { Link } from "@tanstack/react-router";
import { Bath, ChevronRight, HeartPulse, Home, PhoneCall, UserRound, Users } from "lucide-react";
import { JonnyBee } from "@/components/brand";
import { SHOP, SITE } from "@/lib/config";

const CARE_SERVICES = [
  { icon: Bath, label: "Personal care assistance" },
  { icon: UserRound, label: "Care for the elderly" },
  { icon: HeartPulse, label: "Illness & recovery support" },
  { icon: Home, label: "Housekeeping & meals" },
  { icon: Users, label: "Companionship & family support" },
];

/**
 * Top of the home page: the JonnyBee Online Trading Platform banner beside a
 * JonnyBee Home Care panel. Side by side on tablets and up, stacked on phones.
 */
export function BannerCarousel() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-3 pt-3 sm:px-5 sm:pt-5 md:grid-cols-[1.25fr_1fr] md:gap-5" aria-label="Featured">
      <Link
        to="/shop"
        className="group block overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-14px_rgba(11,31,143,0.3)] ring-1 ring-line sm:rounded-3xl"
      >
        <img
          src="/brand/banner-shop.webp"
          srcSet="/brand/banner-shop-720.webp 720w, /brand/banner-shop.webp 1280w"
          sizes="(min-width: 1280px) 700px, (min-width: 768px) 56vw, 100vw"
          alt={`${SHOP.name} — ${SHOP.slogan} Online shopping, electronics and gadgets, fashion and accessories, home and kitchen items in ${SHOP.area}.`}
          width={1280}
          height={853}
          className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          fetchPriority="high"
        />
        <span className="flex items-center justify-between border-t border-line px-5 py-3 text-base font-bold text-navy">
          Shop with JonnyBee today
          <ChevronRight className="size-5 text-sea" aria-hidden />
        </span>
      </Link>

      <div className="flex flex-col overflow-hidden rounded-2xl bg-navy text-on-navy shadow-[0_10px_40px_-14px_rgba(11,31,143,0.3)] sm:rounded-3xl">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <img src="/brand/bee.webp" alt="" width={300} height={278} className="h-20 w-auto shrink-0 sm:h-24" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">
              <JonnyBee light /> Home Care
            </p>
            <p className="mt-1 font-semibold text-navy-muted italic">{SITE.tagline}</p>
          </div>
        </div>
        <ul className="grid flex-1 content-start gap-2 px-5 sm:px-6">
          {CARE_SERVICES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-base font-semibold">
              <Icon className="size-5 shrink-0 text-[#ffd23f]" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:p-6">
          <Link to="/" hash="request-care" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white font-bold text-navy hover:bg-mint">
            <PhoneCall className="size-4" aria-hidden /> Request care
          </Link>
          <Link to="/" hash="services" className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-white/10 font-bold text-white hover:bg-white/20">
            Our services
          </Link>
        </div>
      </div>
    </section>
  );
}
