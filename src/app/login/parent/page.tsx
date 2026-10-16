import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk Orang Tua — BabelKids",
  description: "Login aplikasi orang tua BabelKids.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BabelKids",
    statusBarStyle: "default",
  },
};

export default async function ParentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session?.portal === "parent") redirect("/parents");
  if (session?.portal === "staff") redirect("/dashboard");

  const params = await searchParams;
  const next = params.next ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EAF8FF] font-[family-name:var(--font-outfit)] text-[#1F3A56]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, #D4F8EC 0%, transparent 40%), radial-gradient(circle at 85% 10%, #FFF6C2 0%, transparent 35%), linear-gradient(180deg, #3DB5E6 0%, #EAF8FF 42%, #FFFFFF 100%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-8 text-center">
          <Link href="/app" className="inline-block">
            <Image
              src="/logo.png"
              alt="BabelKids"
              width={120}
              height={110}
              className="mx-auto h-20 w-auto object-contain drop-shadow-sm"
              priority
            />
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-semibold tracking-tight text-white sm:text-[#1F3A56]">
            Masuk orang tua
          </h1>
          <p className="mt-1 text-sm text-white/85 sm:text-[#5B6B7C]">
            Laporan, kehadiran, SPP, dan acara sekolah
          </p>
        </div>

        <LoginForm portal="parent" next={next} />

        <p className="mt-6 text-center text-sm text-[#5B6B7C]">
          Belum pasang aplikasi?{" "}
          <Link
            href="/app"
            className="font-medium text-[#3DB5E6] hover:underline"
          >
            Lihat Parent App
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-[#5B6B7C]">
          Staf sekolah?{" "}
          <Link
            href="/login"
            className="font-medium text-[#3DB5E6] hover:underline"
          >
            Masuk dashboard
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-[#5B6B7C]">
          <Link href="/" className="font-medium text-[#3DB5E6] hover:underline">
            ← Kembali ke website
          </Link>
        </p>
      </div>
    </div>
  );
}
