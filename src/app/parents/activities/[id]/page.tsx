"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  Play,
} from "lucide-react";
import { CampSceneIllustration } from "@/components/parents/ParentsIllustrations";
import { useClassActivitiesStore } from "@/components/dashboard/ClassActivityProvider";
import { formatDate } from "@/lib/format";
import { getClass } from "@/lib/mock-data";

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getById } = useClassActivitiesStore();
  const activity = getById(id);
  const [showMore, setShowMore] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);

  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#C8E4F8] px-6 text-center">
        <p className="text-sm text-[#8A96A8]">Kegiatan tidak ditemukan.</p>
        <Link href="/parents" className="mt-3 text-sm font-medium text-[#2E7DFF]">
          Kembali
        </Link>
      </div>
    );
  }

  const cls = getClass(activity.classId);
  const media = [
    ...activity.images.map((src) => ({ type: "image" as const, src })),
    ...(activity.videoUrl
      ? [{ type: "video" as const, src: activity.videoUrl }]
      : []),
  ];
  const current = media[activeMedia] ?? media[0];

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <div className="relative h-[38vh] min-h-[220px] shrink-0 overflow-hidden animate-hero-zoom">
        {current?.type === "video" ? (
          <video
            key={current.src}
            src={current.src}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
            poster={activity.images[0]}
          />
        ) : current?.src ? (
          <Image
            src={current.src}
            alt={activity.title}
            fill
            className="object-cover"
            sizes="400px"
            priority
          />
        ) : (
          <CampSceneIllustration className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        <Link
          href="/parents"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white/95 text-[#1A2330] shadow-md backdrop-blur-sm"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <div className="relative z-10 -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 shadow-[0_-12px_40px_rgba(26,35,48,0.08)] animate-sheet-up">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
              {activity.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#8A96A8]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-[#7BA3D4]" />
                {activity.location ?? cls?.name ?? "Kelas"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5 text-[#7BA3D4]" />
                {formatDate(activity.date, "d MMM yyyy")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1A2330] px-3.5 py-2 text-xs font-medium text-white"
          >
            <Heart
              className={`size-3.5 ${liked ? "fill-[#F0783C] text-[#F0783C]" : ""}`}
            />
            {liked ? "Disukai" : "Suka"}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] bg-[#E8F3FC] px-4 py-3">
          <div>
            <p className="text-[11px] text-[#8A96A8]">Guru</p>
            <p className="text-sm font-medium text-[#1A2330]">
              {activity.teacherName}
            </p>
          </div>
          <div className="h-8 w-px bg-[#C5D9EE]" />
          <div>
            <p className="text-[11px] text-[#8A96A8]">Kelas</p>
            <p className="text-sm font-medium text-[#1A2330]">
              {cls?.name ?? "—"}
            </p>
          </div>
          <div className="h-8 w-px bg-[#C5D9EE]" />
          <div>
            <p className="text-[11px] text-[#8A96A8]">Media</p>
            <p className="text-sm font-medium text-[#1A2330]">
              {activity.images.length} foto
              {activity.videoUrl ? " · 1 video" : ""}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-base font-medium text-[#1A2330]">
            Tentang kegiatan
          </h2>
          <p
            className={`mt-2 text-sm leading-relaxed text-[#5B6B7C] ${
              showMore ? "" : "line-clamp-3"
            }`}
          >
            {activity.description}
          </p>
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="mt-1 text-sm font-medium text-[#F0783C]"
          >
            {showMore ? "Sembunyikan" : "Baca selengkapnya"}
          </button>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-medium text-[#1A2330]">
            Foto & video
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {media.map((m, i) => (
              <button
                key={`${m.src}-${i}`}
                type="button"
                onClick={() => setActiveMedia(i)}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${
                  activeMedia === i ? "ring-2 ring-[#2E7DFF]" : ""
                }`}
              >
                {m.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1A2330]/80">
                    <Play className="size-8 fill-white text-white" />
                  </div>
                ) : (
                  <Image
                    src={m.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#8A96A8]">Diunggah guru</p>
            <p className="text-sm font-medium text-[#1A2330]">
              {formatDate(activity.date)}
            </p>
          </div>
          <Link
            href="/parents/reports"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2E7DFF] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#2E7DFF]/30"
          >
            Laporan <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
