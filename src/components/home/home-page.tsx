import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bath,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  HandHeart,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { RequestCareForm } from "@/components/home/request-care";
import { BannerCarousel } from "@/components/home/banner-carousel";
import { SamBee } from "@/components/brand";
import { ProductCard, ProductGridSkeleton } from "@/components/shop/product-card";
import { VideoCard, VideoEmbed } from "@/components/video-player";
import { Modal } from "@/components/ui";
import { SHOP, SITE } from "@/lib/config";
import { useCategories, useProducts, useStores, useVideos } from "@/lib/queries";
import { StoreCard } from "@/components/shop/store-card";
import type { Video } from "@/lib/types";

const SERVICES = [
  {
    icon: Bath,
    title: "Personal care",
    copy: "Bathing, dressing, grooming, and other daily activities — done gently and with dignity.",
  },
  {
    icon: UserRound,
    title: "Elderly care",
    copy: "Helping older people with daily routines, meals, mobility, and companionship.",
  },
  {
    icon: HeartPulse,
    title: "Illness & recovery support",
    copy: "Support with everyday activities and following a care plan provided by health professionals.",
  },
  {
    icon: Home,
    title: "Household support",
    copy: "Light housekeeping, meal preparation, and maintaining a safe home environment.",
  },
  {
    icon: Users,
    title: "Companionship & family support",
    copy: "Spending time with clients and helping families manage their care responsibilities.",
  },
] as const;

const STEPS = [
  ["01", "Tell us what you need", "Send a request or call us. We listen to the family and the person receiving care."],
  ["02", "We plan the care together", "A coordinator visits, agrees a routine and matches a caregiver who fits."],
  ["03", "Care begins at home", "Visits start on the days you choose. We check in and adjust as needs change."],
] as const;

const FAQ = [
  [
    "Which areas do you serve?",
    `We are based in ${SITE.town} in the ${SITE.region} and serve surrounding Assin communities. Ask us about other towns — we will tell you honestly if we can help.`,
  ],
  [
    "Do you provide nursing care?",
    "Our caregivers support daily living and follow care plans set by health professionals. Where clinical care is needed, we work alongside qualified nurses and the client's doctor.",
  ],
  [
    "Can I book care for a few hours only?",
    "Yes. Care can be a short daily visit, several days a week, or longer support. We agree the schedule with you.",
  ],
  [
    "What is the marketplace?",
    "A shop where local sellers list care supplies and everyday items — walking aids, health monitors, hygiene products and more — with delivery or pickup in Assin Foso.",
  ],
] as const;

export function HomePage() {
  const { data: categories } = useCategories();
  const featuredOnly = useProducts({ featured: true, limit: 8 }, categories);
  const latest = useProducts({ limit: 8 }, categories);
  const featured = featuredOnly.data?.products.length ? featuredOnly : latest;
  const shops = useStores(8);
  const videos = useVideos(3);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [faq, setFaq] = useState<number | null>(0);

  return (
    <SiteShell>
      <BannerCarousel />

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-sea-2">
              <MapPin className="size-4" aria-hidden />
              {SITE.town} · {SITE.region} · {SITE.country}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold text-ink sm:text-5xl md:text-6xl">
              <SamBee /> Son and Daughter <span className="text-sea">Home Care</span>
            </h1>
            <p className="mt-3 font-display text-xl font-bold text-navy italic sm:text-2xl">{SITE.tagline}</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              A home-care service in {SITE.town}, {SITE.region}, {SITE.country}, West Africa. We support people who need
              help while living at home — and the families who love them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#request-care"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-sea px-6 text-lg font-semibold text-on-sea hover:bg-sea-2"
              >
                Request care
                <ArrowRight className="size-5" aria-hidden />
              </a>
              <a
                href="#services"
                className="inline-flex h-13 items-center justify-center rounded-xl border border-line bg-card px-6 text-lg font-semibold text-navy hover:bg-sky"
              >
                Explore our services
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base text-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-sea" aria-hidden /> Vetted, trained caregivers
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-sea" aria-hidden /> Personal care plan
              </li>
              <li className="flex items-center gap-2">
                <HandHeart className="size-5 text-sea" aria-hidden /> Respect and dignity
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -right-8 size-64 rounded-full bg-mint blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-line">
              <img
                src="/brand/hero-care.webp"
                srcSet="/brand/hero-care-540.webp 540w, /brand/hero-care.webp 900w"
                sizes="(min-width: 1024px) 560px, 100vw"
                alt="A SamBee caregiver smiling with an elderly client at home"
                width={900}
                height={900}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <a
                href="#request-care"
                className="absolute inset-x-4 bottom-4 flex h-13 items-center justify-center gap-2 rounded-2xl bg-navy/95 font-bold text-on-navy shadow-lg backdrop-blur"
              >
                <PhoneCall className="size-4" aria-hidden /> Ask for a free care conversation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What home care does */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">What a home-care service does</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Practical support, so life at home stays possible.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A home-care agency provides support to people who need assistance while living at home. Depending on the
            services chosen, this can include:
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-2xl border border-line bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-mint text-sea">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{copy}</p>
            </article>
          ))}
          <article className="flex flex-col justify-between rounded-2xl bg-sea p-6 text-on-sea">
            <div>
              <Sparkles className="size-7" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold">Not sure what you need?</h3>
              <p className="mt-2 text-base leading-relaxed text-on-sea/85">
                Tell us about your loved one. We will suggest a simple plan and explain every step.
              </p>
            </div>
            <a href="#request-care" className="mt-5 inline-flex items-center gap-2 font-semibold">
              Talk to us <ArrowRight className="size-4" aria-hidden />
            </a>
          </article>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy text-on-navy">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">How it works</p>
          <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {STEPS.map(([n, title, copy]) => (
              <li key={n}>
                <p className="font-display text-4xl text-mint">{n}</p>
                <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-navy-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Marketplace teaser */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-sea uppercase">{SHOP.name}</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Shop smart. Shop online.</h2>
            <p className="mt-3 text-lg text-muted">
              Mobile accessories, electronics, fashion, home essentials, gifts and care supplies from trusted sellers in Assin
              Foso. Pay with Mobile Money or cash on delivery.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-on-navy hover:bg-navy-2"
          >
            <ShoppingBag className="size-5" aria-hidden /> Visit the shop
          </Link>
        </div>
        <div className="mt-8">
          {featured.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : featured.data?.products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featured.data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
          {shops.data?.length ? (
            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-xl font-bold text-ink">Shops on SamBee</h3>
                <Link to="/shop/stores" className="font-bold text-sea">All shops →</Link>
              </div>
              <div className="scrollbar-none -mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pt-1 pb-2">
                {shops.data.map((st) => <StoreCard key={st.id} store={st} compact />)}
              </div>
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-line bg-gold-bg p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg text-ink">
            <strong className="font-semibold">Have something to sell?</strong> Open a free shop and reach families across the
            Central Region.
          </p>
          <Link to="/sell" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gold px-4 font-semibold text-white">
            Become a seller <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Videos teaser */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-bold tracking-widest text-sea uppercase">Video library</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Learn and see how we care</h2>
              <p className="mt-3 text-lg text-muted">Care tips for families, caregiver training and stories from our team.</p>
            </div>
            <Link to="/videos" className="inline-flex h-12 items-center gap-2 font-semibold text-sea">
              All videos <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8">
            {videos.data && videos.data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.data.map((video) => (
                  <VideoCard key={video.id} video={video} onPlay={setPlaying} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-10 text-center text-lg text-muted">
                {videos.isLoading ? "Loading videos…" : "Our first videos are coming soon. Check back shortly."}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Careers band */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid items-center gap-8 rounded-[2rem] bg-mint p-6 sm:p-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm font-bold tracking-widest text-sea-2 uppercase">Careers</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Build a career around making lives better.</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
              Join a home-care team in Ghana. Support people in their own homes — with daily living, companionship, or
              professional nursing — and know exactly what you are applying for.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/careers"
              hash="apply"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sea px-5 font-semibold text-on-sea"
            >
              <BriefcaseBusiness className="size-5" aria-hidden /> Apply to join us
            </Link>
            <Link
              to="/careers"
              hash="roles"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-sea/30 bg-card px-5 font-semibold text-navy"
            >
              See open roles
            </Link>
          </div>
        </div>
      </section>

      {/* Request care + contact */}
      <section id="request-care" className="scroll-mt-24 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold tracking-widest text-sea uppercase">Request care</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Let's talk about the care you need.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Fill in the short form and our coordinator will call you back. Your request goes straight to our care team.
            </p>
            <ul className="mt-6 grid gap-4 text-base">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                <span>
                  <strong className="block font-semibold text-ink">Where we are</strong>
                  <span className="text-muted">
                    {SITE.town}, {SITE.region}, {SITE.country}, West Africa
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                <span className="min-w-0">
                  <strong className="block font-semibold text-ink">Email</strong>
                  <a href={`mailto:${SITE.inbox}`} className="inline-flex min-h-7 items-center break-all text-sea">
                    {SITE.inbox}
                  </a>
                </span>
              </li>
              {SITE.phone ? (
                <li className="flex items-start gap-3">
                  <PhoneCall className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
                  <span>
                    <strong className="block font-semibold text-ink">Phone</strong>
                    <a href={`tel:${SITE.phone}`} className="text-sea">
                      {SITE.phone}
                    </a>
                  </span>
                </li>
              ) : null}
            </ul>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line">
              <iframe
                title={`Map of ${SITE.town}`}
                src="https://www.google.com/maps?q=Assin+Foso,+Central+Region,+Ghana&output=embed"
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-8">
            <h3 className="text-2xl font-semibold text-ink">Request a care visit</h3>
            <p className="mt-1 mb-5 text-base text-muted">Takes about a minute. No obligation.</p>
            <RequestCareForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">Questions families ask</h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
          {FAQ.map(([q, a], index) => (
            <div key={q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-lg font-semibold text-ink"
                aria-expanded={faq === index}
                onClick={() => setFaq(faq === index ? null : index)}
              >
                {q}
                <ChevronDown className={`size-5 shrink-0 text-sea transition-transform ${faq === index ? "rotate-180" : ""}`} />
              </button>
              {faq === index ? <p className="px-5 pb-5 text-base leading-relaxed text-muted">{a}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <Modal open={Boolean(playing)} onClose={() => setPlaying(null)} title={playing?.title ?? "Video"} wide>
        {playing ? <VideoEmbed video={playing} /> : null}
      </Modal>
    </SiteShell>
  );
}
