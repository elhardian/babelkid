import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  buildObjectKey,
  isMinioConfigured,
  uploadToMinio,
} from "@/lib/minio";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 8MB" },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const key = buildObjectKey(file.name || "upload.bin");

    if (isMinioConfigured()) {
      const url = await uploadToMinio(key, bytes, file.type);
      return NextResponse.json({ url, storage: "minio", key });
    }

    // Local fallback when MinIO env is not set (dev / demo)
    const dir = path.join(process.cwd(), "public", "uploads", "kegiatan");
    await mkdir(dir, { recursive: true });
    const filename = key.split("/").pop()!;
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({
      url: `/uploads/kegiatan/${filename}`,
      storage: "local",
      key,
    });
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json(
      { error: "Gagal mengunggah file" },
      { status: 500 },
    );
  }
}
