import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Languages, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VideoCard, VideoEmbed } from "@/components/video-player";
import { Modal } from "@/components/ui";
import { useTutorials } from "@/lib/queries";
import { useSession } from "@/lib/session";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TUTORIAL_TOPICS } from "@/lib/tutorials";


type Lang = "en" | "tw";
type TutorialSearch = { lang?: Lang; topic?: string };

export const Route = createFileRoute("/tutorials")({
  validateSearch: (search: Record<string, unknown>): TutorialSearch => ({
    lang: search.lang === "tw" ? "tw" : search.lang === "en" ? "en" : undefined,
    topic: typeof search.topic === "string" && (TUTORIAL_TOPICS as readonly string[]).includes(search.topic) ? search.topic : undefined,
  }),
  component: TutorialsPage,
  head: () => ({
    meta: [
      { title: "How-to tutorials (English & Twi) — JonnyBee" },
      { name: "description", content: "Video tutorials in English and Twi: how to shop, sell, request home care and use the JonnyBee apps." },
    ],
  }),
});

/** Written quick guides shown alongside (or until) the videos for each topic. */
const GUIDES: Record<(typeof TUTORIAL_TOPICS)[number], { title: string; steps: string[] }[]> = {
  "Getting started": [
    {
      title: "Create your account",
      steps: [
        "Tap the person icon at the top, then “Create account”.",
        "Enter your name, phone, email and a password (8+ characters).",
        "Open the confirmation email on the same phone — it signs you in and opens your Welcome page.",
        "Complete your profile so sellers and our care team can reach you.",
      ],
    },
    {
      title: "Install the app on your phone",
      steps: [
        "Open the section you want: Home Care, the Online Shop, or the Admin dashboard.",
        "Tap “Get the app” at the top of the page.",
        "Android: tap Install. iPhone: tap Share, then “Add to Home Screen”.",
      ],
    },
  ],
  Shopping: [
    {
      title: "Find and buy a product",
      steps: [
        "Open the Online Shop. Search, or tap a category.",
        "Open a product to see photos, its video, the seller and reviews.",
        "Tap “Add to cart”, then open the cart and tap Checkout.",
        "Choose delivery or pickup — delivery is free — and pay with Mobile Money or cash on delivery.",
        "Have a promo code? Enter it at checkout before you place the order.",
      ],
    },
    {
      title: "Track your order",
      steps: ["Open My account → Orders.", "Each order shows Pending → Confirmed → On the way → Delivered.", "After delivery, leave a review to help other buyers."],
    },
  ],
  Selling: [
    {
      title: "Open your shop",
      steps: [
        "Tap “Sell with us” and sign in.",
        "Add your shop name, phone, WhatsApp, Facebook and YouTube links, logo and a short video.",
        "Tap “Open my shop”. Your shop appears in the Shops directory straight away.",
      ],
    },
    {
      title: "Add products and handle orders",
      steps: [
        "In your Seller centre, go to Products → Add product. Add photos, a short video (3 MB max), price and stock.",
        "When an order arrives, open Orders and tap Accept, then Mark sent, then Mark delivered.",
        "Use Marketing to share your shop on WhatsApp and Facebook or print your QR poster.",
        "Create Promo codes to reward customers.",
      ],
    },
  ],
  "Home care": [
    {
      title: "Request a care visit",
      steps: [
        "On the Home Care page, scroll to “Request a care visit”.",
        "Enter your name, phone, the care you need and your town.",
        "Tell us a little about the person who needs care. Our coordinator will call you back.",
      ],
    },
    {
      title: "Apply for a caregiver job",
      steps: ["Open Careers and choose a role.", "Fill in the two short steps and attach your CV if you have one.", "Keep your reference number. Our team will contact you."],
    },
  ],
  Admin: [
    {
      title: "Run the platform",
      steps: [
        "Open the Admin dashboard (/manage) with an admin account.",
        "Dashboard shows sales, orders and alerts. Orders lets you confirm Mobile Money payments.",
        "Videos: add tutorials with a YouTube link, choose English or Twi and a topic.",
        "Settings: free delivery, seller fees and team access.",
      ],
    },
  ],
};

function TutorialsPage() {
  const search = Route.useSearch();
  const { isAdmin } = useSession();
  const tutorials = useTutorials();
  const [lang, setLang] = useState<Lang>(search.lang ?? "en");
  const [topic, setTopic] = useState<string>(search.topic ?? "All");
  const [playing, setPlaying] = useState<Video | null>(null);

  const videos = useMemo(
    () => (tutorials.data ?? []).filter((v) => v.language === lang && (topic === "All" || v.topic === topic)),
    [tutorials.data, lang, topic],
  );
  const counts = useMemo(() => {
    const all = tutorials.data ?? [];
    return { en: all.filter((v) => v.language === "en").length, tw: all.filter((v) => v.language === "tw").length };
  }, [tutorials.data]);
  const guideTopics = topic === "All" ? TUTORIAL_TOPICS : ([topic] as (typeof TUTORIAL_TOPICS)[number][]);

  return (
    <SiteShell>
      <section className="bg-navy text-on-navy">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-navy-muted uppercase">
            <GraduationCap className="size-4" aria-hidden /> Help centre
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold sm:text-5xl">How to use JonnyBee Online Trading Platform</h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-muted">
            Short video tutorials in <strong className="text-white">English</strong> and <strong className="text-white">Twi</strong> — shopping, selling, home care and the apps.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-white/10 p-1" role="tablist" aria-label="Choose language">
            {(["en", "tw"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={cn("inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-bold", lang === l ? "bg-white text-navy" : "text-white")}
              >
                <Languages className="size-4" aria-hidden />
                {l === "en" ? "English" : "Twi"}
                <span className={cn("rounded-full px-1.5 text-xs", lang === l ? "bg-mint text-sea-2" : "bg-white/15")}>{counts[l]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {["All", ...TUTORIAL_TOPICS].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={cn("h-10 shrink-0 rounded-full px-4 text-sm font-bold whitespace-nowrap", topic === t ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-line hover:bg-sky")}
            >
              {t}
            </button>
          ))}
        </div>

        <section className="mt-6 min-h-[22rem]" aria-labelledby="tutorial-videos">
          <h2 id="tutorial-videos" className="flex items-center gap-2 text-2xl font-bold text-ink">
            <PlayCircle className="size-6 text-sea" aria-hidden /> Video tutorials · {lang === "en" ? "English" : "Twi"}
          </h2>
          {tutorials.isLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : videos.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => <VideoCard key={v.id} video={v} onPlay={setPlaying} />)}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
              <p className="text-lg font-bold text-ink">
                {lang === "tw" ? "Twi tutorials are coming soon." : "English tutorials are coming soon."}
              </p>
              <p className="mt-1 text-muted">Until then, follow the step-by-step guides below.</p>
              {isAdmin ? (
                <Link to="/manage" search={{ tab: "videos" }} className="mt-4 inline-flex h-11 items-center rounded-xl bg-sea px-4 font-bold text-white">
                  Add a tutorial video
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="guides">
          <h2 id="guides" className="flex items-center gap-2 text-2xl font-bold text-ink">
            <BookOpen className="size-6 text-sea" aria-hidden /> Step-by-step guides
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {guideTopics.flatMap((t) =>
              GUIDES[t].map((g) => (
                <article key={`${t}-${g.title}`} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-xs font-bold tracking-widest text-sea uppercase">{t}</p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{g.title}</h3>
                  <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-base text-muted">
                    {g.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </article>
              )),
            )}
          </div>
        </section>
      </div>

      <Modal open={Boolean(playing)} onClose={() => setPlaying(null)} title={playing?.title ?? "Tutorial"} wide>
        {playing ? (
          <>
            <VideoEmbed video={playing} />
            {playing.description ? <p className="mt-4 text-base whitespace-pre-line text-muted">{playing.description}</p> : null}
          </>
        ) : null}
      </Modal>
    </SiteShell>
  );
}
