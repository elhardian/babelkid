"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { SwipeableGallery } from "@/components/SwipeableGallery";
import { activityPosts } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { ActivityPost } from "@/lib/types";

const programs = [
  {
    title: "Preschool",
    ages: "2–4",
    agesLabel: "Ages",
    blurb: "Sensory play, routines, and first friendships in a gentle space.",
    accent: "#00B894",
    soft: "#D4F8EC",
    image:
      "/preschool.png",
    rotate: "-rotate-2",
  },
  {
    title: "Kindergarten",
    ages: "4–6",
    agesLabel: "Ages",
    blurb: "Phonics, curiosity projects, and readiness for primary school.",
    accent: "#FFD93D",
    soft: "#FFF6C2",
    image:
      "/kindergarten.jpg",
    rotate: "rotate-1",
  },
  {
    title: "Bilingual",
    ages: "All",
    agesLabel: "We",
    blurb: "English & Bahasa woven into songs, stories, and daily moments.",
    accent: "#54C6EB",
    soft: "#E8F7FC",
    image:
      "/bilingual.jpg",
    rotate: "rotate-2",
  },
];

const curriculum = [
  {
    title: "Language & literacy",
    blurb: "Phonics, storytelling, and everyday bilingual conversation.",
    color: "#00B894",
  },
  {
    title: "Numeracy & curiosity",
    blurb: "Counting through play, patterns, and hands-on experiments.",
    color: "#FFD93D",
  },
  {
    title: "Social & emotional",
    blurb: "Sharing, feelings vocabulary, and kind classroom habits.",
    color: "#FF6B6B",
  },
  {
    title: "Movement & outdoors",
    blurb: "Garden time, gross-motor play, and nature walks.",
    color: "#54C6EB",
  },
];

const reviews = [
  {
    name: "Sari R.",
    role: "Parent of Alya",
    quote:
      "Teachers know every child by name. Alya comes home singing new English songs every week.",
    blob: "#D4F8EC",
  },
  {
    name: "Budi W.",
    role: "Parent of Kenzo",
    quote:
      "The garden days are magical. We finally found a school that feels warm and structured.",
    blob: "#FFF6C2",
  },
  {
    name: "Lina K.",
    role: "Parent of Sofia",
    quote:
      "Reports are clear and kind. We always know how Sofia is growing — academically and socially.",
    blob: "#FFB4C8",
  },
];

const HERO_BG = "/hero.png";
const HERO_FLOAT = "/hero-float.png";

/* ——— Reusable doodle / wave helpers ——— */

function WaveDivider({
  topColor,
  bottomColor,
  flip = false,
  className = "",
}: {
  topColor: string;
  bottomColor: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`wave-divider relative z-10 ${flip ? "rotate-180" : ""} ${className}`}
      style={{ backgroundColor: topColor }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,64 C240,120 480,0 720,40 C960,80 1200,100 1440,48 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
}

function DoodleDots({
  className = "",
  color = "#00B894",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="5" fill={color} opacity="0.85" />
      <circle cx="28" cy="8" r="4" fill={color} opacity="0.55" />
      <circle cx="48" cy="8" r="5" fill={color} opacity="0.7" />
      <circle cx="8" cy="28" r="4" fill={color} opacity="0.5" />
      <circle cx="28" cy="28" r="5" fill={color} opacity="0.9" />
      <circle cx="48" cy="28" r="3.5" fill={color} opacity="0.45" />
      <circle cx="8" cy="48" r="5" fill={color} opacity="0.65" />
      <circle cx="28" cy="48" r="3.5" fill={color} opacity="0.4" />
      <circle cx="48" cy="48" r="5" fill={color} opacity="0.75" />
    </svg>
  );
}

function StampBadge({
  children,
  className = "",
  color = "#FF6B6B",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`stamp-badge flex items-center justify-center text-center font-[family-name:var(--font-fredoka)] font-semibold leading-tight ${className}`}
      style={{ color, backgroundColor: "rgba(255,253,248,0.92)" }}
    >
      {children}
    </div>
  );
}

function SvgStar({
  className = "",
  color = "#FFD93D",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
    >
      <path
        d="M18 2 L21.5 13.5 L33 14 L24 21.5 L27 33 L18 26.5 L9 33 L12 21.5 L3 14 L14.5 13.5 Z"
        fill={color}
      />
    </svg>
  );
}

function SvgLeaf({
  className = "",
  color = "#00B894",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      width="40"
      height="48"
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 2 C32 12 38 28 20 46 C2 28 8 12 20 2 Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M20 10 L20 40"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function SvgBlob({
  className = "",
  color = "#FFB4C8",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      <path
        d="M44.7,-67.2C57.2,-59.3,66.1,-45.5,72.4,-30.4C78.7,-15.3,82.4,1.1,78.9,15.6C75.4,30.1,64.7,42.7,51.8,53.4C38.9,64.1,23.8,72.9,6.9,76.1C-10,79.3,-28.7,76.9,-43.9,68.4C-59.1,59.9,-70.8,45.3,-76.2,28.8C-81.6,12.3,-80.7,-6.1,-73.9,-21.4C-67.1,-36.7,-54.4,-48.9,-40.3,-56.5C-26.2,-64.1,-10.7,-67.1,3.8,-72.5C18.3,-77.9,32.2,-75.1,44.7,-67.2Z"
        transform="translate(100 100)"
        fill={color}
      />
    </svg>
  );
}

function EventActivityCard({ post }: { post: ActivityPost }) {
  return (
    <article className="group relative">
      <div
        className="pointer-events-none absolute -inset-3 -z-10 blob-soft opacity-70 transition group-hover:scale-105"
        style={{ backgroundColor: "#FFF6C2" }}
      />
      <div className="overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lg shadow-black/10">
        <SwipeableGallery
          images={post.images}
          alt={post.eventName}
          rounded="rounded-none"
          aspect="aspect-[4/3]"
        />
        <div className="px-5 py-4">
          <p className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[var(--bk-ink)]">
            {post.eventName}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--bk-mint)]">
            {formatDate(post.date, "dd MMM yyyy")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--bk-ink)]/70">
            {post.description}
          </p>
        </div>
      </div>
      <StampBadge
        color="#54C6EB"
        className="absolute -right-2 -top-3 size-16 rotate-12 text-[10px] leading-tight animate-wiggle"
      >
        Snap!
      </StampBadge>
    </article>
  );
}

function downloadBrochure() {
  const text = `BabelKids Preschool & Kindergarten
Brochure (demo)

Programs
- Preschool (ages 2–4): sensory play, routines, first friendships
- Kindergarten (ages 4–6): phonics, curiosity projects, school readiness
- Bilingual path: English & Bahasa in songs, stories, and daily moments

A day at BabelKids
Morning circle · Garden time · Story hour · Art studio

Visit us
Tours run Tuesday & Thursday mornings.
Contact: hello@babelkids.id

© BabelKids
`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "babelkids-brochure.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bk-paper)] text-[var(--bk-ink)]">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-black/5 bg-white/90 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a
            href="#top"
            className={`font-[family-name:var(--font-fredoka)] text-xl font-semibold tracking-tight transition ${
              scrolled ? "text-[var(--bk-mint)]" : "text-[var(--bk-ink)]"
            }`}
          >
            BabelKids
          </a>
          <nav
            className={`hidden items-center gap-7 text-sm font-medium md:flex ${
              scrolled ? "text-[var(--bk-ink)]/70" : "text-[var(--bk-ink)]/75"
            }`}
          >
            <a href="#programs" className="hover:opacity-80">
              Programs
            </a>
            <a href="#curriculum" className="hover:opacity-80">
              Curriculum
            </a>
            <a href="#events" className="hover:opacity-80">
              Events
            </a>
            <a href="#reviews" className="hover:opacity-80">
              Reviews
            </a>
            <a href="#visit" className="hover:opacity-80">
              Visit
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/parents"
              className={`hidden rounded-full px-3 py-2 text-sm font-medium sm:inline ${
                scrolled
                  ? "text-[var(--bk-ink)]/70 hover:text-[var(--bk-mint)]"
                  : "text-[var(--bk-ink)]/75 hover:text-[var(--bk-mint)]"
              }`}
            >
              Parent app
            </Link>
            <Link
              href="/dashboard"
              className={`hidden rounded-full px-3 py-2 text-sm font-medium sm:inline ${
                scrolled
                  ? "text-[var(--bk-ink)]/70 hover:text-[var(--bk-mint)]"
                  : "text-[var(--bk-ink)]/75 hover:text-[var(--bk-mint)]"
              }`}
            >
              Staff
            </Link>
            <a
              href="#visit"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--bk-coral)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#FF6B6B]/30 transition hover:scale-105 hover:brightness-105"
            >
              Book a visit
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ——— HERO ——— */}
        <section className="relative min-h-[100svh] overflow-hidden bg-[#FFE8D6]">
          <Image
            src={HERO_BG}
            alt="Illustrated school building on a sunny day"
            fill
            priority
            className="object-cover object-left-bottom lg:object-[15%_bottom]"
            sizes="100vw"
          />

          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FFFDF8]/75 via-[#FFFDF8]/20 to-[#FFFDF8]/85 sm:bg-gradient-to-t sm:from-[#FFFDF8]/50 sm:via-transparent sm:to-transparent"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-[100svh] flex-col">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-24 sm:justify-center sm:px-5 sm:pt-28">
              <div className="hero-copy-blob animate-fade-up w-full max-sm:px-6 max-sm:py-7 sm:max-w-[36rem] sm:px-10 sm:py-11">
                <SvgStar
                  color="#FFD93D"
                  className="animate-bob pointer-events-none absolute -bottom-3 -left-3 size-9 opacity-90"
                />
                <DoodleDots
                  color="#00B894"
                  className="pointer-events-none absolute -right-2 bottom-6 size-12 opacity-40"
                />
                <p className="font-[family-name:var(--font-fredoka)] text-5xl font-bold leading-[0.9] tracking-tight text-[var(--bk-ink)] sm:text-7xl md:text-8xl">
                  BabelKids
                </p>
                <h1 className="animate-fade-up delay-100 mt-4 max-w-lg text-xl font-semibold leading-snug text-[var(--bk-ink)] sm:mt-5 sm:text-2xl md:text-3xl">
                  Where little voices find their world.
                </h1>
                <p className="animate-fade-up delay-200 mt-3 max-w-md text-sm leading-relaxed text-[var(--bk-ink)]/80 sm:mt-4 sm:text-base md:text-lg">
                  Preschool & kindergarten with bilingual play, outdoor wonder, and
                  teachers who know every child by name.
                </p>
                <div className="animate-fade-up delay-300 mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <a
                    href="#visit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--bk-mint)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:brightness-105 hover:shadow-xl"
                  >
                    Schedule a tour
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="#programs"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--bk-ink)]/20 bg-white/70 px-6 py-3.5 text-sm font-semibold text-[var(--bk-ink)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Explore programs
                  </a>
                </div>
              </div>
            </div>

            <div
              className="hero-float-kids animate-float-mid pointer-events-none flex shrink-0 justify-center px-0 pb-32 pt-6 sm:px-0 sm:pb-0 sm:pt-0"
              aria-hidden
            >
              <Image
                src={HERO_FLOAT}
                alt=""
                width={2400}
                height={1600}
                priority
                className="h-auto w-full object-contain object-bottom"
                sizes="(max-width: 640px) 170vw, (max-width: 1024px) 50vw, 42rem"
              />
            </div>
          </div>

          <StampBadge
            color="#FF6B6B"
            className="animate-wiggle absolute left-[6%] top-[32%] z-20 hidden size-24 text-xs sm:flex sm:size-28 sm:text-sm md:left-[10%] md:top-[28%] md:size-32 md:text-base"
          >
            Play · Grow
            <br />
            Belong
          </StampBadge>

          <div className="absolute bottom-0 left-0 right-0 z-20">
            <WaveDivider topColor="transparent" bottomColor="#FFFDF8" />
          </div>
        </section>

        {/* ——— PROGRAMS ——— */}
        <section id="programs" className="relative bg-[var(--bk-paper)] pb-8 pt-8">
          <div className="pointer-events-none absolute left-4 top-16 opacity-40 sm:left-10">
            <DoodleDots color="#FFB4C8" />
          </div>
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[var(--bk-mint)]/20 sm:text-8xl">
              We
            </p>
            <h2 className="-mt-6 max-w-lg font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Learning that feels like play
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Small classes, big curiosity — pick the path that fits your child.
            </p>

            <div className="relative mt-16 flex flex-col items-center gap-14 md:flex-row md:items-end md:justify-center md:gap-6 lg:gap-10">
              {programs.map((p, idx) => (
                <article
                  key={p.title}
                  className={`relative w-full max-w-xs ${p.rotate} transition duration-300 hover:-translate-y-3 hover:rotate-0 ${
                    idx === 1 ? "md:-translate-y-8" : ""
                  } ${idx === 2 ? "md:translate-y-4" : ""}`}
                  style={{ zIndex: 3 - idx }}
                >
                  <div
                    className="absolute -left-4 -top-6 z-20 font-[family-name:var(--font-fredoka)] text-5xl font-bold leading-none sm:text-6xl"
                    style={{ color: p.accent }}
                  >
                    <span className="block text-lg font-semibold uppercase tracking-widest opacity-70">
                      {p.agesLabel}
                    </span>
                    {p.ages}
                  </div>
                  <div className="photo-frame relative aspect-[3/4]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 80vw, 280px"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16"
                    >
                      <h3 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-white">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/85">{p.blurb}</p>
                    </div>
                  </div>
                  <SvgStar
                    color={p.accent}
                    className={`pointer-events-none absolute -right-3 top-1/3 size-8 ${
                      idx % 2 === 0 ? "animate-bob" : "animate-float-mid"
                    }`}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider topColor="#FFFDF8" bottomColor="#D4F8EC" />

        {/* ——— CURRICULUM ——— */}
        <section id="curriculum" className="relative bg-[#D4F8EC] py-20">
          <SvgBlob
            color="#54C6EB"
            className="animate-float-slow pointer-events-none absolute -right-20 top-10 size-64 opacity-30"
          />
          <SvgLeaf
            color="#019875"
            className="animate-wiggle pointer-events-none absolute bottom-16 left-8 size-12 opacity-50"
          />
          <div className="relative mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#00B894]/25 sm:text-8xl">
              Our
            </p>
            <h2 className="-mt-6 max-w-lg font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Four pillars of every week
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              A balanced mix of language, numbers, feelings, and outdoor
              discovery.
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {curriculum.map((c, i) => (
                <div
                  key={c.title}
                  className={`relative overflow-hidden rounded-[2rem] bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  }`}
                >
                  <div
                    className="mb-4 size-4 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--bk-ink)]/70">
                    {c.blurb}
                  </p>
                  <DoodleDots
                    color={c.color}
                    className="pointer-events-none absolute -bottom-2 -right-2 size-14 opacity-30"
                  />
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={downloadBrochure}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--bk-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[var(--bk-mint-deep)]"
              >
                <Download className="size-4" />
                Download brochure
              </button>
              <StampBadge
                color="#00B894"
                className="size-20 rotate-[-8deg] text-[11px] animate-bob"
              >
                Free
                <br />
                PDF
              </StampBadge>
            </div>
          </div>
        </section>

        <WaveDivider topColor="#D4F8EC" bottomColor="#FFF6C2" />

        {/* ——— EVENTS ——— */}
        <section id="events" className="relative bg-[#FFF6C2] py-20">
          <DoodleDots
            color="#FF6B6B"
            className="animate-float-mid pointer-events-none absolute right-10 top-12 opacity-50"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#FFD93D]/50 sm:text-8xl">
              Fun
            </p>
            <h2 className="-mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Moments from our events
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Swipe through photos from recent school events — name, date, and a
              short story.
            </p>

            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {activityPosts.slice(0, 3).map((post, i) => (
                <div
                  key={post.id}
                  className={`animate-pop-in ${i === 1 ? "lg:mt-8" : ""} ${i === 2 ? "lg:-mt-4" : ""}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <EventActivityCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider topColor="#FFF6C2" bottomColor="#FFFDF8" />

        {/* ——— REVIEWS ——— */}
        <section id="reviews" className="relative bg-[var(--bk-paper)] py-20">
          <SvgStar
            color="#FFD93D"
            className="animate-bob pointer-events-none absolute left-[5%] top-20 size-10 opacity-70"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#FFB4C8]/40 sm:text-8xl">
              Love
            </p>
            <h2 className="-mt-6 max-w-lg font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              What parents say
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Real voices from families who trust BabelKids with their little
              ones.
            </p>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {reviews.map((r, i) => (
                <blockquote key={r.name} className="relative pt-6">
                  <div
                    className="blob-soft absolute -inset-x-2 -inset-y-1 -z-10 opacity-80"
                    style={{ backgroundColor: r.blob }}
                  />
                  <p className="font-[family-name:var(--font-fredoka)] text-5xl leading-none text-[var(--bk-coral)]/40">
                    “
                  </p>
                  <p className="-mt-4 text-sm leading-relaxed text-[var(--bk-ink)]/80 sm:text-base">
                    {r.quote}
                  </p>
                  <footer className="mt-5 flex items-center gap-3">
                    <StampBadge
                      color={i === 0 ? "#00B894" : i === 1 ? "#FF6B6B" : "#54C6EB"}
                      className="size-12 shrink-0 text-[10px]"
                    >
                      ★★★
                    </StampBadge>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-[var(--bk-ink)]/50">{r.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider topColor="#FFFDF8" bottomColor="#00B894" />

        {/* ——— PARENT APP CTA ——— */}
        <section className="relative bg-[var(--bk-mint)] py-20 text-white">
          <SvgBlob
            color="#54C6EB"
            className="animate-float-mid pointer-events-none absolute -left-16 top-0 size-56 opacity-40"
          />
          <SvgStar
            color="#FFD93D"
            className="animate-wiggle pointer-events-none absolute right-12 top-10 size-12"
          />
          <DoodleDots
            color="#FFB4C8"
            className="pointer-events-none absolute bottom-10 right-[20%] opacity-60"
          />
          <div className="relative mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-6xl font-bold leading-none text-white/25 sm:text-7xl">
              Stay
            </p>
            <h2 className="-mt-4 max-w-xl font-[family-name:var(--font-fredoka)] text-3xl font-semibold sm:-mt-6 sm:text-5xl">
              Parents stay close — even when they’re not in the room.
            </h2>
            <p className="mt-4 max-w-md text-white/90">
              Daily presence, weekly reports, events, and tuition — all in a
              simple parent app made for your phone.
            </p>
            <Link
              href="/parents"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--bk-mint-deep)] transition hover:scale-105 hover:bg-[var(--bk-sun-soft)]"
            >
              Open parent app
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <WaveDivider topColor="#00B894" bottomColor="#FFB4C8" />

        {/* ——— VISIT ——— */}
        <section id="visit" className="relative bg-[#FFB4C8] py-20">
          <SvgLeaf
            color="#FF6B6B"
            className="animate-float-slow pointer-events-none absolute left-6 top-12 size-14 opacity-50"
          />
          <SvgStar
            color="#FFD93D"
            className="animate-bob pointer-events-none absolute right-8 bottom-24 size-9"
          />
          <div className="relative mx-auto max-w-xl px-5 text-center">
            <StampBadge
              color="#FF6B6B"
              className="mx-auto mb-6 size-24 rotate-6 text-sm animate-wiggle"
            >
              Come
              <br />
              visit!
            </StampBadge>
            <h2 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:text-5xl">
              Come see us
            </h2>
            <p className="mt-3 text-[var(--bk-ink)]/70">
              Tours run Tuesday & Thursday mornings. Bring your little one —
              we’d love to meet you both.
            </p>
            <form
              className="mt-10 space-y-3 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks! We’ll be in touch soon. (Demo form)");
              }}
            >
              <input
                required
                name="name"
                placeholder="Parent name"
                className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3.5 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(255,107,107,0.25)]"
              />
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3.5 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(255,107,107,0.25)]"
              />
              <input
                name="child"
                placeholder="Child’s age (optional)"
                className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3.5 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(255,107,107,0.25)]"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--bk-sun)] py-3.5 text-sm font-bold text-[var(--bk-ink)] shadow-md transition hover:scale-[1.02] hover:brightness-105"
              >
                Request a tour
              </button>
            </form>
          </div>
        </section>

        <WaveDivider topColor="#FFB4C8" bottomColor="#1A2E35" />
      </main>

      <footer className="bg-[var(--bk-ink)] py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
          <p className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[var(--bk-mint)]">
            BabelKids
          </p>
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} BabelKids Preschool & Kindergarten
          </p>
          <div className="flex gap-5 text-sm text-white/70">
            <Link href="/parents" className="hover:text-[var(--bk-sun)]">
              Parents
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--bk-sun)]">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
