import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kelompok Bermain Pangkalpinang — Playgroup BabelKids",
  description:
    "Kelompok Bermain (playgroup) BabelKids di Pangkalpinang untuk usia 2–4 tahun. Bermain sensorik, rutinas hangat, bilingual, dan fondasi sosial emosional anak.",
  path: "/program/kelompok-bermain",
  keywords: [
    "kelompok bermain Pangkalpinang",
    "playgroup Pangkalpinang",
    "PAUD Pangkalpinang",
    "sekolah anak usia 2 tahun Pangkalpinang",
  ],
  image: "/preschool.png",
});

const highlights = [
  "Usia ideal 2–4 tahun",
  "Rutinitas harian yang hangat dan terprediksi",
  "Eksplorasi sensorik & motorik kasar/halus",
  "Pengenalan bilingual secara natural",
  "Rasio guru yang mendukung perhatian individual",
];

export default function KelompokBermainPage() {
  return (
    <MarketingPageShell
      breadcrumbs={[
        { label: "Program", href: "/program/taman-kanak-kanak" },
        { label: "Kelompok Bermain" },
      ]}
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Kelompok Bermain", path: "/program/kelompok-bermain" },
        ])}
      />
      <ContentHero
        eyebrow="Program · Usia 2–4"
        title="Kelompok Bermain di Pangkalpinang"
        description="Playgroup BabelKids membantu anak merasa aman untuk bereksplorasi, berteman, dan membangun fondasi belajar sebelum masuk TK."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-[5px] border-[#74B9FF]">
          <Image
            src="/preschool.png"
            alt="Kelompok Bermain BabelKids Pangkalpinang"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            Playgroup yang hangat untuk keluarga Pangkalpinang
          </h2>
          <p className="mt-4 leading-relaxed text-[#5B6B7C]">
            Di BabelKids, kelompok bermain bukan sekadar tempat penitipan.
            Anak belajar melalui bermain terstruktur: lagu, gerak, eksplorasi
            sentra, dan interaksi sosial yang dibimbing guru berpengalaman.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#74B9FF] text-white">
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
            Lanjut ke jenjang berikutnya
          </h2>
          <p className="mt-3 text-sm text-[#5B6B7C]">
            Setelah playgroup, banyak keluarga melanjutkan ke{" "}
            <Link
              href="/program/taman-kanak-kanak"
              className="font-medium text-[#3DB5E6] hover:underline"
            >
              Taman Kanak-Kanak BabelKids
            </Link>{" "}
            atau mendalami{" "}
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
