import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TK Pangkalpinang — Taman Kanak-Kanak BabelKids",
  description:
    "Taman Kanak-Kanak (TK) bilingual BabelKids di Pangkalpinang untuk usia 4–6 tahun. Kesiapan sekolah dasar, literasi dini, kurikulum Singapore + Diknas.",
  path: "/program/taman-kanak-kanak",
  keywords: [
    "TK Pangkalpinang",
    "Taman Kanak-Kanak Pangkalpinang",
    "TK bilingual Pangkalpinang",
    "sekolah TK Bangka Belitung",
  ],
  image: "/kindergarten.jpg",
});

const highlights = [
  "Usia ideal 4–6 tahun",
  "Literasi & numerasi dini yang menyenangkan",
  "Proyek rasa ingin tahu dan presentasi anak",
  "Persiapan transisi ke sekolah dasar",
  "Karakter, kemandirian, dan kerja sama",
];

export default function TamanKanakKanakPage() {
  return (
    <MarketingPageShell
      breadcrumbs={[
        { label: "Program", href: "/program/taman-kanak-kanak" },
        { label: "Taman Kanak-Kanak" },
      ]}
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Taman Kanak-Kanak", path: "/program/taman-kanak-kanak" },
        ])}
      />
      <ContentHero
        eyebrow="Program · Usia 4–6"
        title="Taman Kanak-Kanak (TK) di Pangkalpinang"
        description="TK BabelKids menyiapkan anak Pangkalpinang untuk jenjang berikutnya dengan pembelajaran bermakna, bilingual, dan penuh kepercayaan diri."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            TK bilingual yang fokus kesiapan sekolah
          </h2>
          <p className="mt-4 leading-relaxed text-[#5B6B7C]">
            Program Taman Kanak-Kanak BabelKids menggabungkan kurikulum
            Singapore dan Diknas. Anak belajar melalui sentra, eksperimen, seni,
            dan kegiatan outdoor — tetap bermain, tetap terarah.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#55EFC4]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-[2rem] border-[5px] border-[#55EFC4] lg:order-2">
          <Image
            src="/kindergarten.jpg"
            alt="Taman Kanak-Kanak BabelKids Pangkalpinang"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      <section className="bg-[#EAF8FF] py-14">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold sm:text-2xl">
            Bandingkan program usia
          </h2>
          <p className="mt-3 text-sm text-[#5B6B7C]">
            Anak lebih muda? Lihat{" "}
            <Link
              href="/program/kelompok-bermain"
              className="font-medium text-[#3DB5E6] hover:underline"
            >
              Kelompok Bermain
            </Link>
            . Ingin fokus bahasa? Baca{" "}
            <Link
              href="/program/bilingual"
              className="font-medium text-[#3DB5E6] hover:underline"
            >
              jalur bilingual
            </Link>
            .
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
