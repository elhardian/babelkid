import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ctaClass =
  "inline-flex items-center gap-2 rounded-full bg-[#1F3A56] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#16293d]";

export function ContentHero({
  eyebrow,
  title,
  description,
  ctaHref = "/register",
  ctaLabel = "Daftar Segera",
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const external = ctaHref.startsWith("http");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3DB5E6] via-[#5BC8F0] to-[#EAF8FF] px-5 pb-16 pt-12 sm:pb-20 sm:pt-16">
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {external ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClass}
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <Link href={ctaHref} className={ctaClass}>
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          )}
          <Link
            href="/lokasi"
            className="inline-flex items-center gap-2 rounded-full bg-white/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/35"
          >
            Lihat lokasi
          </Link>
        </div>
      </div>
    </section>
  );
}
