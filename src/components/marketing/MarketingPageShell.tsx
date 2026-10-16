import Image from "next/image";
import Link from "next/link";
import { SCHOOL_ADDRESS, WHATSAPP_URL } from "@/lib/site";

const nav = [
  { href: "/tentang", label: "Tentang" },
  { href: "/program/taman-kanak-kanak", label: "Program" },
  { href: "/lokasi", label: "Lokasi" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingPageShell({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-outfit)] text-[#1F3A56]">
      <header className="sticky top-0 z-40 border-b border-[#E5ECF5] bg-[#3DB5E6]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.5rem]">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="BabelKids Pangkalpinang"
              width={120}
              height={110}
              className="h-12 w-auto object-contain drop-shadow-sm sm:h-14"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/95 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:opacity-80">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/register"
            className="rounded-full bg-[#1F3A56] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16293d]"
          >
            Daftar Segera
          </Link>
        </div>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="border-b border-[#EAF0F5] bg-[#EAF8FF]/60"
        >
          <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 px-5 py-3 text-xs text-[#5B6B7C] sm:text-sm">
            <li>
              <Link href="/" className="hover:text-[#3DB5E6]">
                Beranda
              </Link>
            </li>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                <span aria-hidden>/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#3DB5E6]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[#1F3A56]">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <main>{children}</main>

      <footer className="border-t border-[#E8F0F5] bg-[#EAF8FF] py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/logo.png"
              alt="BabelKids"
              width={80}
              height={72}
              className="h-12 w-auto object-contain"
            />
            <p className="mt-3 text-sm text-[#5B6B7C]">
              TK &amp; Kelompok Bermain bilingual di Pangkalpinang.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Program</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5B6B7C]">
              <li>
                <Link href="/program/kelompok-bermain" className="hover:text-[#3DB5E6]">
                  Kelompok Bermain
                </Link>
              </li>
              <li>
                <Link href="/program/taman-kanak-kanak" className="hover:text-[#3DB5E6]">
                  Taman Kanak-Kanak
                </Link>
              </li>
              <li>
                <Link href="/program/bilingual" className="hover:text-[#3DB5E6]">
                  Jalur Bilingual
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Informasi</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5B6B7C]">
              <li>
                <Link href="/tentang" className="hover:text-[#3DB5E6]">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/lokasi" className="hover:text-[#3DB5E6]">
                  Lokasi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#3DB5E6]">
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#3DB5E6]"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Alamat</p>
            <p className="mt-3 text-sm leading-relaxed text-[#5B6B7C]">
              {SCHOOL_ADDRESS.full}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
