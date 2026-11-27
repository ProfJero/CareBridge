import { cloudinaryReady, uploadToCloudinary } from "@/lib/cloudinary";
import { sb } from "@/lib/supabase";

/** Short product videos: small enough to load fast on mobile data. */
export const MAX_VIDEO_BYTES = 3 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 60;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function currentUserId() {
  const { data } = await sb().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Please sign in to upload files.");
  return id;
}

/** Upload to the public Supabase "media" bucket under the user's own folder. */
async function uploadToSupabase(file: Blob, folder: string, ext: string, contentType: string) {
  const uid = await currentUserId();
  const path = `${uid}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb().storage.from("media").upload(path, file, { contentType, cacheControl: "31536000", upsert: false });
  if (error) {
    if (/exceeded|too large|payload/i.test(error.message)) throw new Error("That file is too large. Please keep it under 3 MB.");
    throw new Error(error.message);
  }
  return sb().storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Shrink a photo in the browser (max 1600px, WebP) so pages stay fast. */
async function compressImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder: string, onProgress?: (n: number) => void): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPG, PNG or WebP).");
  if (cloudinaryReady()) return (await uploadToCloudinary(file, "image", folder, onProgress)).url;
  onProgress?.(10);
  const blob = await compressImage(file);
  if (blob.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} is still larger than 3 MB after resizing.`);
  onProgress?.(40);
  const isWebp = blob.type === "image/webp";
  const ext = isWebp ? "webp" : (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const url = await uploadToSupabase(blob, folder, ext, isWebp ? "image/webp" : file.type);
  onProgress?.(100);
  return url;
}

/** Read a video's length without uploading it. */
export function videoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(el.duration) ? el.duration : 0);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    el.src = url;
  });
}

export async function checkShortVideo(file: File) {
  if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) throw new Error("Please choose an MP4, WebM or MOV video.");
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`This video is ${formatMb(file.size)}. Product videos must be 3 MB or smaller — record a shorter clip or lower the quality.`);
  }
  const seconds = await videoDuration(file);
  if (seconds > MAX_VIDEO_SECONDS) throw new Error(`This video is ${Math.round(seconds)} seconds long. Keep product videos under ${MAX_VIDEO_SECONDS} seconds.`);
  return seconds;
}

export async function uploadShortVideo(file: File, folder: string, onProgress?: (n: number) => void): Promise<string> {
  await checkShortVideo(file);
  if (cloudinaryReady()) return (await uploadToCloudinary(file, "video", folder, onProgress)).url;
  onProgress?.(20);
  const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
  const url = await uploadToSupabase(file, folder, ext, file.type);
  onProgress?.(100);
  return url;
}
