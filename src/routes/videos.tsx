import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, Search, Youtube } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VideoCard, VideoEmbed } from "@/components/video-player";
import { EmptyState, Modal, Spinner } from "@/components/ui";
import { useVideos } from "@/lib/queries";
import { useSession } from "@/lib/session";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/videos")({
  component: VideosPage,
  head: () => ({
    meta: [
      { title: "Care videos — SamBee Son and Daughter Home Care" },
      { name: "description", content: "Watch care tips for families, caregiver training and stories from SamBee Son and Daughter Home Care in Assin Foso." },
    ],
  }),
});

function VideosPage() {
  const videos = useVideos(200);
  const { isAdmin } = useSession();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);

  const categories = useMemo(() => ["All", ...new Set((videos.data ?? []).map((v) => v.category))], [videos.data]);
  const filtered = (videos.data ?? []).filter(
    (v) =>
      (category === "All" || v.category === category) &&
      (!query.trim() || `${v.title} ${v.description}`.toLowerCase().includes(query.trim().toLowerCase())),
  );
  const hero = filtered.find((v) => v.featured) ?? filtered[0];
  const rest = filtered.filter((v) => v.id !== hero?.id);

  return (
    <SiteShell>
      <section className="bg-navy text-on-navy">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm font-bold tracking-widest text-navy-muted uppercase">Video library</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Watch, learn and care with confidence</h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-muted">
            Practical care tips for families, training for caregivers, and stories from our team in Assin Foso.
          </p>
          <label className="mt-6 flex h-13 max-w-xl items-center gap-2 rounded-xl bg-card px-4 text-faint">
            <Search className="size-5 shrink-0" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos"
              aria-label="Search videos"
              className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-faint"
            />
          </label>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {categories.length > 2 ? (
          <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap",
                  category === item ? "bg-navy text-on-navy" : "bg-card text-navy ring-1 ring-line hover:bg-sky",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        {videos.isLoading ? (
          <div className="grid min-h-[30vh] place-items-center text-sea"><Spinner className="size-8" /></div>
        ) : !hero ? (
          <EmptyState
            icon={<PlayCircle className="size-6" />}
            title={videos.data?.length ? "No videos match" : "Videos are coming soon"}
            action={
              isAdmin ? (
                <Link to="/manage" search={{ tab: "videos" }} className="inline-flex h-11 items-center rounded-xl bg-sea px-4 font-semibold text-on-sea">
                  Add the first video
                </Link>
              ) : undefined
            }
          >
            {videos.data?.length ? "Try another word or category." : "We are preparing care tips and training videos. Please check back soon."}
          </EmptyState>
        ) : (
          <>
            <article className="grid gap-6 rounded-3xl border border-line bg-card p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <VideoEmbed video={hero} autoplay={false} />
              <div>
                <p className="text-sm font-bold tracking-widest text-sea uppercase">{hero.featured ? "Featured" : "Latest"} · {hero.category}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{hero.title}</h2>
                {hero.description ? <p className="mt-3 text-base leading-relaxed whitespace-pre-line text-muted">{hero.description}</p> : null}
                {hero.source === "youtube" && hero.youtube_id ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${hero.youtube_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-semibold text-danger"
                  >
                    <Youtube className="size-5" aria-hidden /> Watch on YouTube
                  </a>
                ) : null}
              </div>
            </article>
            {rest.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((video) => <VideoCard key={video.id} video={video} onPlay={setPlaying} />)}
              </div>
            ) : null}
          </>
        )}
      </div>

      <Modal open={Boolean(playing)} onClose={() => setPlaying(null)} title={playing?.title ?? "Video"} wide>
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
