"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Baby,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Menu,
  Receipt,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/format";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "Students", icon: Baby },
  { href: "/dashboard/classes", label: "Classes", icon: GraduationCap },
  { href: "/dashboard/tuition", label: "Tuition", icon: Receipt },
  { href: "/dashboard/kas", label: "Kas Balance", icon: Landmark },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/finance", label: "Finance", icon: Wallet },
  { href: "/dashboard/presence", label: "Presence", icon: ClipboardList },
  { href: "/dashboard/reports", label: "Reports", icon: Users },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);
    return cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
      active
        ? "bg-neutral-900 text-white"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
    );
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={linkClass(item.href)}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-semibold tracking-tight text-neutral-900">
          BabelKids
        </span>
        <span className="w-9" />
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold tracking-tight">
                BabelKids
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks />
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-white p-4 lg:flex">
        <div className="mb-8 px-3">
          <p className="text-lg font-semibold tracking-tight text-neutral-900">
            BabelKids
          </p>
          <p className="text-xs text-neutral-500">Staff dashboard</p>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-neutral-100 pt-4 px-3">
          <p className="text-xs text-neutral-500">Signed in as</p>
          <p className="text-sm font-medium text-neutral-900">Maya Santoso</p>
          <p className="text-xs text-neutral-500">Owner</p>
          <Link
            href="/"
            className="mt-3 block text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            Back to website
          </Link>
        </div>
      </aside>
    </>
  );
}
