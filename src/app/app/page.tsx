import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Receipt,
  Sparkles,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { InstallParentApp } from "@/components/auth/InstallParentApp";
import {
  ParentAppPhone,
  parentAppScreenMeta,
} from "@/components/ParentAppPhone";

export const metadata: Metadata = {
  title: "BabelKids Parent App — Sekolah di genggaman",
  description:
    "Pasang aplikasi orang tua BabelKids: pantau absensi, laporan guru, SPP, dan acara sekolah dari HP Anda.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BabelKids",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const highlights = [
  {
    title: "Absensi harian",
    blurb: "Hadir, izin, atau sakit — langsung terlihat setiap hari.",
    image: "/upacara.jpeg",
    icon: CalendarDays,
  },
  {
    title: "Laporan guru",
    blurb: "Catatan perkembangan, mood, dan kegiatan kelas anak Anda.",
    image: "/belajar-sentra.jpeg",
    icon: FileText,
  },
  {
    title: "SPP & acara",
    blurb: "Cek tagihan, bukti bayar, dan agenda sekolah tanpa ribet.",
    image: "/experiment.jpeg",
    icon: Receipt,
  },
];

export default async function ParentAppLandingPage() {
  const session = await getSession();
  if (session?.portal === "parent") redirect("/parents");

  return (
    <div className="min-h-screen bg-[#0B1C2C] font-[family-name:var(--font-outfit)] text-white">
      {/* Hero — one composition, full-bleed */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/bermain-outdoor.jpeg"
          alt="Anak BabelKids bermain outdoor"
          fill
          priority
          className="object-cover animate-hero-zoom"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,28,44,0.45) 0%, rgba(11,28,44,0.55) 45%, rgba(11,28,44,0.92) 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-lg flex-col px-5 pb-10 pt-8 sm:max-w-xl">
          <div className="animate-fade-up flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="BabelKids"
              width={56}
              height={52}
              className="h-12 w-auto object-contain drop-shadow-md"
              priority
            />
            <p className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
              BabelKids
            </p>
          </div>

          <div className="mt-auto space-y-5 pb-4 pt-16">
            <h1 className="animate-fade-up font-[family-name:var(--font-fredoka)] text-4xl font-semibold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-5xl [animation-delay:80ms]">
              Sekolah di genggaman orang tua
            </h1>
            <p className="animate-fade-up max-w-md text-base leading-relaxed text-white/80 sm:text-lg [animation-delay:140ms]">
              Pantau absensi, laporan guru, SPP, dan acara — satu aplikasi untuk
              mengikuti tumbuh kembang anak di BabelKids.
            </p>

            <div className="animate-fade-up space-y-3 [animation-delay:200ms]">
              <InstallParentApp variant="hero" />
              <Link
                href="/login/parent"
                className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Sudah punya akun? Masuk
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What the app does — image bands, not cards */}
      <section className="relative bg-[#F3F7FC] py-16 text-[#1F3A56] sm:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3DB5E6]">
            Parent App
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Semua yang perlu Anda tahu, tiap hari
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#5B6B7C] sm:text-base">
            Dirancang sederhana untuk orang tua BabelKids — buka HP, langsung
            paham bagaimana hari anak di sekolah.
          </p>

          <ul className="mt-12 space-y-10">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              const flip = i % 2 === 1;
              return (
                <li
                  key={item.title}
                  className={`flex flex-col gap-5 sm:flex-row sm:items-center ${
                    flip ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] sm:w-1/2">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-700 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                  </div>
                  <div className="sm:w-1/2 sm:px-4">
                    <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#EAF8FF] text-[#3DB5E6]">
                      <Icon className="size-5" strokeWidth={1.85} />
                    </span>
                    <h3 className="mt-3 font-[family-name:var(--font-fredoka)] text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#5B6B7C]">
                      {item.blurb}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Phone previews */}
      <section className="relative overflow-hidden bg-[#1F3A56] py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -left-16 top-10 size-48 rounded-full bg-[#3DB5E6]/20 blur-3xl animate-pulse-soft"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 size-56 rounded-full bg-[#7ED6DF]/15 blur-3xl animate-bob"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7ED6DF]">
            <Sparkles className="size-3.5" />
            Tampilan aplikasi
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Nyaman dipakai setiap hari
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
            Antarmuka ringan, fokus pada anak Anda — absensi, SPP, dan ringkasan
            kegiatan.
          </p>

          <div className="relative mt-12 flex items-end justify-center gap-3 sm:gap-5">
            <ParentAppPhone
              screen="presence"
              className="hidden translate-y-6 animate-float-mid opacity-95 sm:block"
            />
            <ParentAppPhone
              screen="home"
              className="z-10 scale-110 animate-bob"
            />
            <ParentAppPhone
              screen="tuition"
              className="translate-y-4 animate-float-slow opacity-95 sm:translate-y-6"
            />
          </div>

          <p className="mt-10 text-xs font-medium text-white/60">
            {parentAppScreenMeta.map((s) => s.label).join(" · ")}
          </p>
        </div>
      </section>

      {/* Closing install + login */}
      <section className="relative overflow-hidden bg-[#EAF8FF] py-16 text-[#1F3A56] sm:py-20">
        <div className="relative mx-auto max-w-lg px-5 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={72}
            height={66}
            className="mx-auto h-14 w-auto object-contain"
          />
          <h2 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight">
            Siap mengikuti hari anak?
          </h2>
          <p className="mt-2 text-sm text-[#5B6B7C]">
            Pasang di layar utama, lalu masuk dengan akun yang diberikan sekolah.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-4 text-left">
            <InstallParentApp />
            <Link
              href="/login/parent"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3DB5E6] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2ea3d4]"
            >
              Masuk ke Parent App
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-8 text-sm text-[#5B6B7C]">
            <Link href="/" className="font-medium text-[#3DB5E6] hover:underline">
              ← Website BabelKids
            </Link>
            {session?.portal === "staff" ? (
              <>
                {" · "}
                <Link
                  href="/dashboard"
                  className="font-medium text-[#3DB5E6] hover:underline"
                >
                  Dashboard staf
                </Link>
              </>
            ) : (
              <>
                {" · "}
                <Link
                  href="/login"
                  className="font-medium text-[#3DB5E6] hover:underline"
                >
                  Masuk staf
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
