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
  Palette,
  Sparkles,
  Trees,
  BookOpen,
  Heart,
  Sun,
  Smartphone,
  CalendarDays,
  Receipt,
  FileText,
} from "lucide-react";
import {
  ParentAppPhone,
  parentAppScreenMeta,
} from "@/components/ParentAppPhone";

const WHATSAPP_URL =
  "https://wa.me/6281210001001?text=Halo%20BabelKids%2C%20saya%20ingin%20bertanya%20tentang%20sekolah.";
const MAPS_URL =
  "https://www.google.com/maps/place/Babel+Kids/@-2.1252929,106.1078513,17z/data=!3m1!4b1!4m6!3m5!1s0x2e22c126527c90d9:0xc51d961435f321c8!8m2!3d-2.1252929!4d106.1078513!16s%2Fg%2F11c53n95s3";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Babel+Kids+-2.1252929,106.1078513&z=17&output=embed";
const BROCHURE_URL = "/brochure.jpg";

const foundations = [
  "Student Centered learning",
  "Bilingual Inggris & Indonesia",
  "Multiple Intelligence sentra",
  "Kurikulum Singapore + Diknas",
  "Karakter & kewirausahaan dini",
];

const mindCards = [
  {
    title: "Early Childhood",
    blurb:
      "Kelompok Bermain & TK dengan pendekatan lembut yang membangun rasa aman untuk belajar.",
    color: "#7ED6DF",
    icon: BookOpen,
  },
  {
    title: "Creative Art",
    blurb:
      "Art Festival, Fun Cooking, dan workshop kreatif yang mengasah ekspresi anak.",
    color: "#F8A5C2",
    icon: Palette,
  },
  {
    title: "Active Body",
    blurb:
      "Senam, berenang, field trip & outbound untuk tubuh sehat dan semangat petualang.",
    color: "#FFEAA7",
    icon: Sun,
  },
];

const offerings = [
  { label: "Playful Learning", icon: Sparkles, color: "#74B9FF" },
  { label: "Outdoor Learning", icon: Trees, color: "#55EFC4" },
  { label: "Character First", icon: Heart, color: "#FD79A8" },
  { label: "Modern Resources", icon: BookOpen, color: "#FDCB6E" },
];

const programs = [
  {
    title: "Kelompok Bermain",
    ages: "Usia 2–4",
    blurb: "Bermain sensorik, rutinitas hangat, dan persahabatan pertama.",
    image: "/preschool.png",
    border: "#74B9FF",
  },
  {
    title: "Taman Kanak-Kanak",
    ages: "Usia 4–6",
    blurb: "Kesiapan sekolah, projek rasa ingin tahu, literasi bilingual.",
    image: "/kindergarten.jpg",
    border: "#55EFC4",
  },
  {
    title: "Jalur Bilingual",
    ages: "Semua usia",
    blurb: "Inggris & Indonesia menyatu dalam setiap momen belajar.",
    image: "/bilingual.jpg",
    border: "#FDCB6E",
  },
];

const journey = [
  {
    title: "Upacara Bendera",
    image:
      "https://images.unsplash.com/photo-1509062528245-0249af9bb5b5?auto=format&fit=crop&w=800&q=80",
    border: "#74B9FF",
  },
  {
    title: "Senam Bersama",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    border: "#FD79A8",
  },
  {
    title: "Sholat Bersama",
    image:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=800&q=80",
    border: "#55EFC4",
  },
  {
    title: "Berenang",
    image:
      "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=800&q=80",
    border: "#FDCB6E",
  },
  {
    title: "Belajar Sentra",
    image: "/preschool.png",
    border: "#FF9F43",
  },
  {
    title: "Bermain Outdoor",
    image: "/kindergarten.jpg",
    border: "#FF7675",
  },
];

const events = [
  {
    title: "Art Festivals",
    blurb: "Pameran karya seni anak yang penuh warna dan kebanggaan.",
    bg: "#E8F6FF",
    border: "#74B9FF",
    icon: Palette,
  },
  {
    title: "Field Trip & Outbond",
    blurb: "Petualangan di luar kelas untuk eksplorasi dunia nyata.",
    bg: "#E8FFF6",
    border: "#55EFC4",
    icon: Trees,
  },
  {
    title: "Food Bazaar",
    blurb: "Kewirausahaan mini: memasak, menjual, dan berbagi.",
    bg: "#FFF8E8",
    border: "#FDCB6E",
    icon: Sun,
  },
  {
    title: "Parenting Day",
    blurb: "Edukasi orang tua agar tumbuh bersama di rumah.",
    bg: "#FFE8F0",
    border: "#FD79A8",
    icon: Heart,
  },
];

const facilities = [
  "Ruang kelas nyaman & accessible",
  "Pembelajaran dengan sentra-sentra",
  "Permainan edukatif indoor & outdoor",
  "AC di seluruh ruang belajar",
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
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Budi W.",
    role: "Orang tua Kenzo",
    quote:
      "Akhirnya kami menemukan sekolah yang hangat, terstruktur, dan sangat menyenangkan untuk anak.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
];

const appFeatures = [
  {
    title: "Absensi harian",
    blurb: "Pantau kehadiran anak secara real-time setiap hari.",
    icon: CalendarDays,
  },
  {
    title: "Laporan perkembangan",
    blurb: "Catatan guru, mood, dan skill mingguan di HP Anda.",
    icon: FileText,
  },
  {
    title: "SPP & pembayaran",
    blurb: "Cek tagihan, metode bayar, dan unggah bukti dengan mudah.",
    icon: Receipt,
  },
  {
    title: "Acara & kegiatan",
    blurb: "Jangan lewatkan field trip, festival, dan momen kelas.",
    icon: Sparkles,
  },
];

function downloadBrochure() {
  const a = document.createElement("a");
  a.href = BROCHURE_URL;
  a.download = "babelkids-brochure.jpg";
  a.click();
}

function CloudDivider({
  from = "#4EC3F7",
  to = "#FFFFFF",
  flip = false,
}: {
  from?: string;
  to?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`relative z-10 -mt-px leading-[0] ${flip ? "rotate-180" : ""}`}
      style={{ backgroundColor: from }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="block h-[88px] w-full sm:h-[120px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fluffy cloud bumps — overlapping lobes */}
        <path
          d="M0,110
            C60,110 80,70 140,70
            C170,40 230,35 270,55
            C300,25 370,20 420,50
            C460,20 540,15 590,45
            C640,15 720,25 760,55
            C800,25 880,20 930,50
            C980,25 1050,30 1100,55
            C1150,30 1220,35 1270,60
            C1320,40 1380,55 1440,70
            L1440,160 L0,160 Z"
          fill={to}
        />
        <path
          d="M0,130
            C90,125 130,95 190,95
            C240,75 300,80 340,100
            C390,75 470,70 520,95
            C580,70 660,80 720,100
            C790,75 870,70 930,95
            C1000,75 1080,80 1140,100
            C1200,80 1280,85 1340,105
            C1380,95 1420,105 1440,110
            L1440,160 L0,160 Z"
          fill={to}
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

function HeroClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft sky wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5BC8F0] via-[#3DB5E6] to-[#3DB5E6]" />
      <div className="absolute -left-20 top-10 size-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -right-16 top-32 size-80 rounded-full bg-[#FFE08A]/20 blur-3xl" />
      <div className="absolute left-1/3 top-20 size-48 rounded-full bg-white/10 blur-2xl" />

      {/* Fluffy white clouds scattered in sky */}
      <div className="animate-cloud-drift absolute left-[4%] top-24 opacity-90 sm:top-28">
        <FluffyCloud className="h-12 w-28 sm:h-16 sm:w-40" />
      </div>
      <div className="animate-cloud-drift absolute right-[6%] top-36 opacity-80 [animation-delay:2s] sm:top-32">
        <FluffyCloud className="h-10 w-24 sm:h-14 sm:w-36" />
      </div>
      <div className="animate-cloud-drift absolute left-[38%] top-20 hidden opacity-70 [animation-delay:4s] md:block">
        <FluffyCloud className="h-11 w-32" />
      </div>
      <div className="animate-cloud-drift absolute bottom-36 left-[12%] opacity-60 [animation-delay:1s] lg:bottom-44">
        <FluffyCloud className="h-9 w-24" />
      </div>
      <div className="animate-cloud-drift absolute bottom-40 right-[18%] opacity-55 [animation-delay:3s]">
        <FluffyCloud className="h-8 w-20" />
      </div>
    </div>
  );
}

function FluffyCloud({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="48" cy="42" rx="32" ry="22" fill="white" fillOpacity="0.92" />
      <ellipse cx="80" cy="32" rx="36" ry="26" fill="white" fillOpacity="0.95" />
      <ellipse cx="118" cy="42" rx="30" ry="20" fill="white" fillOpacity="0.9" />
      <ellipse cx="70" cy="48" rx="40" ry="16" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

function DoodleSun({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="36" cy="36" r="12" stroke="#FFD93D" strokeWidth="2.5" fill="#FFD93D" fillOpacity="0.35" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="36"
          y1="8"
          x2="36"
          y2="14"
          stroke="#FFD93D"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 36 36)`}
        />
      ))}
    </svg>
  );
}

function DoodleCloud({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 38 C8 38 6 26 16 22 C16 12 28 8 36 14 C42 6 58 8 60 18 C72 16 80 24 76 34 C84 36 84 44 74 44 L24 44 C16 44 14 38 20 38 Z"
        stroke="#54C6EB"
        strokeWidth="2"
        fill="#54C6EB"
        fillOpacity="0.12"
      />
    </svg>
  );
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
    <div className="min-h-screen overflow-x-hidden bg-white font-[family-name:var(--font-outfit)] text-[#1F3A56]">
      {/* ——— HEADER ——— */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#3DB5E6]/95 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.5rem]">
          <a href="#top" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="BabelKids"
              width={120}
              height={110}
              className="h-12 w-auto object-contain drop-shadow-sm sm:h-14"
              priority
            />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/95 md:flex">
            <a href="#about" className="hover:opacity-80">
              About
            </a>
            <a href="#programs" className="hover:opacity-80">
              Programs
            </a>
            <a href="#journey" className="hover:opacity-80">
              Journey
            </a>
            <a href="#app" className="hover:opacity-80">
              App
            </a>
            <a href="#visit" className="hover:opacity-80">
              Contact
            </a>
          </nav>
          <Link
            href="/register"
            className="rounded-full bg-[#1F3A56] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16293d]"
          >
            Daftar Segera
          </Link>
        </div>
      </header>

      <main id="top">
        {/* ——— HERO ——— */}
        <section className="relative overflow-hidden bg-[#3DB5E6] pt-20 sm:pt-24">
          <HeroClouds />
          <DoodleSun className="animate-spin-slow pointer-events-none absolute right-[8%] top-24 z-[1] hidden size-16 opacity-95 sm:block md:size-20" />

          <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 pb-8 pt-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-4 lg:pt-16">
            <div className="relative z-10 text-center lg:text-left">
              <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Playgroup · Kindergarten
              </p>
              <h1 className="animate-fade-up delay-100 mt-3 font-[family-name:var(--font-fredoka)] text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                We play, we learn, we inspire
              </h1>
              <p className="animate-fade-up delay-200 mx-auto mt-4 max-w-md text-base leading-relaxed text-white/90 lg:mx-0">
                BabelKids — Taman Kanak-Kanak & Kelompok Bermain bilingual dengan
                pembelajaran student-centered dan kurikulum terpadu.
              </p>
              <div className="animate-fade-up delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F3A56] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#16293d]"
                >
                  Daftar Segera
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  Pelajari lebih lanjut
                </a>
              </div>
            </div>

            <div className="animate-fade-up delay-200 relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] border-[6px] border-white/40 bg-white/10 shadow-[0_20px_50px_rgba(31,58,86,0.25)]">
                <Image
                  src="/hero-illustration.png"
                  alt="Ilustrasi anak BabelKids bermain dan belajar"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 90vw, 32rem"
                />
              </div>
              <div className="absolute -bottom-4 -left-3 hidden size-24 overflow-hidden rounded-full border-4 border-white shadow-lg sm:block">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          </div>

          <CloudDivider from="#3DB5E6" to="#FFFFFF" />
        </section>

        {/* ——— FOUNDATIONS / ABOUT ——— */}
        <section id="about" className="relative bg-white py-16 sm:py-24">
          <DoodleCloud className="pointer-events-none absolute left-6 top-10 size-20 opacity-40" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-[5px] border-[#74B9FF]">
                <Image
                  src="/preschool.png"
                  alt="Anak belajar di BabelKids"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 28rem"
                />
              </div>
              <div className="absolute -bottom-8 -right-2 w-[55%] overflow-hidden rounded-[1.75rem] border-[5px] border-[#FDCB6E] shadow-lg sm:-right-6">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/kindergarten.jpg"
                    alt="Kegiatan kelas BabelKids"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
              </div>
            </div>

            <div className="lg:pl-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                Why BabelKids
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                Building foundations for future leaders
              </h2>
              <p className="mt-4 text-[#5B6B7C] leading-relaxed">
                Babel Kids adalah Taman Kanak-Kanak / Kelompok Bermain dengan
                berbagai keunggulan dan kekhasan untuk tumbuh kembang anak.
              </p>
              <ul className="mt-8 space-y-3">
                {foundations.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#55EFC4] text-[#1F3A56]">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="font-medium text-[#1F3A56]">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={downloadBrochure}
                className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#3DB5E6] px-5 py-3 text-sm font-semibold text-[#3DB5E6] transition hover:bg-[#3DB5E6] hover:text-white"
              >
                <Download className="size-4" />
                Unduh brosur
              </button>
            </div>
          </div>
        </section>

        <CloudDivider from="#FFFFFF" to="#EAF8FF" />

        {/* ——— EMPOWERING ——— */}
        <section className="relative bg-[#EAF8FF] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                  Our approach
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                  Empowering young minds
                </h2>
                <p className="mt-3 text-[#5B6B7C]">
                  Tiga pilar pengalaman sehari-hari di BabelKids.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {mindCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article
                      key={card.title}
                      className="rounded-[2rem] border-[3px] border-white bg-white p-7 shadow-[0_12px_40px_rgba(61,181,230,0.12)] transition hover:-translate-y-1"
                    >
                      <div
                        className="flex size-14 items-center justify-center rounded-[1.25rem]"
                        style={{ backgroundColor: card.color }}
                      >
                        <Icon className="size-7 text-[#1F3A56]" strokeWidth={1.75} />
                      </div>
                      <h3 className="mt-5 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#1F3A56]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5B6B7C]">
                        {card.blurb}
                      </p>
                    </article>
                  );
                })}
              </div>
          </div>
        </section>

        {/* ——— UNIQUE OFFERINGS ——— */}
        <section className="bg-[#EAF8FF] pb-8 pt-8 sm:pb-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                Fasilitas & metode
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                Discover the unique offerings
              </h2>
            </div>

            <div className="relative mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:gap-10">
              {offerings.map((o, i) => {
                const Icon = o.icon;
                return (
                  <div
                    key={o.label}
                    className={`flex flex-col items-center gap-3 text-center ${
                      i % 2 === 0 ? "sm:-translate-y-2" : "sm:translate-y-6"
                    }`}
                  >
                    <div
                      className="flex size-16 items-center justify-center rounded-full border-[3px] border-white shadow-md sm:size-20"
                      style={{ backgroundColor: o.color }}
                    >
                      <Icon className="size-7 text-[#1F3A56] sm:size-8" strokeWidth={1.75} />
                    </div>
                    <p className="font-[family-name:var(--font-fredoka)] text-sm font-semibold text-[#1F3A56] sm:text-base">
                      {o.label}
                    </p>
                  </div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 z-10 hidden size-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[5px] border-white shadow-xl sm:block sm:size-48">
                <Image
                  src="/bilingual.jpg"
                  alt="Anak BabelKids"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </div>

            <ul className="mx-auto mt-16 grid max-w-3xl gap-2 sm:grid-cols-2">
              {facilities.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-sm text-[#1F3A56]"
                >
                  <Check className="size-4 shrink-0 text-[#3DB5E6]" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CloudDivider from="#EAF8FF" to="#FFFFFF" />

        {/* ——— PROGRAMS ——— */}
        <section id="programs" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                Programs
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                Highly recommended courses
              </h2>
              <p className="mt-3 text-[#5B6B7C]">
                Pilih jalur usia yang paling cocok untuk buah hati Anda.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {programs.map((p) => (
                <article
                  key={p.title}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-[0_12px_36px_rgba(31,58,86,0.08)] transition hover:-translate-y-1"
                  style={{ border: `4px solid ${p.border}` }}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#3DB5E6]">
                      {p.ages}
                    </p>
                    <h3 className="mt-1 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#1F3A56]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5B6B7C]">
                      {p.blurb}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ——— JOURNEY GALLERY ——— */}
        <section id="journey" className="bg-[#FFF9F0] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F0783C]">
                Kegiatan sekolah
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                Our colourful journey
              </h2>
            </div>

            <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {journey.map((item, i) => (
                <figure
                  key={item.title}
                  className={`mb-4 break-inside-avoid overflow-hidden rounded-[1.75rem] ${
                    i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[5/4]"
                  }`}
                  style={{ border: `4px solid ${item.border}` }}
                >
                  <div className="relative h-full min-h-[12rem] w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1F3A56]/80 to-transparent px-4 pb-3 pt-10 font-[family-name:var(--font-fredoka)] text-sm font-semibold text-white">
                      {item.title}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ——— EVENTS ——— */}
        <section id="events" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                Program unggulan
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                Fun-filled learning events
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((e) => {
                const Icon = e.icon;
                return (
                  <article
                    key={e.title}
                    className="rounded-[1.75rem] p-6 transition hover:-translate-y-1"
                    style={{
                      backgroundColor: e.bg,
                      border: `3px solid ${e.border}`,
                    }}
                  >
                    <Icon className="size-8 text-[#1F3A56]" strokeWidth={1.75} />
                    <h3 className="mt-4 font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#1F3A56]">
                      {e.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5B6B7C]">
                      {e.blurb}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <CloudDivider from="#FFFFFF" to="#1F3A56" />

        {/* ——— PARENT APP ——— */}
        <section id="app" className="relative overflow-hidden bg-[#1F3A56] py-16 text-white sm:py-24">
          <DoodleSun className="pointer-events-none absolute right-8 top-10 size-16 opacity-40" />
          <DoodleCloud className="pointer-events-none absolute -left-4 bottom-20 size-28 opacity-30" />

          <div className="relative mx-auto max-w-6xl px-5">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7ED6DF]">
                  <Smartphone className="size-3.5" />
                  Parent app
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  Sekolah di genggaman orang tua
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                  Aplikasi digital BabelKids untuk pantau absensi, laporan guru,
                  SPP, dan acara sekolah — sama seperti pengalaman di Play Store,
                  langsung di HP Anda.
                </p>

                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {appFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.title} className="flex gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#3DB5E6]/25 text-[#7ED6DF]">
                          <Icon className="size-5" strokeWidth={1.85} />
                        </span>
                        <div>
                          <p className="font-[family-name:var(--font-fredoka)] font-semibold">
                            {f.title}
                          </p>
                          <p className="mt-0.5 text-sm text-white/65">{f.blurb}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/parents"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3DB5E6] px-6 py-3.5 text-sm font-semibold text-[#1F3A56] transition hover:-translate-y-0.5 hover:bg-[#6bc9ef]"
                  >
                    Buka Parent App
                    <ArrowRight className="size-4" />
                  </Link>
                  <p className="text-xs text-white/50 sm:max-w-[14rem]">
                    Demo web app · tersedia untuk orang tua siswa BabelKids
                  </p>
                </div>
              </div>

              {/* Real app UI phone cluster */}
              <div className="relative flex items-end justify-center gap-3 sm:gap-4 lg:justify-end">
                <ParentAppPhone
                  screen="presence"
                  className="hidden translate-y-8 opacity-95 sm:block lg:-rotate-6"
                />
                <ParentAppPhone
                  screen="home"
                  className="z-10 scale-110"
                />
                <ParentAppPhone
                  screen="tuition"
                  className="translate-y-6 opacity-95 sm:translate-y-8 lg:rotate-6"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-end">
              {parentAppScreenMeta.map((s) => (
                <span
                  key={s.label}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                >
                  {s.label} · {s.caption}
                </span>
              ))}
            </div>
          </div>
        </section>

        <CloudDivider from="#1F3A56" to="#3DB5E6" />

        {/* ——— TESTIMONIALS ——— */}
        <section className="relative bg-[#3DB5E6] py-16 text-white sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                Testimonials
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:text-4xl">
                Words of trust and gratitude
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <blockquote
                  key={r.name}
                  className="rounded-[2rem] bg-white p-7 text-[#1F3A56] shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative size-14 overflow-hidden rounded-full border-[3px] border-[#FDCB6E]">
                      <Image
                        src={r.image}
                        alt={r.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-fredoka)] font-semibold">
                        {r.name}
                      </p>
                      <p className="text-xs text-[#5B6B7C]">{r.role}</p>
                      <p className="mt-0.5 text-sm text-[#FDCB6E]">★★★★★</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-[#5B6B7C] sm:text-base">
                    “{r.quote}”
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <CloudDivider from="#3DB5E6" to="#FFFFFF" />

        {/* ——— VISIT ——— */}
        <section id="visit" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3DB5E6]">
                  Contact
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-[#1F3A56] sm:text-4xl">
                  Yuk datang berkunjung
                </h2>
                <p className="mt-4 text-[#5B6B7C] leading-relaxed">
                  Chat kami di WhatsApp atau temukan BabelKids di peta — kami
                  senang bertemu Anda.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    <MessageCircle className="size-4" />
                    Chat WhatsApp
                  </a>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#3DB5E6] px-5 py-3.5 text-sm font-semibold text-[#3DB5E6] transition hover:bg-[#3DB5E6] hover:text-white"
                  >
                    <MapPin className="size-4" />
                    Buka di Maps
                  </a>
                </div>
                <Link
                  href="/register"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1F3A56] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#16293d]"
                >
                  Daftar Segera
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-[2rem] border-[4px] border-[#74B9FF]">
                <iframe
                  title="BabelKids on Google Maps"
                  src={MAPS_EMBED}
                  className="h-72 w-full border-0 sm:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8F0F5] bg-[#EAF8FF] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="BabelKids"
              width={80}
              height={72}
              className="h-14 w-auto object-contain"
            />
            <p className="text-sm text-[#5B6B7C]">
              © {new Date().getFullYear()} BabelKids
              <br />
              Playgroup · Kindergarten
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium text-[#1F3A56]">
            <Link href="/register" className="hover:text-[#3DB5E6]">
              Daftar Segera
            </Link>
            <Link href="/parents" className="hover:text-[#3DB5E6]">
              Parent app
            </Link>
            <Link href="/dashboard" className="hover:text-[#3DB5E6]">
              Staff
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
