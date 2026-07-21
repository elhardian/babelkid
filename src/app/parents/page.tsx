"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  Receipt,
} from "lucide-react";
import { HorizontalCarousel } from "@/components/parents/HorizontalCarousel";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import {
  events,
  getClass,
  presenceRecords,
  studentReports,
  tuitionRecords,
} from "@/lib/mock-data";
import { formatDate, formatIDR, formatMonth, todayISO } from "@/lib/format";

const menu = [
  { href: "/parents/tuition", label: "Tuition", icon: Receipt, tone: "#00B894" },
  { href: "/parents/events", label: "Events", icon: CalendarDays, tone: "#FF6B6B" },
  { href: "/parents/presence", label: "Presence", icon: ClipboardList, tone: "#54C6EB" },
  { href: "/parents/reports", label: "Reports", icon: FileText, tone: "#FFD93D" },
];

export default function ParentsHomePage() {
  const { selectedChild, selectedChildId, childIds, children } = useParentKids();
  const cls = getClass(selectedChild.classId);

  // Family events: any kid attending; highlight selected kid's
  const familyEvents = events.filter((e) =>
    e.attendees.some((id) => childIds.includes(id)),
  );
  const childEvents = familyEvents.filter((e) =>
    e.attendees.includes(selectedChildId),
  );
  const carouselEvents = childEvents.length ? childEvents : familyEvents;

  const upcoming = carouselEvents.filter((e) => e.status === "upcoming");
  const latestTuition = tuitionRecords
    .filter((t) => t.studentId === selectedChildId)
    .sort((a, b) => b.month.localeCompare(a.month))[0];
  const todayPresence = presenceRecords.find(
    (p) => p.studentId === selectedChildId && p.date === todayISO(),
  );
  const latestReport = studentReports
    .filter((r) => r.studentId === selectedChildId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-neutral-900">
          Good day
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {selectedChild.nickname} · {cls?.name}
          {children.length > 1 ? (
            <span className="text-neutral-400">
              {" "}
              · {children.length} kids
            </span>
          ) : null}
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Menu</h2>
        </div>
        <HorizontalCarousel>
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-2"
              >
                <span
                  className="flex size-14 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ backgroundColor: m.tone }}
                >
                  <Icon className="size-6" />
                </span>
                <span className="text-xs font-medium text-neutral-700">
                  {m.label}
                </span>
              </Link>
            );
          })}
        </HorizontalCarousel>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Events</h2>
          <Link
            href="/parents/events"
            className="text-xs font-medium text-[#00B894]"
          >
            See all
          </Link>
        </div>
        <HorizontalCarousel>
          {carouselEvents.map((e) => (
            <Link
              key={e.id}
              href={`/parents/events/${e.id}`}
              className="relative h-44 w-[82%] shrink-0 snap-center overflow-hidden rounded-3xl text-white shadow-lg"
            >
              <Image
                src={e.coverImage}
                alt={e.title}
                fill
                className="object-cover"
                sizes="320px"
                priority={e.id === carouselEvents[0]?.id}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                  {e.status} · {formatDate(e.date, "dd MMM")}
                </p>
                <p className="mt-1 font-[family-name:var(--font-fredoka)] text-lg font-semibold leading-tight">
                  {e.title}
                </p>
                <p className="mt-1 text-xs text-white/85">
                  {e.feePerChild > 0 ? formatIDR(e.feePerChild) : "Free"} ·{" "}
                  {e.location}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalCarousel>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">
          Today · {selectedChild.nickname}
        </h2>

        <Link
          href="/parents/presence"
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
        >
          <div>
            <p className="text-xs text-neutral-500">Presence</p>
            <p className="mt-0.5 font-semibold capitalize text-neutral-900">
              {todayPresence?.status ?? "Not marked"}
            </p>
          </div>
          <ArrowRight className="size-4 text-neutral-300" />
        </Link>

        {latestTuition ? (
          <Link
            href="/parents/tuition"
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-xs text-neutral-500">
                Tuition · {formatMonth(latestTuition.month)}
              </p>
              <p className="mt-0.5 font-semibold text-neutral-900">
                {formatIDR(latestTuition.amount)}{" "}
                <span className="text-sm font-medium capitalize text-neutral-500">
                  · {latestTuition.status}
                </span>
              </p>
            </div>
            <ArrowRight className="size-4 text-neutral-300" />
          </Link>
        ) : null}

        {latestReport ? (
          <Link
            href="/parents/reports"
            className="block rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-neutral-500">
              Latest report · {formatDate(latestReport.date)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-800">
              {latestReport.notes}
            </p>
          </Link>
        ) : null}

        {upcoming[0] ? (
          <Link
            href={`/parents/events/${upcoming[0].id}`}
            className="block overflow-hidden rounded-2xl shadow-sm"
          >
            <div className="relative h-28">
              <Image
                src={upcoming[0].coverImage}
                alt={upcoming[0].title}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-[#00B894]/75" />
              <div className="absolute inset-0 p-4 text-white">
                <p className="text-xs text-white/70">Coming up</p>
                <p className="mt-1 font-[family-name:var(--font-fredoka)] text-lg font-semibold">
                  {upcoming[0].title}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  {formatDate(upcoming[0].date)} · {upcoming[0].location}
                </p>
              </div>
            </div>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
