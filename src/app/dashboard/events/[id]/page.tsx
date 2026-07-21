"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  EmptyState,
  StatusBadge,
} from "@/components/dashboard/SearchFilterBar";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { formatDate, formatIDR } from "@/lib/format";
import { getEvent, getStudent } from "@/lib/mock-data";
import type { EventDoc, SchoolEvent } from "@/lib/types";
import { ImagePlus, Trash2 } from "lucide-react";

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=800&q=80",
];

type ModalMode = "add" | "cover" | null;

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const seed = getEvent(id);
  const [event, setEvent] = useState<SchoolEvent | null>(seed ?? null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [imageUrl, setImageUrl] = useState(SAMPLE_PHOTOS[0]);

  if (!event) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-neutral-500">Event not found.</p>
        <Link
          href="/dashboard/events"
          className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
        >
          Back to events
        </Link>
      </div>
    );
  }

  function setCover(url: string) {
    setEvent((prev) => (prev ? { ...prev, coverImage: url } : prev));
  }

  function addPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const doc: EventDoc = {
      id: `d${Date.now()}`,
      caption: String(fd.get("caption") || "Event photo"),
      type: "photo",
      color: "#F4A261",
      imageUrl: String(fd.get("imageUrl") || imageUrl),
      createdAt: new Date().toISOString(),
    };
    setEvent((prev) =>
      prev
        ? { ...prev, documentation: [doc, ...prev.documentation] }
        : prev,
    );
    setModal(null);
  }

  function removePhoto(docId: string) {
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            documentation: prev.documentation.filter((d) => d.id !== docId),
          }
        : prev,
    );
  }

  function saveCover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCover(String(fd.get("imageUrl") || imageUrl));
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/events"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Events
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {event.title}
            </h1>
            <StatusBadge
              label={event.status}
              tone={event.status === "upcoming" ? "success" : "neutral"}
            />
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {formatDate(event.date)} · {event.location}
            {event.feePerChild > 0
              ? ` · ${formatIDR(event.feePerChild)} / child`
              : " · Free"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="relative h-52 sm:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt={event.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            type="button"
            onClick={() => {
              setImageUrl(event.coverImage);
              setModal("cover");
            }}
            className="absolute bottom-4 right-4 rounded-md bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-900"
          >
            Change cover
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-neutral-700">
            {event.description}
          </p>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Attendees ({event.attendees.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {event.attendees.map((sid) => {
                const s = getStudent(sid);
                return (
                  <span
                    key={sid}
                    className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700"
                  >
                    {s?.nickname ?? sid}
                  </span>
                );
              })}
              {event.attendees.length === 0 ? (
                <span className="text-sm text-neutral-400">None yet</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Photos</h2>
          <p className="text-xs text-neutral-500">
            {event.documentation.length} photo
            {event.documentation.length === 1 ? "" : "s"} in gallery
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setImageUrl(SAMPLE_PHOTOS[0]);
            setModal("add");
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <ImagePlus className="size-4" />
          Add photo
        </button>
      </div>

      {event.documentation.length === 0 ? (
        <EmptyState message="No photos yet. Add gallery photos for this event." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {event.documentation.map((d) => (
            <li
              key={d.id}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-neutral-100">
                {d.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.imageUrl}
                    alt={d.caption}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full"
                    style={{ backgroundColor: d.color }}
                  />
                )}
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.caption}</p>
                  <p className="text-xs capitalize text-neutral-500">
                    {d.type} · {formatDate(d.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(d.id)}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label="Remove photo"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="border-t border-neutral-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => d.imageUrl && setCover(d.imageUrl)}
                  disabled={!d.imageUrl}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-40"
                >
                  Use as cover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modal === "add"} onClose={() => setModal(null)} title="Add photo" wide>
        <form onSubmit={addPhoto} className="space-y-3">
          <Field label="Caption">
            <input name="caption" required className={inputClass} placeholder="Short caption" />
          </Field>
          <Field label="Image URL">
            <input
              name="imageUrl"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div>
            <p className="mb-2 text-xs text-neutral-500">Quick pick sample</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SAMPLE_PHOTOS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageUrl(src)}
                  className={`relative aspect-square overflow-hidden rounded-md ring-2 ${
                    imageUrl === src ? "ring-neutral-900" : "ring-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <ModalActions onCancel={() => setModal(null)} submitLabel="Add photo" />
        </form>
      </Modal>

      <Modal open={modal === "cover"} onClose={() => setModal(null)} title="Change cover" wide>
        <form onSubmit={saveCover} className="space-y-3">
          <Field label="Cover image URL">
            <input
              name="imageUrl"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SAMPLE_PHOTOS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageUrl(src)}
                className={`relative aspect-square overflow-hidden rounded-md ring-2 ${
                  imageUrl === src ? "ring-neutral-900" : "ring-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          {imageUrl ? (
            <div className="relative h-36 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="size-full object-cover" />
            </div>
          ) : null}
          <ModalActions onCancel={() => setModal(null)} submitLabel="Save cover" />
        </form>
      </Modal>
    </div>
  );
}
