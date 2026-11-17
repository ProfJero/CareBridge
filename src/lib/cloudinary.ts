import { CLOUDINARY } from "@/lib/config";

export const cloudinaryReady = () => Boolean(CLOUDINARY.cloudName && CLOUDINARY.uploadPreset);

export type UploadResult = { url: string; publicId: string; duration?: number; thumbnail?: string };

/** Unsigned upload straight from the browser to Cloudinary, with progress. */
export function uploadToCloudinary(
  file: File,
  kind: "image" | "video",
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  if (!cloudinaryReady()) {
    return Promise.reject(new Error("Cloudinary is not configured yet. Paste a link instead, or ask the site owner to add the Cloudinary keys."));
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY.uploadPreset);
  form.append("folder", `sambea/${folder}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/${kind}/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          secure_url?: string;
          public_id?: string;
          duration?: number;
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
          resolve({
            url: body.secure_url,
            publicId: body.public_id ?? "",
            duration: body.duration ? Math.round(body.duration) : undefined,
            thumbnail: kind === "video" ? body.secure_url.replace(/\.[a-z0-9]+$/i, ".jpg") : undefined,
          });
        } else {
          reject(new Error(body.error?.message ?? "Upload failed."));
        }
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });
}

/** Ask Cloudinary for a resized, auto-format version of an image it hosts. */
export function cdnImage(url: string | null | undefined, width = 600) {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1, 12) || null;
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const match = url.pathname.match(/\/(embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (match) return match[2] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
