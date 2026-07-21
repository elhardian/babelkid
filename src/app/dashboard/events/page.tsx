"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EmptyState,
  FilterSelect,
  SearchFilterBar,
  StatusBadge,
} from "@/components/dashboard/SearchFilterBar";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { CurrencyInput } from "@/components/dashboard/CurrencyInput";
import { formatDate, formatIDR } from "@/lib/format";
import { events as initialEvents } from "@/lib/mock-data";
import type { EventStatus, SchoolEvent } from "@/lib/types";

type ModalMode = "add" | "edit" | null;

export default function EventsPage() {
  const [rows, setRows] = useState<SchoolEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<SchoolEvent | null>(null);
  const [feePerChild, setFeePerChild] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: SchoolEvent = {
      id: active?.id ?? `e${Date.now()}`,
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      date: String(fd.get("date") || ""),
      location: String(fd.get("location") || ""),
      feePerChild,
      status: (String(fd.get("status")) as EventStatus) || "upcoming",
      coverGradient:
        active?.coverGradient ??
        "linear-gradient(135deg, #2A9D8F 0%, #E9C46A 100%)",
      coverImage:
        active?.coverImage ??
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80",
      attendees: active?.attendees ?? [],
      documentation: active?.documentation ?? [],
    };
    if (modal === "edit" && active) {
      setRows((prev) => prev.map((ev) => (ev.id === active.id ? payload : ev)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Fees, attendees, and photos
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActive(null);
            setFeePerChild(0);
            setModal("add");
          }}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create event
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search events…"
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "ongoing", label: "Ongoing" },
            { value: "past", label: "Past" },
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="No events match your filters." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <div className="relative h-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.coverImage}
                  alt={e.title}
                  className="size-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{e.title}</h2>
                      <StatusBadge
                        label={e.status}
                        tone={e.status === "upcoming" ? "success" : "neutral"}
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatDate(e.date)} · {e.location}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm text-neutral-700">
                      {e.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-sm sm:text-right">
                    <p className="text-xs text-neutral-500">Fee / child</p>
                    <p className="font-semibold tabular-nums">
                      {e.feePerChild > 0 ? formatIDR(e.feePerChild) : "Free"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">Photos</p>
                    <p className="font-medium tabular-nums">
                      {e.documentation.length}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <Link
                    href={`/dashboard/events/${e.id}`}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    View detail
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(e);
                      setFeePerChild(e.feePerChild);
                      setModal("edit");
                    }}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Edit event" : "Create event"}
        wide
      >
        <form onSubmit={save} className="space-y-3">
          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={active?.title}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={active?.description}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                name="date"
                type="date"
                required
                defaultValue={active?.date}
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                name="location"
                required
                defaultValue={active?.location}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fee per child">
              <CurrencyInput
                name="feePerChild"
                value={feePerChild}
                onChange={setFeePerChild}
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                defaultValue={active?.status ?? "upcoming"}
                className={inputClass}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
              </select>
            </Field>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            submitLabel={modal === "edit" ? "Update" : "Create"}
          />
        </form>
      </Modal>
    </div>
  );
}
