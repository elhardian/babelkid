"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  Send,
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

  if (!event) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Event not found.{" "}
        <Link href="/parents/events" className="text-[#00B894]">
          Back
        </Link>
      </div>
    );
  }

  const docs = event.documentation;
  const hasDocs = docs.length > 0;
  const mainImage = hasDocs
    ? docs[activeDoc].imageUrl ?? event.coverImage
    : event.coverImage;

  return (
    <div className="space-y-5">
      <Link
        href="/parents/events"
        className="inline-flex items-center gap-1 text-sm font-medium text-[#00B894]"
      >
        <ArrowLeft className="size-4" /> Events
      </Link>

      <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#00B894] p-[2px]">
            <span className="flex size-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#00B894]">
              BK
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">babelkids.official</p>
            <p className="truncate text-xs text-[#00B894]">#{event.title}</p>
          </div>
        </div>

        <button
          type="button"
          className="relative aspect-square w-full"
          onClick={() => {
            if (hasDocs) setActiveDoc((i) => (i + 1) % docs.length);
          }}
        >
          <Image
            src={mainImage}
            alt={hasDocs ? docs[activeDoc].caption : event.title}
            fill
            className="object-cover"
            sizes="400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
            <p className="font-[family-name:var(--font-fredoka)] text-xl font-semibold">
              {hasDocs ? docs[activeDoc].caption : event.title}
            </p>
            {hasDocs ? (
              <p className="mt-1 text-xs text-white/80">
                Tap to browse · {activeDoc + 1}/{docs.length}
              </p>
            ) : null}
          </div>
          {hasDocs && docs.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {docs.map((d, i) => (
                <span
                  key={d.id}
                  className={`h-1.5 rounded-full ${
                    i === activeDoc ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </button>

        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              aria-label="Like"
            >
              <Heart
                className={`size-6 ${liked ? "fill-[#FF6B6B] text-[#FF6B6B]" : "text-neutral-800"}`}
              />
            </button>
            <MessageCircle className="size-6 text-neutral-800" />
            <Send className="size-6 text-neutral-800" />
            <Bookmark className="ml-auto size-6 text-neutral-800" />
          </div>
          <p className="mt-2 text-sm font-semibold">
            {(liked ? 1 : 0) + (hasDocs ? 42 : 12)} likes
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            <span className="font-semibold">babelkids.official</span>{" "}
            {event.description}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {formatDate(event.date)} · {event.location} ·{" "}
            {event.feePerChild > 0 ? formatIDR(event.feePerChild) : "Free"}
          </p>
        </div>
      </article>
    </div>
  );
}
