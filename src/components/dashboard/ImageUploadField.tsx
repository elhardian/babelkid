"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Maksimal ${max} foto`);
      return;
    }
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);
    if (!list.length) {
      setError("Pilih file gambar (JPG, PNG, WEBP)");
      return;
    }

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        urls.push(await uploadFile(file));
      }
      onChange([...value, ...urls]);
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
          {value.length}/{max} · MinIO
        </span>
      </div>

      {value.length > 0 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {value.map((url) => (
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
                unoptimized={url.startsWith("/uploads/") || url.includes("localhost")}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-[#1A2330]/75 p-0.5 text-white"
                aria-label="Hapus foto"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={uploading || value.length >= max}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#D5DEEA] bg-[#F7FAFD] px-3 py-4 text-sm font-medium text-[#5B6B7C] transition hover:border-[#2E7DFF]/40 hover:bg-[#EEF3FA]",
          (uploading || value.length >= max) && "opacity-60",
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
            Unggah foto dari perangkat
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
