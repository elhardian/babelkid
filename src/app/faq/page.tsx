import Link from "next/link";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { SCHOOL_ADDRESS, WHATSAPP_URL } from "@/lib/site";

const faqs = [
  {
    question: "Di mana lokasi BabelKids Pangkalpinang?",
    answer: `BabelKids berada di ${SCHOOL_ADDRESS.full}. Anda dapat membuka peta di halaman Lokasi atau menghubungi kami via WhatsApp untuk petunjuk arah.`,
  },
  {
    question: "Apa saja program yang tersedia di BabelKids?",
    answer:
      "Kami menyediakan Kelompok Bermain (usia 2–4 tahun), Taman Kanak-Kanak (usia 4–6 tahun), dan jalur bilingual Inggris–Indonesia untuk seluruh jenjang. Semua program menggunakan pendekatan student-centered.",
  },
  {
    question: "Apakah BabelKids sekolah bilingual?",
    answer:
      "Ya. BabelKids menerapkan jalur bilingual di mana bahasa Inggris dan Indonesia digunakan secara alami dalam kegiatan belajar, bermain, dan interaksi harian di sekolah.",
  },
  {
    question: "Kurikulum apa yang dipakai BabelKids?",
    answer:
      "Kami mengintegrasikan kurikulum Singapore dengan standar Diknas Indonesia, dilengkapi pembelajaran sentra berbasis multiple intelligence serta penekanan karakter sejak dini.",
  },
  {
    question: "Bagaimana cara mendaftar TK atau playgroup di Pangkalpinang?",
    answer:
      "Orang tua dapat mendaftar melalui formulir online di website BabelKids, atau menghubungi WhatsApp sekolah untuk konsultasi kuota, biaya, dan jadwal observasi.",
  },
  {
    question: "Apakah ada aplikasi khusus untuk orang tua?",
    answer:
      "Ya. Parent App BabelKids memudahkan orang tua memantau absensi, laporan perkembangan, tagihan SPP, serta informasi acara sekolah secara real-time.",
  },
  {
    question: "Apakah BabelKids menerima anak dari luar Pangkalpinang?",
    answer:
      "Ya. Kami menerima siswa dari Pangkalpinang dan wilayah sekitar di Kepulauan Bangka Belitung, selama kuota kelas masih tersedia.",
  },
];

export const metadata = pageMetadata({
  title: "FAQ — TK & Kelompok Bermain BabelKids Pangkalpinang",
  description:
    "Pertanyaan umum tentang BabelKids Pangkalpinang: lokasi, program TK & playgroup, bilingual, kurikulum, cara daftar, dan Parent App.",
  path: "/faq",
  keywords: [
    "FAQ TK Pangkalpinang",
    "cara daftar TK Pangkalpinang",
    "biaya playgroup Pangkalpinang",
    "BabelKids FAQ",
  ],
});

export default function FaqPage() {
  return (
    <MarketingPageShell breadcrumbs={[{ label: "FAQ" }]}>
      <JsonLd
        data={[
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <ContentHero
        eyebrow="Pertanyaan umum"
        title="FAQ BabelKids Pangkalpinang"
        description="Jawaban singkat untuk orang tua yang mencari TK, kelompok bermain, atau sekolah bilingual di Pangkalpinang."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[1.25rem] border border-[#E5ECF5] bg-white px-5 py-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#1F3A56] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {faq.question}
                  <span className="mt-0.5 text-[#3DB5E6] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#5B6B7C]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[#5B6B7C]">
          Belum menemukan jawaban?{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#3DB5E6] hover:underline"
          >
            Chat WhatsApp
          </a>{" "}
          atau{" "}
          <Link href="/lokasi" className="font-medium text-[#3DB5E6] hover:underline">
            kunjungi lokasi kami
          </Link>
          .
        </p>
      </section>
    </MarketingPageShell>
  );
}
