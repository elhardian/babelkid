"use client";

import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F3F7FC] font-[family-name:var(--font-outfit)] text-[#1A2330]">
      <div className="mx-auto max-w-lg px-5 py-8">
        <Link href="/" className="text-sm font-medium text-[#2E7DFF]">
          ← BabelKids
        </Link>
        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          Pendaftaran siswa
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Isi data orang tua, lalu data anak. Tim sekolah akan review di
          dashboard.
        </p>
        <div className="mt-6">
          <RegistrationForm variant="page" />
        </div>
      </div>
    </div>
  );
}
