import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, organizationJsonLd, pageMetadata } from "@/lib/seo";
import { SCHOOL_ADDRESS } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Tentang BabelKids — TK & Kelompok Bermain Pangkalpinang",
  description:
    "Kenali BabelKids Pangkalpinang: visi pendidikan anak usia dini bilingual, pendekatan student-centered, kurikulum Singapore + Diknas, dan komunitas orang tua yang hangat.",
  path: "/tentang",
  keywords: [
    "tentang BabelKids",
    "sekolah anak Pangkalpinang",
    "TK bilingual Bangka Belitung",
    "PAUD Pangkalpinang",
  ],
});

const pillars = [
  "Student-centered learning yang menghormati ritme setiap anak",
  "Bilingual Inggris & Indonesia dalam kegiatan harian",
  "Multiple intelligence melalui pembelajaran sentra",
  "Kurikulum Singapore terpadu dengan standar Diknas",
  "Pembentukan karakter dan kewirausahaan sejak dini",
];

export default function TentangPage() {
  return (
    <MarketingPageShell breadcrumbs={[{ label: "Tentang" }]}>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Tentang", path: "/tentang" },
          ]),
        ]}
      />
      <ContentHero
        eyebrow="Tentang kami"
        title="BabelKids: sekolah anak usia dini di Pangkalpinang"
        description="Kami membangun fondasi belajar yang aman, menyenangkan, dan bermakna bagi anak-anak di Pangkalpinang serta sekitarnya di Kepulauan Bangka Belitung."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-[5px] border-[#74B9FF]">
          <Image
            src="/experiment.jpeg"
            alt="Anak belajar di BabelKids Pangkalpinang"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            Mengapa orang tua di Pangkalpinang memilih BabelKids
          </h2>
          <p className="mt-4 leading-relaxed text-[#5B6B7C]">
            BabelKids hadir sebagai Taman Kanak-Kanak dan Kelompok Bermain yang
            menggabungkan kehangatan pengasuhan dengan standar akademik yang
            jelas. Berlokasi di {SCHOOL_ADDRESS.street}, kami melayani keluarga
            yang mencari TK bilingual berkualitas di pusat Pangkalpinang.
          </p>
          <ul className="mt-8 space-y-3">
            {pillars.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#55EFC4]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#EAF8FF] py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            Program yang kami tawarkan
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/program/kelompok-bermain",
                title: "Kelompok Bermain",
                blurb: "Usia 2–4 tahun — fondasi sosial & sensorik.",
              },
              {
                href: "/program/taman-kanak-kanak",
                title: "Taman Kanak-Kanak",
                blurb: "Usia 4–6 tahun — kesiapan sekolah dasar.",
              },
              {
                href: "/program/bilingual",
                title: "Jalur Bilingual",
                blurb: "Inggris & Indonesia di setiap kegiatan.",
              },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-[1.5rem] border border-white bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5"
              >
                <h3 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[#5B6B7C]">{p.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
