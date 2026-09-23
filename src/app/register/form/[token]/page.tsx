"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { Check, Link2Off } from "lucide-react";
import { DetailedRegistrationForm } from "@/components/DetailedRegistrationForm";
import {
  getRegistrationByToken,
  submitDetailedFormByToken,
  useRegistrationStore,
} from "@/components/dashboard/RegistrationProvider";
import {
  autofillDetailedForm,
  emptyDetailedForm,
} from "@/lib/registration-form";

export default function ParentDetailedRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { applications } = useRegistrationStore();
  const app = useMemo(
    () =>
      applications.find((a) => a.formToken === token) ??
      getRegistrationByToken(token),
    [applications, token],
  );
  const [justSubmitted, setJustSubmitted] = useState(false);

  const initial = useMemo(() => {
    if (!app) return emptyDetailedForm();
    if (app.detailedForm) return app.detailedForm;
    return autofillDetailedForm(app);
  }, [app]);

  if (!app) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
          <Link2Off className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#1A2330]">
          Link tidak valid
        </h1>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Formulir tidak ditemukan atau sudah kedaluwarsa. Hubungi admin
          BabelKids.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  if (app.status === "rejected") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#1A2330]">
          Pendaftaran ditolak
        </h1>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Hubungi sekolah untuk informasi lebih lanjut.
        </p>
      </div>
    );
  }

  const linkExpired =
    app.status === "form_submitted" ||
    app.status === "approved" ||
    Boolean(app.detailedFormSubmittedAt);

  if (justSubmitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Check className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#1A2330]">
          Formulir terkirim
        </h1>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Terima kasih. Link ini sudah kedaluwarsa dan tidak bisa dibuka lagi.
          Tim BabelKids akan meninjau data Anda.
        </p>
        <p className="mt-2 text-xs text-[#A0AAB8]">Kode: {app.id}</p>
      </div>
    );
  }

  if (linkExpired) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
          <Link2Off className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#1A2330]">
          Link kedaluwarsa
        </h1>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Formulir untuk{" "}
          <span className="font-medium text-[#1A2330]">{app.child.name}</span>{" "}
          sudah dikirim
          {app.detailedFormSubmittedAt
            ? ` pada ${app.detailedFormSubmittedAt.slice(0, 10)}`
            : ""}
          . Link ini tidak dapat digunakan lagi.
        </p>
        <p className="mt-3 text-xs text-[#A0AAB8]">
          Hubungi admin BabelKids jika perlu koreksi data.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const canFill = app.status === "form_sent" || app.status === "reviewing";

  if (!canFill) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
          <Link2Off className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#1A2330]">
          Link belum aktif
        </h1>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Admin belum mengaktifkan formulir ini. Coba lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7FC] pb-16">
      <header className="border-b border-[#E5ECF5] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7DFF]">
            BabelKids · Registration Form
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2330]">
            Formulir pendaftaran lengkap
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Untuk {app.child.name} ({app.child.nickname}) · sebagian data sudah
            diisi dari pendaftaran awal
          </p>
          <p className="mt-2 text-xs text-[#A0AAB8]">
            Jl. JK. Hasan Basri Sulaiman (Jl. Balai) No.97 Pangkalpinang · 0717
            – 431640
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <DetailedRegistrationForm
          key={app.id}
          initial={initial}
          onSubmit={(form) => {
            const ok = submitDetailedFormByToken(token, form);
            if (ok) setJustSubmitted(true);
          }}
        />
      </div>
    </div>
  );
}
