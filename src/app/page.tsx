"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { SwipeableGallery } from "@/components/SwipeableGallery";
import { activityPosts } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { ActivityPost } from "@/lib/types";

const WHATSAPP_URL =
  "https://wa.me/6281210001001?text=Halo%20BabelKids%2C%20saya%20ingin%20bertanya%20tentang%20sekolah.";
const MAPS_URL =
  "https://www.google.com/maps/place/Babel+Kids/@-2.1252929,106.1078513,17z/data=!3m1!4b1!4m6!3m5!1s0x2e22c126527c90d9:0xc51d961435f321c8!8m2!3d-2.1252929!4d106.1078513!16s%2Fg%2F11c53n95s3";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Babel+Kids+-2.1252929,106.1078513&z=17&output=embed";
const BROCHURE_URL = "/brochure.jpg";

const programs = [
  {
    title: "Kelompok Bermain",
    ages: "2–4",
    agesLabel: "Usia",
    blurb: "Bermain sensorik, rutinitas hangat, dan persahabatan pertama.",
    accent: "#00B894",
    soft: "#D4F8EC",
    image: "/preschool.png",
    rotate: "-rotate-2",
  },
  {
    title: "Taman Kanak-Kanak",
    ages: "4–6",
    agesLabel: "Usia",
    blurb: "Kesiapan sekolah, projek rasa ingin tahu, dan literasi bilingual.",
    accent: "#FFD93D",
    soft: "#FFF6C2",
    image: "/kindergarten.jpg",
    rotate: "rotate-1",
  },
  {
    title: "Bilingual",
    ages: "Semua",
    agesLabel: "Kami",
    blurb: "Inggris & Indonesia dalam lagu, cerita, dan keseharian.",
    accent: "#54C6EB",
    soft: "#E8F7FC",
    image: "/bilingual.jpg",
    rotate: "rotate-2",
  },
];

const whyPoints = [
  {
    title: "Student Centered",
    blurb:
      "Pembelajaran berpusat pada anak — setiap anak didengar dan dikembangkan sesuai potensinya.",
    color: "#00B894",
  },
  {
    title: "Bilingual Communication",
    blurb:
      "Komunikasi bilingual Inggris & Indonesia dijalin dalam kegiatan sehari-hari.",
    color: "#54C6EB",
  },
  {
    title: "Multiple Intelligence",
    blurb:
      "Metode pembelajaran melalui sentra-sentra dengan pendekatan Multiple Intelligence.",
    color: "#FFD93D",
  },
  {
    title: "Kurikulum Terpadu",
    blurb:
      "Mengadopsi Kurikulum Singapore yang bergabung dengan Kurikulum Diknas & Kurikulum Mandiri.",
    color: "#FF6B6B",
  },
  {
    title: "Kewirausahaan & Karakter",
    blurb:
      "Pendidikan kewirausahaan dan karakter sejak dini untuk fondasi masa depan.",
    color: "#FFB4C8",
  },
];

const featuredPrograms = [
  "Program Pengembangan Diri & Pendidikan Keagamaan",
  "Art Festivals",
  "Student Performance",
  "Field Trip & Outbond",
  "Pemeriksaan Kesehatan",
  "Program Kewirausahaan",
  "Program Edukasi Orangtua (Parenting)",
  "Charity (Bakti Sosial)",
  "Food Bazaar",
  "Fun Cooking",
];

const schoolActivities = [
  {
    title: "Upacara Bendera",
    image:
      "https://images.unsplash.com/photo-1509062528245-0249af9bb5b5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Senam Bersama",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Sholat Bersama",
    image:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Berenang",
    image:
      "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=800&q=80",
  },
];

const facilities = [
  "Ruang kelas yang nyaman & accessible untuk anak",
  "Pembelajaran dengan sentra-sentra",
  "Sarana permainan edukatif indoor & outdoor",
  "AC",
  "Reading Corner",
  "Swimming Pool Kids Centre",
  "Learning Area Playground",
];

const reviews = [
  {
    name: "Sari R.",
    role: "Orang tua Alya",
    quote:
      "Guru mengenal setiap anak. Alya pulang sambil menyanyi lagu Inggris baru setiap minggu.",
    blob: "#D4F8EC",
  },
  {
    name: "Budi W.",
    role: "Orang tua Kenzo",
    quote:
      "Hari di taman bermainnya luar biasa. Akhirnya kami menemukan sekolah yang hangat dan terstruktur.",
    blob: "#FFF6C2",
  },
  {
    name: "Lina K.",
    role: "Orang tua Sofia",
    quote:
      "Laporannya jelas dan hangat. Kami selalu tahu perkembangan Sofia — akademik maupun sosial.",
    blob: "#FFB4C8",
  },
];

const HERO_BG = "/hero.png";
const HERO_FLOAT = "/hero-float.png";
const HERO_FLOAT_VIDEO = "/hero-float.png";

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
  const a = document.createElement("a");
  a.href = BROCHURE_URL;
  a.download = "babelkids-brochure.jpg";
  a.click();
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
            <a href="#why" className="hover:opacity-80">
              Why BabelKids
            </a>
            <a href="#programs" className="hover:opacity-80">
              Program
            </a>
            <a href="#kegiatan" className="hover:opacity-80">
              Kegiatan
            </a>
            <a href="#fasilitas" className="hover:opacity-80">
              Fasilitas
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
            <Link
              href="/register"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--bk-coral)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#FF6B6B]/30 transition hover:scale-105 hover:brightness-105"
            >
              Daftar Segera
            </Link>
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
                  Taman Kanak-Kanak & Kelompok Bermain bilingual.
                </h1>
                <p className="animate-fade-up delay-200 mt-3 max-w-md text-sm leading-relaxed text-[var(--bk-ink)]/80 sm:mt-4 sm:text-base md:text-lg">
                  Student-centered, kurikulum terpadu, dan guru yang mengenal
                  setiap anak — bermain, tumbuh, dan berkarakter sejak dini.
                </p>
                <div className="animate-fade-up delay-300 mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--bk-mint)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:brightness-105 hover:shadow-xl"
                  >
                    Daftar Segera
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#why"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--bk-ink)]/20 bg-white/70 px-6 py-3.5 text-sm font-semibold text-[var(--bk-ink)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Why BabelKids
                  </a>
                </div>
              </div>
            </div>

            <div
              className="hero-float-kids pointer-events-none flex shrink-0 justify-center px-0 pb-32 pt-6 sm:px-0 sm:pb-0 sm:pt-0"
              aria-hidden
            >
              <video
                className="hero-float-video h-auto w-full object-contain object-bottom motion-reduce:hidden"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={HERO_FLOAT}
                width={1204}
                height={760}
              >
                <source src={HERO_FLOAT_VIDEO} type="image/png" />
              </video>
              <Image
                src={HERO_FLOAT}
                alt=""
                width={2400}
                height={1600}
                priority
                className="hidden h-auto w-full object-contain object-bottom motion-reduce:block"
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
              Kami
            </p>
            <h2 className="-mt-6 max-w-lg font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Program usia yang tepat untuk buah hati
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Kelas kecil, rasa ingin tahu besar — pilih jalur yang cocok untuk
              anak Anda.
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

        {/* ——— WHY BABEL KIDS ——— */}
        <section id="why" className="relative bg-[#D4F8EC] py-20">
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
              Why
            </p>
            <h2 className="-mt-6 max-w-2xl font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Why BabelKids
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--bk-ink)]/65">
              Babel Kids adalah Taman Kanak-Kanak / Kelompok Bermain dengan
              berbagai keunggulan dan kekhasan.
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyPoints.map((c, i) => (
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
                Unduh brosur
              </button>
              <StampBadge
                color="#00B894"
                className="size-20 rotate-[-8deg] text-[11px] animate-bob"
              >
                Free
                <br />
                JPG
              </StampBadge>
            </div>
          </div>
        </section>

        <WaveDivider topColor="#D4F8EC" bottomColor="#E8F7FC" />

        {/* ——— PROGRAM & KEGIATAN ——— */}
        <section id="kegiatan" className="relative bg-[#E8F7FC] py-20">
          <DoodleDots
            color="#FF6B6B"
            className="animate-float-mid pointer-events-none absolute right-10 top-12 opacity-50"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#54C6EB]/35 sm:text-8xl">
              Fun
            </p>
            <h2 className="-mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Program & Kegiatan
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Program unggulan dan kegiatan sekolah yang membentuk karakter,
              kreativitas, dan kebersamaan.
            </p>

            <div className="mt-12">
              <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#FF6B6B] sm:text-2xl">
                Program Unggulan
              </h3>
              <ul className="mt-6 columns-1 gap-x-10 sm:columns-2">
                {featuredPrograms.map((item) => (
                  <li
                    key={item}
                    className="mb-3 break-inside-avoid text-sm leading-relaxed text-[var(--bk-ink)]/80"
                  >
                    <span className="mr-2 inline-block size-1.5 rounded-full bg-[#FFD93D] align-middle" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14">
              <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#FF6B6B] sm:text-2xl">
                Kegiatan Sekolah
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {schoolActivities.map((a, i) => (
                  <figure
                    key={a.title}
                    className={`relative overflow-hidden rounded-[1.5rem] ${
                      i % 2 === 0 ? "-rotate-1" : "rotate-1"
                    } transition hover:-translate-y-1 hover:rotate-0`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={a.image}
                        alt={a.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    </div>
                    <figcaption className="absolute inset-x-0 bottom-0 bg-[#FFD93D] px-3 py-2 text-center font-[family-name:var(--font-fredoka)] text-sm font-semibold text-[var(--bk-ink)]">
                      {a.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        <WaveDivider topColor="#E8F7FC" bottomColor="#FFF6C2" />

        {/* ——— FASILITAS ——— */}
        <section id="fasilitas" className="relative bg-[#FFF6C2] py-20">
          <SvgStar
            color="#FF6B6B"
            className="animate-bob pointer-events-none absolute left-[5%] top-16 size-10 opacity-70"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#FFD93D]/50 sm:text-8xl">
              Ada
            </p>
            <h2 className="-mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Fasilitas
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Lingkungan belajar yang nyaman, aman, dan menyenangkan untuk anak.
            </p>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <ul className="space-y-3">
                {facilities.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 rounded-full bg-white/80 px-4 py-3 text-sm text-[var(--bk-ink)]/85 shadow-sm"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00B894] text-white">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
                <div className="relative aspect-square overflow-hidden rounded-full border-4 border-white shadow-lg -rotate-3">
                  <Image
                    src="/kindergarten.jpg"
                    alt="Playground BabelKids"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <div className="relative mt-8 aspect-square overflow-hidden rounded-full border-4 border-white shadow-lg rotate-3">
                  <Image
                    src="/preschool.png"
                    alt="Ruang kelas BabelKids"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <StampBadge
                  color="#FF6B6B"
                  className="absolute -bottom-2 left-1/2 size-24 -translate-x-1/2 text-sm animate-wiggle sm:size-28"
                >
                  Daftar
                  <br />
                  Segera
                </StampBadge>
              </div>
            </div>

            <div className="mt-14 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--bk-coral)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#FF6B6B]/30 transition hover:-translate-y-1 hover:brightness-105"
              >
                Daftar Segera
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <WaveDivider topColor="#FFF6C2" bottomColor="#FFFDF8" />

        {/* ——— EVENTS ——— */}
        <section id="events" className="relative bg-[var(--bk-paper)] py-20">
          <DoodleDots
            color="#FFB4C8"
            className="animate-float-mid pointer-events-none absolute right-10 top-12 opacity-50"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#FFB4C8]/40 sm:text-8xl">
              Momen
            </p>
            <h2 className="-mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Cuplikan acara terbaru
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Foto dari kegiatan sekolah — nama acara, tanggal, dan cerita
              singkat.
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

        <WaveDivider topColor="#FFFDF8" bottomColor="#FFFDF8" />

        {/* ——— REVIEWS ——— */}
        <section id="reviews" className="relative bg-[var(--bk-paper)] pt-4 pb-20">
          <SvgStar
            color="#FFD93D"
            className="animate-bob pointer-events-none absolute left-[5%] top-20 size-10 opacity-70"
          />
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-fredoka)] text-7xl font-bold leading-none text-[#FFB4C8]/40 sm:text-8xl">
              Love
            </p>
            <h2 className="-mt-6 max-w-lg font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:-mt-8 sm:text-5xl">
              Kata orang tua
            </h2>
            <p className="mt-3 max-w-lg text-[var(--bk-ink)]/65">
              Suara nyata dari keluarga yang mempercayakan buah hatinya ke
              BabelKids.
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
              Orang tua tetap dekat — meski tidak di ruang kelas.
            </h2>
            <p className="mt-4 max-w-md text-white/90">
              Presensi harian, laporan mingguan, acara, dan SPP — semua di parent
              app yang simpel di HP Anda.
            </p>
            <Link
              href="/parents"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--bk-mint-deep)] transition hover:scale-105 hover:bg-[var(--bk-sun-soft)]"
            >
              Buka parent app
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
              Yuk datang berkunjung
            </h2>
            <p className="mt-3 text-[var(--bk-ink)]/70">
              Chat kami di WhatsApp atau temukan BabelKids di peta — kami senang
              bertemu Anda.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] hover:brightness-105"
              >
                <MessageCircle className="size-4" />
                Chat WhatsApp
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--bk-ink)]/15 bg-white/80 px-6 py-3.5 text-sm font-semibold text-[var(--bk-ink)] backdrop-blur-sm transition hover:bg-white"
              >
                <MapPin className="size-4" />
                Buka di Maps
              </a>
            </div>
            <Link
              href="/register"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--bk-coral)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:brightness-105"
            >
              Daftar Segera
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative mx-auto mt-10 max-w-5xl px-5">
            {/* Kids-style map frame */}
            <div className="relative">
              <SvgStar
                color="#FFD93D"
                className="animate-wiggle pointer-events-none absolute -left-2 -top-3 z-20 size-10 sm:-left-4 sm:size-12"
              />
              <SvgStar
                color="#54C6EB"
                className="animate-bob pointer-events-none absolute -right-1 top-8 z-20 size-7 sm:-right-3 sm:size-9"
              />
              <SvgLeaf
                color="#00B894"
                className="animate-float-slow pointer-events-none absolute -bottom-4 -left-1 z-20 size-12 rotate-[-20deg] sm:-left-3 sm:size-14"
              />
              <StampBadge
                color="#FF6B6B"
                className="animate-wiggle pointer-events-none absolute -right-1 -bottom-3 z-20 size-20 -rotate-6 text-[11px] leading-tight sm:-right-3 sm:size-24 sm:text-sm"
              >
                We&apos;re
                <br />
                here!
              </StampBadge>

              <div
                className="relative rounded-[2rem] p-[10px] sm:rounded-[2.25rem] sm:p-3"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD93D 0%, #FF6B6B 28%, #54C6EB 55%, #00B894 78%, #FFB4C8 100%)",
                  boxShadow:
                    "0 16px 40px rgba(26,46,53,0.18), inset 0 0 0 3px rgba(255,253,248,0.55)",
                }}
              >
                <div
                  className="relative overflow-hidden rounded-[1.55rem] bg-[#FFFDF8] sm:rounded-[1.85rem]"
                  style={{
                    boxShadow: "inset 0 0 0 3px rgba(26,46,53,0.06)",
                  }}
                >
                  {/* Soft paper dots */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 opacity-[0.12]"
                    style={{
                      backgroundImage:
                        "radial-gradient(#1A2E35 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                  {/* Warm kids tint over map tiles */}
                  <iframe
                    title="BabelKids on Google Maps"
                    src={MAPS_EMBED}
                    className="relative z-0 h-80 w-full border-0 sm:h-[28rem]"
                    style={{
                      filter:
                        "saturate(1.15) contrast(0.95) brightness(1.04) sepia(0.12)",
                    }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  {/* Soft vignette so edges feel illustrated */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit]"
                    style={{
                      boxShadow:
                        "inset 0 0 60px 12px rgba(255,180,200,0.35), inset 0 0 0 1px rgba(255,253,248,0.7)",
                    }}
                  />
                </div>
              </div>
            </div>
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
            <Link href="/register" className="hover:text-[var(--bk-sun)]">
              Daftar Segera
            </Link>
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
