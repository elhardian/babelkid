import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { ContentHero } from "@/components/marketing/ContentHero";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, organizationJsonLd, pageMetadata } from "@/lib/seo";
import {
  MAPS_EMBED,
  MAPS_URL,
  SCHOOL_ADDRESS,
  SCHOOL_CONTACT,
  WHATSAPP_URL,
} from "@/lib/site";

export const metadata = pageMetadata({
  title: "Lokasi BabelKids Pangkalpinang — Alamat TK & Kelompok Bermain",
  description: `Kunjungi BabelKids di ${SCHOOL_ADDRESS.full}. Peta, jam operasional, WhatsApp, dan petunjuk arah ke TK bilingual Pangkalpinang.`,
  path: "/lokasi",
  keywords: [
    "lokasi BabelKids Pangkalpinang",
    "alamat TK Pangkalpinang",
    "TK Jl Balai Pangkalpinang",
    "maps BabelKids",
  ],
});

export default function LokasiPage() {
  return (
    <MarketingPageShell breadcrumbs={[{ label: "Lokasi" }]}>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Lokasi", path: "/lokasi" },
          ]),
        ]}
      />
      <ContentHero
        eyebrow="Lokasi & kontak"
        title="BabelKids di Pangkalpinang, Bangka Belitung"
        description={`Temukan kami di ${SCHOOL_ADDRESS.street}. Mudah dijangkau dari pusat kota Pangkalpinang — cocok untuk keluarga yang mencari TK dan playgroup terdekat.`}
        ctaHref={WHATSAPP_URL}
        ctaLabel="Chat WhatsApp"
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold sm:text-3xl">
            Alamat sekolah
          </h2>
          <address className="mt-4 not-italic leading-relaxed text-[#5B6B7C]">
            <p className="text-base font-medium text-[#1F3A56]">
              {SCHOOL_ADDRESS.street}
            </p>
            <p>
              {SCHOOL_ADDRESS.city}, {SCHOOL_ADDRESS.region}
            </p>
            <p className="mt-4">
              Telepon:{" "}
              <a
                href={`tel:${SCHOOL_CONTACT.phoneE164}`}
                className="font-medium text-[#3DB5E6] hover:underline"
              >
                {SCHOOL_CONTACT.phoneDisplay}
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${SCHOOL_CONTACT.email}`}
                className="font-medium text-[#3DB5E6] hover:underline"
              >
                {SCHOOL_CONTACT.email}
              </a>
            </p>
            <p>
              Instagram:{" "}
              <span className="font-medium text-[#1F3A56]">
                @{SCHOOL_CONTACT.instagram}
              </span>
            </p>
          </address>

          <div className="mt-8 rounded-[1.5rem] bg-[#EAF8FF] p-6">
            <h3 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold">
              Jam operasional
            </h3>
            <p className="mt-2 text-sm text-[#5B6B7C]">
              Senin–Jumat · 07.30–12.00 WIB
            </p>
            <p className="mt-1 text-sm text-[#5B6B7C]">
              Silakan hubungi kami untuk jadwal tur sekolah atau konsultasi
              program.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#3DB5E6] px-5 py-3.5 text-sm font-semibold text-[#3DB5E6]"
            >
              <MapPin className="size-4" />
              Buka di Google Maps
            </a>
            <a
              href={`tel:${SCHOOL_CONTACT.phoneE164}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3A56] px-5 py-3.5 text-sm font-semibold text-[#1F3A56]"
            >
              <Phone className="size-4" />
              Telepon
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border-[4px] border-[#74B9FF]">
          <iframe
            title="Peta BabelKids Pangkalpinang"
            src={MAPS_EMBED}
            className="h-80 w-full border-0 sm:h-[28rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <section className="border-t border-[#EAF0F5] bg-white py-12">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold sm:text-2xl">
            Mencari TK terdekat di Pangkalpinang?
          </h2>
          <p className="mt-3 text-[#5B6B7C]">
            BabelKids melayani keluarga di Pangkalpinang dan area sekitar. Lihat{" "}
            <Link href="/program/taman-kanak-kanak" className="text-[#3DB5E6] hover:underline">
              program TK
            </Link>
            ,{" "}
            <Link href="/program/kelompok-bermain" className="text-[#3DB5E6] hover:underline">
              kelompok bermain
            </Link>
            , atau{" "}
            <Link href="/register" className="text-[#3DB5E6] hover:underline">
              daftar online
            </Link>
            .
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
