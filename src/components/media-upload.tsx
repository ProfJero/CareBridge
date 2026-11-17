import { useRef, useState } from "react";
import { ImagePlus, Link2, X } from "lucide-react";
import { toast } from "sonner";
import { Button, controlClass } from "@/components/ui";
import { cdnImage, cloudinaryReady, uploadToCloudinary } from "@/lib/cloudinary";

/** Multiple product/store images: uploads to Cloudinary, or accepts pasted image links. */
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
  const ready = cloudinaryReady();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    const picked = Array.from(files).slice(0, room);
    const urls: string[] = [];
    for (const file of picked) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10 MB.`);
        continue;
      }
      try {
        setProgress(0);
        const result = await uploadToCloudinary(file, "image", folder, setProgress);
        urls.push(result.url);
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
      {!ready ? <p className="text-sm text-faint">Direct photo uploads switch on once Cloudinary is connected.</p> : null}
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
