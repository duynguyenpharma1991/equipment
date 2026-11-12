import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/utils";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 2000;

/** Downscale big photos in the browser so pages stay fast. Returns null to keep the original. */
async function shrinkImage(file: File): Promise<Blob | null> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_EDGE && file.size <= 1.5 * 1024 * 1024) {
      bitmap.close();
      return null;
    }
    const scale = Math.min(1, MAX_EDGE / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  } catch {
    return null;
  }
}

/** Uploads a file to the public `media` bucket (admin-only by RLS) and returns its public URL. */
export async function uploadToMedia(file: File, folder: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ JPG, PNG, WebP, GIF, SVG hoặc PDF.");
  }
  if (file.size > MAX_BYTES) throw new Error("Tệp tối đa 10 MB.");

  let body: Blob = file;
  let type = file.type;
  const dot = file.name.lastIndexOf(".");
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || "file";
  let ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  const shrunk = await shrinkImage(file);
  if (shrunk) {
    body = shrunk;
    type = "image/webp";
    ext = "webp";
  }
  if (!ext) ext = type === "application/pdf" ? "pdf" : "bin";

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const path = `${folder}/${now.getFullYear()}/${month}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from("media").upload(path, body, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
