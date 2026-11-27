import { Play } from "lucide-react";
import { ytThumb } from "@/lib/cloudinary";
import type { Video } from "@/lib/types";

export function videoThumb(video: Video) {
  if (video.thumbnail_url) return video.thumbnail_url;
  if (video.source === "youtube" && video.youtube_id) return ytThumb(video.youtube_id);
  return "";
}

export function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoEmbed({ video, autoplay = true }: { video: Video; autoplay?: boolean }) {
  if (video.source === "youtube" && video.youtube_id) {
    return (
      <iframe
        className="aspect-video w-full rounded-2xl bg-black"
        src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return (
    <video
      className="aspect-video w-full rounded-2xl bg-black"
      src={video.video_url ?? undefined}
      poster={video.thumbnail_url ?? undefined}
      controls
      autoPlay={autoplay}
      playsInline
    />
  );
}

export function VideoCard({ video, onPlay }: { video: Video; onPlay: (video: Video) => void }) {
  const thumb = videoThumb(video);
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card text-left transition-shadow hover:shadow-md"
    >
      <span className="relative block aspect-video overflow-hidden bg-navy">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : null}
        <span className="absolute inset-0 grid place-items-center bg-navy/20 transition-colors group-hover:bg-navy/35">
          <span className="grid size-14 place-items-center rounded-full bg-white/95 text-sea shadow-lg">
            <Play className="ml-1 size-6 fill-current" aria-hidden />
          </span>
        </span>
        {video.duration_seconds ? (
          <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
            {formatDuration(video.duration_seconds)}
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-4">
        <span className="text-xs font-bold tracking-widest text-sea uppercase">
          {video.is_tutorial ? `${video.topic || "Tutorial"} · ${video.language === "tw" ? "Twi" : "English"}` : video.category}
        </span>
        <span className="mt-1 line-clamp-2 text-lg leading-snug font-semibold text-ink">{video.title}</span>
        {video.description ? <span className="mt-1 line-clamp-2 text-base text-muted">{video.description}</span> : null}
      </span>
    </button>
  );
}
