"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Play, X } from "lucide-react";
import { cn } from "@/lib/format";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload gagal");
  }
  return data.url;
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video");
}

export function MediaUploadField({
  images,
  videoUrl,
  onImagesChange,
  onVideoChange,
  label = "Media kegiatan",
  maxImages = 8,
}: {
  images: string[];
  videoUrl?: string;
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string | undefined) => void;
  label?: string;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const mediaCount = images.length + (videoUrl ? 1 : 0);
  const maxTotal = maxImages + 1;

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError("");

    const list = Array.from(files);
    const photos = list.filter((f) => f.type.startsWith("image/"));
    const videos = list.filter((f) => f.type.startsWith("video/"));

    if (!photos.length && !videos.length) {
      setError("Pilih file gambar atau video (JPG, PNG, WEBP, MP4, WEBM)");
      return;
    }

    const photoRoom = maxImages - images.length;
    if (photos.length > photoRoom) {
      setError(`Maksimal ${maxImages} foto`);
      return;
    }
    if (videos.length > 1 || (videos.length === 1 && videoUrl)) {
      setError("Hanya 1 video per kegiatan (unggah ulang mengganti yang lama)");
    }

    setUploading(true);
    try {
      const nextImages = [...images];
      for (const file of photos.slice(0, Math.max(0, photoRoom))) {
        nextImages.push(await uploadFile(file));
      }
      onImagesChange(nextImages);

      if (videos[0]) {
        const url = await uploadFile(videos[0]);
        onVideoChange(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#8A96A8]">{label}</span>
        <span className="text-[11px] text-[#A0AAB8]">
          {mediaCount}/{maxTotal} · foto & video · MinIO
        </span>
      </div>

      {images.length > 0 || videoUrl ? (
        <div
          className="mt-2 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((url) => (
            <div
              key={url}
              className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={
                  url.startsWith("/uploads/") || url.includes("localhost")
                }
              />
              <button
                type="button"
                onClick={() => onImagesChange(images.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-[#1A2330]/75 p-0.5 text-white"
                aria-label="Hapus foto"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {videoUrl ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#1A2330]">
              <video
                src={videoUrl}
                className="size-full object-cover opacity-80"
                muted
                playsInline
                preload="metadata"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white">
                <Play className="size-6 fill-white" />
              </span>
              <button
                type="button"
                onClick={() => onVideoChange(undefined)}
                className="absolute right-1 top-1 rounded-full bg-[#1A2330]/75 p-0.5 text-white"
                aria-label="Hapus video"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        disabled={uploading || (images.length >= maxImages && Boolean(videoUrl))}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#D5DEEA] bg-[#F7FAFD] px-3 py-4 text-sm font-medium text-[#5B6B7C] transition hover:border-[#2E7DFF]/40 hover:bg-[#EEF3FA]",
          uploading && "opacity-60",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengunggah…
          </>
        ) : (
          <>
            <ImagePlus className="size-4" />
            Unggah foto / video
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
      {!error ? (
        <p className="mt-1.5 text-[11px] text-[#A0AAB8]">
          Foto hingga {maxImages} · video 1 file (MP4/WEBM)
          {isVideoUrl(videoUrl ?? "") ? "" : ""}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated use MediaUploadField */
export function ImageUploadField({
  value,
  onChange,
  label = "Foto kegiatan",
  max = 8,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}) {
  return (
    <MediaUploadField
      images={value}
      onImagesChange={onChange}
      onVideoChange={() => {}}
      label={label}
      maxImages={max}
    />
  );
}
