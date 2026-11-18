import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Pencil, Trash2, UploadCloud, Youtube } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/manage/kit";
import { videoThumb } from "@/components/video-player";
import { Button, EmptyState, ErrorNote, Field, Modal, Spinner, StatusPill, controlClass } from "@/components/ui";
import { cloudinaryReady, uploadToCloudinary, youtubeId } from "@/lib/cloudinary";
import { errText, must, sb } from "@/lib/supabase";
import type { Video } from "@/lib/types";

const VIDEO_CATEGORIES = ["Care tips", "Caregiver training", "Elderly care", "Health & nutrition", "Our stories", "Products"];

function VideoForm({ video, onDone }: { video: Video | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<"youtube" | "cloudinary">(video?.source ?? "youtube");
  const [link, setLink] = useState(video?.youtube_id ? `https://www.youtube.com/watch?v=${video.youtube_id}` : "");
  const [videoUrl, setVideoUrl] = useState(video?.video_url ?? "");
  const [thumb, setThumb] = useState(video?.thumbnail_url ?? "");
  const [duration, setDuration] = useState<number | null>(video?.duration_seconds ?? null);
  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [category, setCategory] = useState(video?.category ?? VIDEO_CATEGORIES[0]!);
  const [published, setPublished] = useState(video?.published ?? true);
  const [featured, setFeatured] = useState(video?.featured ?? false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return setError("Please keep uploads under 100 MB, or put the video on YouTube.");
    setError("");
    try {
      setProgress(0);
      const result = await uploadToCloudinary(file, "video", "videos", setProgress);
      setVideoUrl(result.url);
      setThumb(result.thumbnail ?? "");
      setDuration(result.duration ?? null);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (err) {
      setError(errText(err));
    } finally {
      setProgress(null);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const ytId = source === "youtube" ? youtubeId(link) : null;
      if (source === "youtube" && !ytId) throw new Error("That does not look like a YouTube link. Paste the full video URL.");
      if (source === "cloudinary" && !videoUrl) throw new Error("Upload a video file first.");
      if (title.trim().length < 2) throw new Error("Give the video a title.");
      const row = {
        title: title.trim(),
        description: description.trim(),
        category,
        source,
        youtube_id: ytId,
        video_url: source === "cloudinary" ? videoUrl : null,
        thumbnail_url: source === "cloudinary" ? thumb || null : null,
        duration_seconds: source === "cloudinary" ? duration : null,
        published,
        featured,
      };
      if (video) must(await sb().from("videos").update(row).eq("id", video.id));
      else must(await sb().from("videos").insert(row));
    },
    onSuccess: () => {
      toast.success(video ? "Video updated" : "Video added");
      void queryClient.invalidateQueries({ queryKey: ["videos"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      onDone();
    },
    onError: (err) => setError(errText(err)),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    save.mutate();
  }

  const ytPreview = source === "youtube" ? youtubeId(link) : null;

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-1">
        <button type="button" onClick={() => setSource("youtube")} className={`flex h-11 items-center justify-center gap-2 rounded-lg font-semibold ${source === "youtube" ? "bg-card shadow-sm" : "text-muted"}`}>
          <Youtube className="size-5 text-danger" aria-hidden /> YouTube link
        </button>
        <button type="button" onClick={() => setSource("cloudinary")} className={`flex h-11 items-center justify-center gap-2 rounded-lg font-semibold ${source === "cloudinary" ? "bg-card shadow-sm" : "text-muted"}`}>
          <UploadCloud className="size-5 text-sea" aria-hidden /> Upload file
        </button>
      </div>
      {source === "youtube" ? (
        <Field label="YouTube video link" hint="e.g. https://www.youtube.com/watch?v=… or https://youtu.be/…">
          <input className={controlClass} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtu.be/…" />
        </Field>
      ) : cloudinaryReady() ? (
        <div className="grid gap-2">
          <label className="grid cursor-pointer place-items-center gap-2 rounded-2xl border-2 border-dashed border-sea/50 bg-mint/40 px-4 py-6 text-center">
            <UploadCloud className="size-7 text-sea" aria-hidden />
            <span className="font-semibold text-ink">{progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Replace video file" : "Choose a video file"}</span>
            <span className="text-sm text-muted">MP4 or MOV, up to 100 MB. Stored on Cloudinary.</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} disabled={progress !== null} />
          </label>
          {videoUrl ? <video src={videoUrl} poster={thumb || undefined} controls className="aspect-video w-full rounded-xl bg-black" /> : null}
        </div>
      ) : (
        <p className="rounded-xl bg-gold-bg p-4 text-base text-ink">
          Cloudinary uploads switch on once the Cloudinary cloud name and upload preset are added to the site settings. Until then, add videos with a YouTube link.
        </p>
      )}
      {ytPreview ? <img src={`https://i.ytimg.com/vi/${ytPreview}/hqdefault.jpg`} alt="YouTube preview" className="aspect-video w-full rounded-xl object-cover" /> : null}
      <Field label="Title">
        <input className={controlClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
      </Field>
      <Field label="Description (optional)">
        <textarea className={`${controlClass} h-24 py-3`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Category">
        <select className={controlClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          {[...new Set([...VIDEO_CATEGORIES, category])].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="size-5 accent-sea" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="size-5 accent-sea" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={save.isPending || progress !== null}>{save.isPending ? "Saving…" : video ? "Save video" : "Add video"}</Button>
      </div>
    </form>
  );
}

export function VideoManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Video | null | "new">(null);
  const videos = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => must(await sb().from("videos").select("*").order("created_at", { ascending: false })) as Video[],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => must(await sb().from("videos").delete().eq("id", id)),
    onSuccess: () => {
      toast.success("Video removed");
      void queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      void queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (error) => toast.error(errText(error)),
  });
  return (
    <div className="grid gap-4">
      <PageHeader
        title="Videos"
        description="Paste a YouTube link or upload a file to Cloudinary. Videos appear on the Videos page and the home page."
        actions={
          <Button className="h-9 rounded-lg px-3.5 text-sm" onClick={() => setEditing("new")}>
            <Film className="size-4" aria-hidden /> Add video
          </Button>
        }
      />
      {videos.isLoading ? (
        <Spinner className="text-sea" />
      ) : !videos.data?.length ? (
        <EmptyState icon={<Film className="size-6" />} title="No videos yet" action={<Button onClick={() => setEditing("new")}>Add your first video</Button>}>
          Upload your videos to YouTube, then paste the link here.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.data.map((video) => (
            <li key={video.id} className="overflow-hidden rounded-2xl border border-line bg-card">
              <div className="relative aspect-video bg-navy">
                {videoThumb(video) ? <img src={videoThumb(video)} alt="" className="size-full object-cover" /> : null}
                <span className="absolute top-2 left-2 flex gap-1">
                  <StatusPill tone={video.published ? "sea" : "neutral"}>{video.published ? "Published" : "Hidden"}</StatusPill>
                  {video.featured ? <StatusPill tone="navy">Featured</StatusPill> : null}
                </span>
              </div>
              <div className="flex items-start gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-widest text-sea uppercase">{video.source === "youtube" ? "YouTube" : "Cloudinary"} · {video.category}</p>
                  <p className="mt-1 line-clamp-2 font-semibold text-ink">{video.title}</p>
                </div>
                <button type="button" onClick={() => setEditing(video)} className="grid size-10 place-items-center rounded-lg text-navy hover:bg-sky" aria-label={`Edit ${video.title}`}>
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove “${video.title}”?`)) remove.mutate(video.id);
                  }}
                  className="grid size-10 place-items-center rounded-lg text-danger hover:bg-danger-bg"
                  aria-label={`Delete ${video.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a video" : "Edit video"} wide>
        {editing !== null ? <VideoForm video={editing === "new" ? null : editing} onDone={() => setEditing(null)} /> : null}
      </Modal>
    </div>
  );
}

