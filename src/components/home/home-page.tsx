import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Baby,
  Bath,
  BriefcaseBusiness,
  ChevronDown,
  CookingPot,
  HandHeart,
  Home,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { RequestCareForm } from "@/components/home/request-care";
import { JonnyBee } from "@/components/brand";
import { VideoCard, VideoEmbed } from "@/components/video-player";
import { Modal } from "@/components/ui";
import { SITE } from "@/lib/config";
import { useVideos } from "@/lib/queries";
import type { Video } from "@/lib/types";

const SERVICES = [
  { icon: Bath, title: "Personal care assistance", copy: "Bathing, dressing, grooming and other daily activities, done gently and with dignity." },
  { icon: UserRound, title: "Elderly care & support", copy: "Helping older people with daily routines, meals, mobility and companionship." },
  { icon: Baby, title: "Child care & supervision", copy: "Safe, attentive care and supervision for children at home while parents are busy." },
  { icon: Home, title: "Housekeeping services", copy: "Light housekeeping and keeping the home clean, tidy and safe." },
  { icon: CookingPot, title: "Meal preparation", copy: "Healthy, home-cooked meals prepared to suit your loved one's needs and tastes." },
  { icon: Users, title: "Companionship & support", copy: "Spending time with clients and helping families manage their care responsibilities." },
  { icon: Activity, title: "Health monitoring support", copy: "Help following care plans from health professionals, with regular checks shared with the family." },
] as const;

const PROMISES = [
  { icon: HandHeart, label: "Caring with love" },
  { icon: ShieldCheck, label: "Trusted & reliable" },
  { icon: Sparkles, label: "Safe & professional" },
  { icon: Truck, label: "At your doorstep" },
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
] as const;

export function HomePage() {
  const videos = useVideos(3);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [faq, setFaq] = useState<number | null>(0);

  return (
    <SiteShell>
      {/* Hero: the Home Care banner */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-3 pt-3 pb-10 sm:px-5 sm:pt-5 md:pb-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <img
            src="/brand/banner-care.webp"
            srcSet="/brand/banner-care-720.webp 720w, /brand/banner-care.webp 1280w"
            sizes="(min-width: 1024px) 760px, 100vw"
            alt={`${SITE.name} — ${SITE.tagline} ${SITE.promise} A JonnyBee caregiver with an elderly client in ${SITE.town}.`}
            width={1280}
            height={853}
            className="aspect-[3/2] w-full rounded-2xl object-cover ring-1 ring-line sm:rounded-3xl"
            fetchPriority="high"
          />
          <div className="flex flex-col justify-center rounded-2xl bg-white p-5 ring-1 ring-line sm:rounded-3xl sm:p-8">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-sea-2">
              <MapPin className="size-4" aria-hidden />
              {SITE.town} · {SITE.region}
            </p>
            <h1 className="mt-4 font-display text-3xl leading-[1.1] font-extrabold text-ink sm:text-4xl">
              <JonnyBee /> <span className="text-navy">Son and Daughter</span>{" "}
              <span className="text-sea">Home Care Services</span>
            </h1>
            <p className="mt-3 font-display text-xl font-bold text-navy italic">{SITE.tagline}</p>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              {SITE.promise} We support people who need help while living at home, and the families who love them.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href="#request-care"
                className="inline-flex h-13 items-center sm:flex-1 lg:flex-none xl:flex-1 justify-center gap-2 rounded-xl bg-sea px-6 text-lg font-semibold text-on-sea hover:bg-sea-2"
              >
                Request care <ArrowRight className="size-5" aria-hidden />
              </a>
              <a
                href="#services"
                className="inline-flex h-13 items-center sm:flex-1 lg:flex-none xl:flex-1 justify-center rounded-xl border border-line bg-card px-6 text-lg font-semibold text-navy hover:bg-sky"
              >
                Our services
              </a>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-base text-muted">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-5 shrink-0 text-sea" aria-hidden /> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What home care does */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-sea uppercase">Our services</p>
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
