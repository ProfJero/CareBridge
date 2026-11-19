import { useRef, useState } from "react";
import { Film, ImagePlus, Link2, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button, controlClass } from "@/components/ui";
import { cdnImage } from "@/lib/cloudinary";
import { MAX_VIDEO_SECONDS, uploadImage, uploadShortVideo } from "@/lib/media";

/** Multiple product/store images: uploads (Cloudinary or Supabase Storage) or pasted image links. */
export function ImageListInput({
  value,
  onChange,
  folder,
  max = 6,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  folder: string;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const ready = true;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    const picked = Array.from(files).slice(0, room);
    const urls: string[] = [];
    for (const file of picked) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 15 MB.`);
        continue;
      }
      try {
        setProgress(0);
        urls.push(await uploadImage(file, folder, setProgress));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      }
    }
    setProgress(null);
    if (urls.length) onChange([...value, ...urls]);
    if (input.current) input.current.value = "";
  }

  function addLink() {
    const url = link.trim();
    if (!/^https:\/\//i.test(url)) return toast.error("Paste a full image link starting with https://");
    onChange([...value, url].slice(0, max));
    setLink("");
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {value.map((url, index) => (
          <span key={`${url}-${index}`} className="relative size-20 overflow-hidden rounded-xl border border-line bg-paper">
            <img src={cdnImage(url, 160)} alt="" className="size-full object-cover" />
            {index === 0 ? <span className="absolute bottom-0 left-0 rounded-tr-lg bg-navy px-1.5 text-xs font-semibold text-on-navy">Main</span> : null}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {value.length < max && ready ? (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={progress !== null}
            className="grid size-20 place-items-center rounded-xl border-2 border-dashed border-sea/50 bg-mint/40 text-sea"
            aria-label="Upload images"
          >
            {progress !== null ? <span className="text-sm font-bold">{progress}%</span> : <ImagePlus className="size-6" />}
          </button>
        ) : null}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} />
      {value.length < max ? (
        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <Link2 className="size-4 shrink-0 text-faint" aria-hidden />
            <input
              className={controlClass}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={ready ? "…or paste an image link" : "Paste an image link (https://…)"}
              aria-label="Image link"
            />
          </label>
          <Button tone="secondary" onClick={addLink} disabled={!link.trim()}>
            Add
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SingleImageInput({ value, onChange, folder, label }: { value: string | null; onChange: (url: string | null) => void; folder: string; label: string }) {
  return (
    <div>
      <p className="mb-2 text-base font-semibold text-ink">{label}</p>
      <ImageListInput value={value ? [value] : []} onChange={(urls) => onChange(urls[0] ?? null)} folder={folder} max={1} />
    </div>
  );
}

/**
 * Short product video (max 3 MB, up to a minute). Phones record large files, so the
 * seller is told how to make the clip smaller if it is too big.
 */
export function ShortVideoInput({ value, onChange, folder }: { value: string | null; onChange: (url: string | null) => void; folder: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setProgress(0);
      onChange(await uploadShortVideo(file, folder, setProgress));
      toast.success("Video uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-line bg-black">
          <video src={value} controls playsInline muted className="aspect-video w-full" preload="metadata" />
          <div className="flex gap-2 bg-white p-2">
            <Button tone="secondary" className="h-10 flex-1 text-sm" onClick={() => input.current?.click()} disabled={progress !== null}>
              <UploadCloud className="size-4" aria-hidden /> Replace video
            </Button>
            <Button tone="secondary" className="h-10 text-sm text-danger" onClick={() => onChange(null)}>
              <Trash2 className="size-4" aria-hidden /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={progress !== null}
          className="grid place-items-center gap-1 rounded-xl border-2 border-dashed border-sea/50 bg-mint/40 px-4 py-5 text-center"
        >
          <Film className="size-7 text-sea" aria-hidden />
          <span className="font-semibold text-ink">{progress !== null ? `Uploading… ${progress}%` : "Upload a short product video"}</span>
          <span className="text-sm text-muted">MP4, WebM or MOV · 3 MB max · up to {MAX_VIDEO_SECONDS} seconds</span>
        </button>
      )}
      <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      {error ? (
        <p className="rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
          {error} Tip: record in 720p (or lower) and keep the clip to 10–20 seconds.
        </p>
      ) : null}
    </div>
  );
}
