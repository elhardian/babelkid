import Link from "next/link";
import { KasOverviewCards } from "@/components/dashboard/KasOverviewCards";
import {
  classes,
  events,
  students,
  tuitionRecords,
} from "@/lib/mock-data";
import { formatIDR } from "@/lib/format";

export default function DashboardOverviewPage() {
  const activeStudents = students.filter((s) => s.status === "active").length;
  const pendingTuition = tuitionRecords.filter(
    (t) => t.status === "pending" || t.status === "overdue" || t.status === "submitted",
  );
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const collected = tuitionRecords
    .filter((t) => t.month === "2026-07" && t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: "Active students", value: String(activeStudents) },
    { label: "Classes", value: String(classes.length) },
    { label: "Tuition collected (Jul)", value: formatIDR(collected) },
    { label: "Pending payments", value: String(pendingTuition.length) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">
          BabelKids operations at a glance
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {s.label}
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Kas balance</h2>
          <Link
            href="/dashboard/kas"
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            Open kas
          </Link>
        </div>
        <KasOverviewCards />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Needs attention</h2>
            <Link
              href="/dashboard/tuition"
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              View tuition
            </Link>
          </div>
          <ul className="divide-y divide-neutral-100">
            {pendingTuition.slice(0, 5).map((t) => {
              const student = students.find((s) => s.id === t.studentId);
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{student?.name}</p>
                    <p className="text-xs capitalize text-neutral-500">
                      {t.status.replace("_", " ")} · {t.month}
                    </p>
                  </div>
                  <span className="tabular-nums text-neutral-700">
                    {formatIDR(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Upcoming events</h2>
            <Link
              href="/dashboard/events"
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              View events
            </Link>
          </div>
          <ul className="divide-y divide-neutral-100">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-neutral-500">
                  {e.date} · {e.location}
                  {e.feePerChild > 0
                    ? ` · Fee ${formatIDR(e.feePerChild)}`
                    : " · Free"}
                </p>
              </li>
            ))}
            {upcomingEvents.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-neutral-500">
                No upcoming events
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["/dashboard/presence", "Take presence"],
            ["/dashboard/reports", "Submit report"],
            ["/dashboard/students", "Manage students"],
            ["/dashboard/kas", "Kas balance"],
            ["/dashboard/finance", "Finance report"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
