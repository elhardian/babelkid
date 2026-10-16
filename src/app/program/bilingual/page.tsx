import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TK Bilingual Pangkalpinang — Jalur Inggris & Indonesia BabelKids",
  description:
    "Jalur bilingual BabelKids Pangkalpinang: bahasa Inggris dan Indonesia menyatu dalam pembelajaran harian TK & Kelompok Bermain. Cocok untuk keluarga yang mencari sekolah bilingual di Bangka Belitung.",
  path: "/program/bilingual",
  keywords: [
    "TK bilingual Pangkalpinang",
    "sekolah bilingual Pangkalpinang",
    "playgroup bilingual Bangka",
    "English kindergarten Pangkalpinang",
  ],
  image: "/bilingual.jpg",
});

const highlights = [
  "Inggris & Indonesia dalam rutinitas kelas",
  "Kosakata kontekstual lewat lagu, cerita, dan bermain",
  "Guru yang membimbing tanpa menekan",
  "Lingkungan aman untuk anak mencoba berbicara",
  "Konsistensi antara sekolah dan komunikasi orang tua",
];

export default function BilingualPage() {
  return (
    <MarketingPageShell
      breadcrumbs={[
        { label: "Program", href: "/program/taman-kanak-kanak" },
        { label: "Jalur Bilingual" },
      ]}
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Jalur Bilingual", path: "/program/bilingual" },
        ])}
      />
      <ContentHero
        eyebrow="Program · Semua usia"
        title="Sekolah bilingual di Pangkalpinang"
        description="Di BabelKids, anak tidak hanya 'belajar bahasa Inggris' — mereka hidup dalam lingkungan bilingual yang natural sejak kelompok bermain hingga TK."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-[5px] border-[#FDCB6E]">
          <Image
            src="/bilingual.jpg"
            alt="Pembelajaran bilingual BabelKids Pangkalpinang"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            Mengapa bilingual sejak dini?
          </h2>
          <p className="mt-4 leading-relaxed text-[#5B6B7C]">
            Anak usia dini sangat mudah menyerap bahasa. Dengan pendekatan yang
            menyenangkan di Pangkalpinang, BabelKids membantu anak merasa nyaman
            mendengar dan menggunakan dua bahasa tanpa kehilangan identitas
            lokal.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FDCB6E]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#EAF8FF] py-14">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold sm:text-2xl">
            Pilih jenjang usia
          </h2>
          <p className="mt-3 text-sm text-[#5B6B7C]">
            <Link
              href="/program/kelompok-bermain"
              className="font-medium text-[#3DB5E6] hover:underline"
            >
              Kelompok Bermain
            </Link>
            {" · "}
            <Link
              href="/program/taman-kanak-kanak"
              className="font-medium text-[#3DB5E6] hover:underline"
            >
              Taman Kanak-Kanak
            </Link>
            {" · "}
            <Link href="/register" className="font-medium text-[#3DB5E6] hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
