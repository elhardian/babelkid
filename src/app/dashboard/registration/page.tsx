"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy, Download, Link2, Plus, Upload, UserRound } from "lucide-react";
import { useRegistrations } from "@/components/dashboard/RegistrationProvider";
import { useParentsRegistry } from "@/components/dashboard/ParentsProvider";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { ParentMultiSelect } from "@/components/dashboard/ParentMultiSelect";
import { DetailedRegistrationForm } from "@/components/DetailedRegistrationForm";
import { MediaUploadField } from "@/components/dashboard/ImageUploadField";
import { Select } from "@/components/dashboard/Select";
import {
  EmptyState,
  FilterSelect,
  SearchFilterBar,
  StatusBadge,
} from "@/components/dashboard/SearchFilterBar";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { CurrencyInput } from "@/components/dashboard/CurrencyInput";
import { formatAgeRange } from "@/lib/registration-form";
import { openRegistrationPdf } from "@/lib/registration-pdf";
import { formatDate, formatIDR } from "@/lib/format";
import {
  Pagination,
  usePagination,
} from "@/components/dashboard/Pagination";
import type {
  PaymentMethod,
  RegistrationApplication,
  RegistrationParent,
  RegistrationStatus,
} from "@/lib/types";

const statusTone: Record<
  RegistrationStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending: "warning",
  reviewing: "info",
  form_sent: "info",
  form_submitted: "warning",
  approved: "success",
  rejected: "danger",
};

const statusLabel: Record<RegistrationStatus, string> = {
  pending: "Menunggu review",
  reviewing: "Direview",
  form_sent: "Link dikirim",
  form_submitted: "Formulir diisi",
  approved: "Diterima · siswa",
  rejected: "Ditolak",
};

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

function appParents(a: RegistrationApplication): RegistrationParent[] {
  if (a.parents?.length) return a.parents;
  return [a.parent];
}

type RegTab = "proses" | "selesai";

function isFormComplete(a: RegistrationApplication) {
  return (
    a.status === "form_submitted" ||
    a.status === "approved" ||
    Boolean(a.detailedFormSubmittedAt) ||
    Boolean(a.detailedForm)
  );
}

export default function DashboardRegistrationPage() {
  const {
    applications,
    updateStatus,
    pendingCount,
    submit,
    generateFormLink,
    recordFee,
    enroll,
  } = useRegistrations();
  const { parents, upsert: upsertParent, getById } = useParentsRegistry();
  const { classes, getById: getClass } = useClassesRegistry();
  const [tab, setTab] = useState<RegTab>("proses");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [showNewParent, setShowNewParent] = useState(false);
  const [formError, setFormError] = useState("");
  const [linkToast, setLinkToast] = useState("");
  const [feeModal, setFeeModal] = useState<RegistrationApplication | null>(
    null,
  );
  const [viewForm, setViewForm] = useState<RegistrationApplication | null>(
    null,
  );
  const [feeAmount, setFeeAmount] = useState(500000);
  const [feeMethod, setFeeMethod] = useState<PaymentMethod>("transfer");
  const [feeProof, setFeeProof] = useState<string | undefined>();
  const [enrollClassId, setEnrollClassId] = useState("");
  const [newRel, setNewRel] = useState<"mother" | "father" | "guardian">(
    "mother",
  );

  const tabCounts = useMemo(() => {
    let proses = 0;
    let selesai = 0;
    for (const a of applications) {
      if (a.status === "rejected") continue;
      if (isFormComplete(a)) selesai += 1;
      else proses += 1;
    }
    return { proses, selesai };
  }, [applications]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (a.status === "rejected") {
        if (tab !== "selesai") return false;
      } else if (tab === "proses" && isFormComplete(a)) {
        return false;
      } else if (tab === "selesai" && !isFormComplete(a)) {
        return false;
      }
      if (status !== "all" && a.status !== status) return false;
      if (!q) return true;
      const plist = appParents(a);
      return (
        plist.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q),
        ) ||
        a.child.name.toLowerCase().includes(q) ||
        a.child.nickname.toLowerCase().includes(q)
      );
    });
  }, [applications, search, status, tab]);

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    total,
    from,
    to,
  } = usePagination(list);

  const statusOptions =
    tab === "proses"
      ? [
          { value: "all", label: "Semua" },
          { value: "pending", label: "Menunggu review" },
          { value: "reviewing", label: "Direview" },
          { value: "form_sent", label: "Link dikirim" },
        ]
      : [
          { value: "all", label: "Semua" },
          { value: "form_submitted", label: "Formulir diisi" },
          { value: "approved", label: "Diterima · siswa" },
          { value: "rejected", label: "Ditolak" },
        ];

  function openAdd() {
    setSelectedParentIds([]);
    setShowNewParent(false);
    setFormError("");
    setAddOpen(true);
  }

  function closeAdd() {
    setAddOpen(false);
    setSelectedParentIds([]);
    setShowNewParent(false);
    setFormError("");
  }

  function copyLink(app: RegistrationApplication) {
    const { path } = generateFormLink(app.id);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    void navigator.clipboard?.writeText(url);
    setLinkToast(url);
    setTimeout(() => setLinkToast(""), 4000);
  }

  function openFee(app: RegistrationApplication) {
    setFeeModal(app);
    setFeeAmount(app.registrationFee?.amount ?? 500000);
    setFeeMethod(app.registrationFee?.method ?? "transfer");
    setFeeProof(app.registrationFee?.proofUrl);
    setEnrollClassId(app.child.preferredClassId ?? classes[0]?.id ?? "");
  }

  function saveFeeAndMaybeEnroll(enrollAfter: boolean) {
    if (!feeModal) return;
    recordFee(feeModal.id, {
      amount: feeAmount,
      method: feeMethod,
      proofUrl: feeProof,
      note: "Biaya pendaftaran",
      status: feeProof ? "approved" : "recorded",
    });
    if (enrollAfter) {
      const student = enroll(feeModal.id, enrollClassId || undefined);
      if (student) {
        setLinkToast(`Siswa tersimpan: ${student.name}`);
        setTimeout(() => setLinkToast(""), 4000);
      }
    }
    setFeeModal(null);
  }

  function onAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    let ids = [...selectedParentIds];

    if (showNewParent) {
      const payload = {
        name: String(fd.get("parentName") || "").trim(),
        relationship: newRel,
        phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        occupation: String(fd.get("occupation") || "").trim() || undefined,
      };
      if (
        !payload.name ||
        !payload.phone ||
        !payload.email ||
        !payload.address
      ) {
        setFormError("Lengkapi data orang tua baru.");
        return;
      }
      const created = upsertParent(payload);
      if (!ids.includes(created.id)) ids = [...ids, created.id];
    }

    if (ids.length === 0) {
      setFormError("Pilih minimal satu orang tua / wali.");
      return;
    }

    const parentRows: RegistrationParent[] = ids.map((id) => {
      const p = getById(id)!;
      return {
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email,
        address: p.address ?? "",
        occupation: p.occupation,
      };
    });

    submit({
      parent: parentRows[0],
      parents: parentRows,
      parentIds: ids,
      child: {
        name: String(fd.get("childName") || "").trim(),
        nickname: String(fd.get("nickname") || "").trim(),
        dateOfBirth: String(fd.get("dob") || ""),
        gender: String(fd.get("gender") || "female") as "male" | "female",
        preferredClassId:
          String(fd.get("preferredClassId") || "").trim() || undefined,
        allergies: String(fd.get("allergies") || "").trim() || undefined,
        notes: String(fd.get("notes") || "").trim() || undefined,
      },
    });
    closeAdd();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Pendaftaran
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Review → kirim formulir lengkap → biaya → simpan ke siswa ·{" "}
            {pendingCount} aktif
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/parents"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5ECF5] bg-white px-4 py-2.5 text-sm font-medium text-[#5B6B7C]"
          >
            <UserRound className="size-4" />
            Orang tua
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
          >
            <Plus className="size-4" />
            Tambah pendaftaran
          </button>
        </div>
      </div>

      {linkToast ? (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="mt-0.5 size-4 shrink-0" />
          <span className="break-all">{linkToast}</span>
        </div>
      ) : null}

      <div className="flex gap-1 rounded-2xl border border-[#E5ECF5] bg-white p-1 shadow-sm">
        {(
          [
            {
              id: "proses" as const,
              label: "Dalam proses",
              count: tabCounts.proses,
            },
            {
              id: "selesai" as const,
              label: "Formulir selesai",
              count: tabCounts.selesai,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setStatus("all");
              setOpenId(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-[#2E7DFF] text-white shadow-sm shadow-[#2E7DFF]/25"
                : "text-[#5B6B7C] hover:bg-[#F3F7FC]"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                tab === t.id
                  ? "bg-white/20 text-white"
                  : "bg-[#EEF3FA] text-[#8A96A8]"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama orang tua / anak…"
      >
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />
      </SearchFilterBar>

      <ul className="space-y-3">
        {pageItems.map((a) => {
          const open = openId === a.id;
          const plist = appParents(a);
          const cls = a.child.preferredClassId
            ? getClass(a.child.preferredClassId)
            : undefined;
          const completed = isFormComplete(a);
          return (
            <li
              key={a.id}
              className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#1A2330]">
                      {a.child.name}{" "}
                      <span className="text-[#8A96A8]">
                        ({a.child.nickname})
                      </span>
                    </p>
                    <StatusBadge
                      label={statusLabel[a.status]}
                      tone={statusTone[a.status]}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    {formatDate(a.submittedAt.slice(0, 10))} ·{" "}
                    {plist.map((p) => p.name).join(" · ")}
                    {cls
                      ? ` · ${cls.name} (${formatAgeRange(cls.ageMinYears, cls.ageMaxYears)})`
                      : ""}
                  </p>
                  {a.formToken && !completed ? (
                    <p className="mt-1 text-[11px] text-[#A0AAB8]">
                      Link: /register/form/{a.formToken}
                    </p>
                  ) : null}
                  {a.detailedFormSubmittedAt ? (
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Formulir diisi{" "}
                      {formatDate(a.detailedFormSubmittedAt.slice(0, 10))}
                      {a.formToken ? " · link kedaluwarsa" : ""}
                    </p>
                  ) : null}
                  {a.registrationFee ? (
                    <p className="mt-1 text-xs text-emerald-700">
                      Biaya daftar {formatIDR(a.registrationFee.amount)} ·{" "}
                      {a.registrationFee.method}
                      {a.registrationFee.proofUrl ? " · ada bukti" : ""}
                    </p>
                  ) : null}
                  {a.enrolledStudentId ? (
                    <Link
                      href={`/dashboard/students/${a.enrolledStudentId}`}
                      className="mt-1 inline-block text-xs font-medium text-[#2E7DFF]"
                    >
                      Lihat siswa →
                    </Link>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {completed && a.detailedForm ? (
                    <button
                      type="button"
                      onClick={() => openRegistrationPdf(a)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1A2330] px-3 py-2 text-xs font-medium text-white"
                    >
                      <Download className="size-3.5" />
                      PDF
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : a.id)}
                    className="rounded-xl bg-[#EEF3FA] px-3 py-2 text-xs font-medium text-[#5B6B7C]"
                  >
                    {open ? "Tutup" : "Detail"}
                  </button>
                </div>
              </div>

              {open ? (
                <div className="mt-4 space-y-4 border-t border-[#EEF3FA] pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Anak
                      </p>
                      <p className="mt-1 text-sm text-[#1A2330]">
                        {a.child.gender === "female"
                          ? "Perempuan"
                          : "Laki-laki"}{" "}
                        · lahir {formatDate(a.child.dateOfBirth)}
                      </p>
                      {a.child.allergies ? (
                        <p className="text-sm text-[#5B6B7C]">
                          Alergi: {a.child.allergies}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Orang tua / wali
                      </p>
                      <ul className="mt-1 space-y-1">
                        {plist.map((p, i) => (
                          <li key={p.id ?? i} className="text-sm">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[#8A96A8]">
                              {" "}
                              · {relLabel[p.relationship]} · {p.phone}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {a.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(a.id, "reviewing")}
                        className="rounded-full bg-[#2E7DFF] px-3 py-2 text-xs font-medium text-white"
                      >
                        Mulai review
                      </button>
                    ) : null}

                    {a.status === "pending" ||
                    a.status === "reviewing" ||
                    a.status === "form_sent" ? (
                      <button
                        type="button"
                        onClick={() => copyLink(a)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#2E7DFF] px-3 py-2 text-xs font-medium text-white"
                      >
                        <Link2 className="size-3.5" />
                        {a.formToken
                          ? "Salin ulang link formulir"
                          : "Generate & salin link"}
                      </button>
                    ) : null}

                    {a.formToken ? (
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/register/form/${a.formToken}`;
                          void navigator.clipboard?.writeText(url);
                          setLinkToast(url);
                          setTimeout(() => setLinkToast(""), 4000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5ECF5] px-3 py-2 text-xs font-medium text-[#5B6B7C]"
                      >
                        <Copy className="size-3.5" />
                        Salin link
                      </button>
                    ) : null}

                    {a.detailedForm ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewForm(a)}
                          className="rounded-full border border-[#E5ECF5] px-3 py-2 text-xs font-medium text-[#5B6B7C]"
                        >
                          Lihat formulir lengkap
                        </button>
                        <button
                          type="button"
                          onClick={() => openRegistrationPdf(a)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#1A2330] px-3 py-2 text-xs font-medium text-white"
                        >
                          <Download className="size-3.5" />
                          Unduh PDF
                        </button>
                      </>
                    ) : null}

                    {a.status === "form_submitted" ||
                    a.status === "form_sent" ? (
                      <button
                        type="button"
                        onClick={() => openFee(a)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
                      >
                        <Upload className="size-3.5" />
                        Biaya & terima siswa
                      </button>
                    ) : null}

                    {a.status !== "approved" && a.status !== "rejected" ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(a.id, "rejected")}
                        className="rounded-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Tolak
                      </button>
                    ) : null}
                  </div>

                  <ol className="grid gap-2 text-[11px] text-[#8A96A8] sm:grid-cols-4">
                    {[
                      ["1. Review", a.status !== "pending"],
                      ["2. Link form", Boolean(a.formToken)],
                      ["3. Form diisi", Boolean(a.detailedForm)],
                      ["4. Biaya + siswa", a.status === "approved"],
                    ].map(([label, done]) => (
                      <li
                        key={String(label)}
                        className={
                          done
                            ? "rounded-lg bg-emerald-50 px-2 py-1.5 font-medium text-emerald-700"
                            : "rounded-lg bg-[#F3F7FC] px-2 py-1.5"
                        }
                      >
                        {label}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </li>
          );
        })}
        {total === 0 ? (
          <EmptyState
            message={
              tab === "proses"
                ? "Tidak ada pendaftaran dalam proses."
                : "Belum ada formulir yang selesai diisi."
            }
          />
        ) : null}
      </ul>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(feeModal)}
        onClose={() => setFeeModal(null)}
        title="Biaya pendaftaran & terima siswa"
      >
        {feeModal ? (
          <div className="space-y-3">
            <p className="text-sm text-[#8A96A8]">
              {feeModal.child.name} · unggah bukti pembayaran registration fee,
              lalu simpan ke modul Siswa.
            </p>
            <Field label="Jumlah">
              <CurrencyInput
                value={feeAmount}
                onChange={setFeeAmount}
                required
              />
            </Field>
            <Field label="Metode">
              <Select
                value={feeMethod}
                onChange={(v) => setFeeMethod(v as PaymentMethod)}
                options={[
                  { value: "transfer", label: "Transfer" },
                  { value: "tunai", label: "Tunai" },
                  { value: "whatsapp", label: "WhatsApp" },
                ]}
              />
            </Field>
            <MediaUploadField
              images={feeProof ? [feeProof] : []}
              videoUrl={undefined}
              onImagesChange={(urls) => setFeeProof(urls[0])}
              onVideoChange={() => {}}
              label="Bukti pembayaran"
              maxImages={1}
            />
            <Field label="Kelas penempatan">
              <Select
                value={enrollClassId}
                onChange={setEnrollClassId}
                options={classes.map((c) => ({
                  value: c.id,
                  label: `${c.name} · ${formatAgeRange(c.ageMinYears, c.ageMaxYears)}`,
                }))}
              />
            </Field>
            <div className="flex flex-col-reverse gap-2 border-t border-[#EEF3FA] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFeeModal(null)}
                className="rounded-xl px-3 py-2 text-sm text-[#8A96A8]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => saveFeeAndMaybeEnroll(false)}
                className="rounded-xl border border-[#E5ECF5] px-4 py-2 text-sm font-medium text-[#5B6B7C]"
              >
                Simpan biaya saja
              </button>
              <button
                type="button"
                onClick={() => saveFeeAndMaybeEnroll(true)}
                className="rounded-xl bg-[#2E7DFF] px-4 py-2 text-sm font-medium text-white"
              >
                Terima & simpan siswa
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(viewForm)}
        onClose={() => setViewForm(null)}
        title="Formulir lengkap"
        wide
      >
        {viewForm?.detailedForm ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => openRegistrationPdf(viewForm)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A2330] px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
            >
              <Download className="size-4" />
              Unduh PDF (format formulir)
            </button>
            <DetailedRegistrationForm
              initial={viewForm.detailedForm}
              readOnly
              stepped={false}
            />
          </div>
        ) : (
          <p className="text-sm text-[#8A96A8]">Belum diisi orang tua.</p>
        )}
      </Modal>

      <Modal open={addOpen} onClose={closeAdd} title="Tambah pendaftaran" wide>
        <form onSubmit={onAddSubmit} className="space-y-3">
          <Field label="Orang tua / wali">
            <ParentMultiSelect
              parents={parents}
              value={selectedParentIds}
              onChange={setSelectedParentIds}
              required={!showNewParent}
            />
          </Field>
          <button
            type="button"
            onClick={() => setShowNewParent((v) => !v)}
            className="text-xs font-medium text-[#2E7DFF]"
          >
            {showNewParent
              ? "Tutup form orang tua baru"
              : "+ Buat orang tua baru"}
          </button>
          {showNewParent ? (
            <div className="space-y-3 rounded-xl bg-[#F7FAFD] p-3">
              <Field label="Nama">
                <input name="parentName" className={inputClass} />
              </Field>
              <Field label="Hubungan">
                <Select
                  value={newRel}
                  onChange={(v) =>
                    setNewRel(v as "mother" | "father" | "guardian")
                  }
                  options={[
                    { value: "mother", label: "Ibu" },
                    { value: "father", label: "Ayah" },
                    { value: "guardian", label: "Wali" },
                  ]}
                />
              </Field>
              <Field label="HP">
                <input name="phone" className={inputClass} />
              </Field>
              <Field label="Email">
                <input name="email" type="email" className={inputClass} />
              </Field>
              <Field label="Alamat">
                <textarea name="address" className={inputClass} />
              </Field>
            </div>
          ) : null}
          <Field label="Nama anak">
            <input name="childName" required className={inputClass} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Panggilan">
              <input name="nickname" required className={inputClass} />
            </Field>
            <Field label="Tanggal lahir">
              <input name="dob" type="date" required className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jenis kelamin">
              <select name="gender" className={inputClass} defaultValue="female">
                <option value="female">Perempuan</option>
                <option value="male">Laki-laki</option>
              </select>
            </Field>
            <Field label="Kelas pilihan">
              <select
                name="preferredClassId"
                className={inputClass}
                defaultValue={classes[0]?.id}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {formatAgeRange(c.ageMinYears, c.ageMaxYears)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {formError ? (
            <p className="text-sm text-rose-600">{formError}</p>
          ) : null}
          <ModalActions onCancel={closeAdd} submitLabel="Simpan" />
        </form>
      </Modal>
    </div>
  );
}
