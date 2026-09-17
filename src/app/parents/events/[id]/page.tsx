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
} from "lucide-react";
import { formatDate, formatIDR } from "@/lib/format";
import { getEvent } from "@/lib/mock-data";

export default function ParentEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = getEvent(id);
  const [activeDoc, setActiveDoc] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#C8E4F8] px-6">
        <p className="text-sm text-[#8A96A8]">Acara tidak ditemukan.</p>
        <Link
          href="/parents/events"
          className="mt-3 text-sm font-medium text-[#2E7DFF]"
        >
          Kembali
        </Link>
      </div>
    );
  }

  const docs = event.documentation;
  const gallery =
    docs.length > 0
      ? docs.map((d) => ({
          src: d.imageUrl ?? event.coverImage,
          caption: d.caption,
        }))
      : [{ src: event.coverImage, caption: event.title }];

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <div className="relative h-[38vh] min-h-[220px] shrink-0 overflow-hidden animate-hero-zoom">
        <Image
          src={gallery[activeDoc]?.src ?? event.coverImage}
          alt={gallery[activeDoc]?.caption ?? event.title}
          fill
          className="object-cover"
          sizes="400px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />
        <Link
          href="/parents/events"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white/95 text-[#1A2330] shadow-md backdrop-blur-sm"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <div className="relative z-10 -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 shadow-[0_-12px_40px_rgba(26,35,48,0.08)] animate-sheet-up">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[#2E7DFF]">
              {event.status === "past" ? "Selesai" : "Mendatang"}
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-[#1A2330]">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#8A96A8]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-[#7BA3D4]" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5 text-[#7BA3D4]" />
                {formatDate(event.date)}
                {event.endDate ? ` – ${formatDate(event.endDate)}` : ""}
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
            {event.attendees.length}
          </button>
        </div>

        <div className="mt-5 rounded-[1.25rem] bg-[#E8F3FC] px-4 py-3">
          <p className="text-[11px] text-[#8A96A8]">Biaya per anak</p>
          <p className="text-lg font-medium text-[#1A2330]">
            {event.feePerChild > 0 ? formatIDR(event.feePerChild) : "Gratis"}
          </p>
        </div>

        <section className="mt-6">
          <h2 className="text-base font-medium text-[#1A2330]">Tentang acara</h2>
          <p
            className={`mt-2 text-sm leading-relaxed text-[#5B6B7C] ${
              showMore ? "" : "line-clamp-3"
            }`}
          >
            {event.description}
          </p>
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="mt-1 text-sm font-medium text-[#F0783C]"
          >
            {showMore ? "Sembunyikan" : "Baca selengkapnya"}
          </button>
        </section>

        {gallery.length > 1 ? (
          <section className="mt-6">
            <h2 className="mb-3 text-base font-medium text-[#1A2330]">
              Dokumentasi
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {gallery.map((g, i) => (
                <button
                  key={`${g.src}-${i}`}
                  type="button"
                  onClick={() => setActiveDoc(i)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${
                    activeDoc === i ? "ring-2 ring-[#2E7DFF]" : ""
                  }`}
                >
                  <Image
                    src={g.src}
                    alt={g.caption}
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-8">
          <div>
            <p className="text-xs text-[#8A96A8]">Total</p>
            <p className="text-base font-medium text-[#1A2330]">
              {event.feePerChild > 0 ? formatIDR(event.feePerChild) : "Gratis"}
            </p>
          </div>
          <Link
            href="/parents/pay"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2E7DFF] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#2E7DFF]/30"
          >
            Daftar <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
