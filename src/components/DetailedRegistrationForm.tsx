"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PenLine, Trash2 } from "lucide-react";
import { Select } from "@/components/dashboard/Select";
import { SignaturePadModal } from "@/components/SignaturePadModal";
import { cn } from "@/lib/format";
import type { RegistrationDetailedForm } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2.5 text-sm text-[#1A2330] outline-none placeholder:text-[#A0AAB8] focus:border-[#2E7DFF]/50 focus:ring-2 focus:ring-[#2E7DFF]/15";

const STEPS = [
  { id: "student", title: "Data siswa", short: "Siswa" },
  { id: "parents", title: "Orang tua / wali", short: "Orang tua" },
  { id: "emergency", title: "Kontak darurat", short: "Darurat" },
  { id: "childInfo", title: "Info penting anak", short: "Info anak" },
  { id: "tuition", title: "Keuangan / SPP", short: "SPP" },
  { id: "declaration", title: "Pernyataan", short: "Selesai" },
] as const;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[#5B6B7C]">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-[11px] text-[#A0AAB8]">{hint}</span>
      ) : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function DetailedRegistrationForm({
  initial,
  onSubmit,
  readOnly,
  submitLabel = "Kirim formulir",
  /** When false, show all sections (admin overview). Default: step wizard */
  stepped = true,
}: {
  initial: RegistrationDetailedForm;
  onSubmit?: (form: RegistrationDetailedForm) => void;
  readOnly?: boolean;
  submitLabel?: string;
  stepped?: boolean;
}) {
  const [form, setForm] = useState<RegistrationDetailedForm>(initial);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [signOpen, setSignOpen] = useState(false);

  useEffect(() => {
    if (!stepped) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, stepped]);

  function patchStudent(p: Partial<RegistrationDetailedForm["student"]>) {
    setForm((f) => ({ ...f, student: { ...f.student, ...p } }));
  }
  function patchFather(p: Partial<RegistrationDetailedForm["father"]>) {
    setForm((f) => ({ ...f, father: { ...f.father, ...p } }));
  }
  function patchMother(p: Partial<RegistrationDetailedForm["mother"]>) {
    setForm((f) => ({ ...f, mother: { ...f.mother, ...p } }));
  }
  function patchEmergency(p: Partial<RegistrationDetailedForm["emergency"]>) {
    setForm((f) => ({ ...f, emergency: { ...f.emergency, ...p } }));
  }
  function patchChildInfo(p: Partial<RegistrationDetailedForm["childInfo"]>) {
    setForm((f) => ({ ...f, childInfo: { ...f.childInfo, ...p } }));
  }
  function patchTuition(
    p: Partial<RegistrationDetailedForm["tuitionResponsible"]>,
  ) {
    setForm((f) => ({
      ...f,
      tuitionResponsible: { ...f.tuitionResponsible, ...p },
    }));
  }

  function validateStep(i: number): string | null {
    if (i === 0 && !form.student.fullName.trim()) {
      return "Isi nama lengkap anak.";
    }
    if (
      i === 1 &&
      !form.mother.name.trim() &&
      !form.father.name.trim()
    ) {
      return "Isi minimal data ibu atau ayah.";
    }
    if (i === STEPS.length - 1) {
      if (!form.declarationSigned) {
        return "Centang pernyataan di bagian akhir.";
      }
      if (!form.signedBy.trim()) {
        return "Isi nama penandatangan.";
      }
      if (!form.signatureDataUrl) {
        return "Tambahkan tanda tangan.";
      }
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    if (stepped && step < STEPS.length - 1) {
      goNext();
      return;
    }
    const err = validateStep(STEPS.length - 1);
    if (err || !form.student.fullName.trim()) {
      setError(err ?? "Lengkapi nama anak.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  const disabled = readOnly;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const studentSection = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full Name (Nama lengkap)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.fullName}
            onChange={(e) => patchStudent({ fullName: e.target.value })}
          />
        </Field>
        <Field label="Nickname (Nama panggilan)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.nickname}
            onChange={(e) => patchStudent({ nickname: e.target.value })}
          />
        </Field>
        <Field label="T-shirt size (Ukuran kaos)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.tshirtSize}
            onChange={(e) => patchStudent({ tshirtSize: e.target.value })}
            placeholder="cth. S / M anak"
          />
        </Field>
        <Field label="Sex (Jenis kelamin)">
          <Select
            value={form.student.gender}
            onChange={(v) =>
              patchStudent({ gender: v as "male" | "female" })
            }
            disabled={disabled}
            options={[
              { value: "female", label: "F · Perempuan" },
              { value: "male", label: "M · Laki-laki" },
            ]}
          />
        </Field>
        <Field label="Place of birth (Tempat lahir)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.placeOfBirth}
            onChange={(e) => patchStudent({ placeOfBirth: e.target.value })}
          />
        </Field>
        <Field label="Date of birth (Tanggal lahir)">
          <input
            type="date"
            className={inputClass}
            disabled={disabled}
            value={form.student.dateOfBirth}
            onChange={(e) => patchStudent({ dateOfBirth: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Home Address (Alamat rumah)">
        <textarea
          className={cn(inputClass, "min-h-[72px]")}
          disabled={disabled}
          value={form.student.homeAddress}
          onChange={(e) => patchStudent({ homeAddress: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Home Phone (Telpon rumah)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.homePhone}
            onChange={(e) => patchStudent({ homePhone: e.target.value })}
          />
        </Field>
        <Field label="Cell Phone (Handphone)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.student.cellPhone}
            onChange={(e) => patchStudent({ cellPhone: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );

  const parentsSection = (
    <div className="space-y-4">
      <Field label="Marital status (Status pernikahan)">
        <Select
          value={form.maritalStatus}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              maritalStatus: v as RegistrationDetailedForm["maritalStatus"],
            }))
          }
          disabled={disabled}
          options={[
            { value: "married", label: "Married · Menikah" },
            { value: "separated", label: "Separated · Berpisah" },
            { value: "divorced", label: "Divorced · Bercerai" },
          ]}
        />
      </Field>
      <Field
        label="Custody (Hak asuh)"
        hint="Jika bercerai/berpisah, siapa yang memiliki hak asuh anak?"
      >
        <input
          className={inputClass}
          disabled={disabled}
          value={form.custodyNote}
          onChange={(e) =>
            setForm((f) => ({ ...f, custodyNote: e.target.value }))
          }
        />
      </Field>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
          Father / Guardian · Ayah
        </p>
        <AdultFields
          value={form.father}
          onChange={patchFather}
          disabled={disabled}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
          Mother / Guardian · Ibu
        </p>
        <AdultFields
          value={form.mother}
          onChange={patchMother}
          disabled={disabled}
        />
      </div>
    </div>
  );

  const emergencySection = (
    <div className="space-y-3">
      <AdultFields
        value={form.emergency}
        onChange={patchEmergency}
        disabled={disabled}
        showOccupation={false}
        showBusiness={false}
      />
      <Field label="Relationship (Hubungan kekerabatan)">
        <input
          className={inputClass}
          disabled={disabled}
          value={form.emergency.relationship}
          onChange={(e) => patchEmergency({ relationship: e.target.value })}
        />
      </Field>
      <p className="text-xs text-[#8A96A8]">
        Child will not be released to anyone other than the above without
        consent of parent or guardian.
      </p>
    </div>
  );

  const childInfoSection = (
    <div className="space-y-3">
      {(
        [
          ["fears", "Fears (Ketakutan tertentu)"],
          [
            "householdMembers",
            "Other household members (Anggota keluarga lain)",
          ],
          [
            "playsWithOthers",
            "Plays with other children? (Bermain dengan anak lain)",
          ],
          ["imaginaryFriend", "Imaginary friend (Teman khayal)"],
          ["habits", "Habits (Kebiasaan)"],
          [
            "behaviourDifficulties",
            "Behaviour difficulties (Permasalahan perilaku)",
          ],
          ["pets", "Pets (Hewan peliharaan)"],
          ["languages", "Languages at home (Bahasa di rumah)"],
          ["speechDifficulties", "Speech difficulties (Kesulitan berbicara)"],
          ["allergiesHealth", "Allergies / health (Alergi / kesehatan)"],
          [
            "beenAwayFromParents",
            "Been away from parents? (Pernah jauh dari orang tua)",
          ],
          [
            "preschoolGoals",
            "What do you want from preschool? (Harapan orang tua)",
          ],
          ["otherNotes", "Other information for teachers (Info lain)"],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label}>
          <textarea
            className={cn(inputClass, "min-h-[64px]")}
            disabled={disabled}
            value={form.childInfo[key]}
            onChange={(e) => patchChildInfo({ [key]: e.target.value })}
          />
        </Field>
      ))}
    </div>
  );

  const tuitionSection = (
    <div className="space-y-3">
      <Field label="Person responsible for tuition (Penanggung jawab SPP)">
        <input
          className={inputClass}
          disabled={disabled}
          value={form.tuitionResponsible.name}
          onChange={(e) => patchTuition({ name: e.target.value })}
        />
      </Field>
      <Field label="Address">
        <textarea
          className={cn(inputClass, "min-h-[64px]")}
          disabled={disabled}
          value={form.tuitionResponsible.homeAddress}
          onChange={(e) => patchTuition({ homeAddress: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Email">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.tuitionResponsible.email}
            onChange={(e) => patchTuition({ email: e.target.value })}
          />
        </Field>
        <Field label="Home phone">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.tuitionResponsible.homePhone}
            onChange={(e) => patchTuition({ homePhone: e.target.value })}
          />
        </Field>
        <Field label="Cell phone">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.tuitionResponsible.cellPhone}
            onChange={(e) => patchTuition({ cellPhone: e.target.value })}
          />
        </Field>
      </div>
      <p className="rounded-xl bg-[#F7FAFD] px-3 py-3 text-xs leading-relaxed text-[#5B6B7C]">
        The first monthly payment will be withdrawn in July. This payment will
        secure your children&apos;s space in class. Tuition will be withdrawn on
        the 5th or 10th of each month. Monthly reminder statements are NOT sent
        out. No refunds can be made for registration fees.
      </p>
      <p className="text-[11px] leading-relaxed text-[#8A96A8]">
        Pembayaran bulanan pertama (Juli) mengamankan kursi anak. SPP ditarik
        tanggal 5 atau 10 setiap bulan. Tidak ada reminder bulanan. Biaya
        pendaftaran (registration fee) tidak dapat dikembalikan.
      </p>
    </div>
  );

  const declarationSection = (
    <div className="space-y-3">
      <p className="text-sm text-[#5B6B7C]">
        Saya menyatakan data di atas benar dan lengkap, serta telah membaca isi
        formulir pendaftaran ini.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            disabled={disabled}
            value={form.declarationDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, declarationDate: e.target.value }))
            }
          />
        </Field>
        <Field label="Parent / Guardian name (Nama)">
          <input
            className={inputClass}
            disabled={disabled}
            value={form.signedBy}
            onChange={(e) =>
              setForm((f) => ({ ...f, signedBy: e.target.value }))
            }
          />
        </Field>
      </div>

      <div>
        <p className="mb-1.5 text-sm text-[#5B6B7C]">
          Tanda tangan (Parent / Guardian Signature)
        </p>
        {form.signatureDataUrl ? (
          <div className="overflow-hidden rounded-xl border border-[#E5ECF5] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.signatureDataUrl}
              alt="Tanda tangan"
              className="mx-auto h-28 w-full bg-white object-contain"
            />
            {!disabled ? (
              <div className="flex gap-2 border-t border-[#EEF3FA] p-2">
                <button
                  type="button"
                  onClick={() => setSignOpen(true)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#EEF3FA] px-3 py-2 text-xs font-medium text-[#2E7DFF]"
                >
                  <PenLine className="size-3.5" />
                  Ubah tanda tangan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      signatureDataUrl: undefined,
                      declarationSigned: false,
                    }))
                  }
                  className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                  Hapus
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setSignOpen(true)}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#D5DEEA] bg-[#F7FAFD] px-4 py-8 text-sm font-medium transition",
              disabled
                ? "cursor-not-allowed text-[#A0AAB8]"
                : "text-[#2E7DFF] hover:border-[#2E7DFF]/40 hover:bg-[#EEF3FA]",
            )}
          >
            <PenLine className="size-6" />
            Tanda tangan
          </button>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-[#1A2330]">
        <input
          type="checkbox"
          className="mt-1"
          disabled={disabled}
          checked={form.declarationSigned}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              declarationSigned: e.target.checked,
            }))
          }
        />
        <span>Saya menyetujui pernyataan di atas</span>
      </label>
    </div>
  );

  const signatureModal = (
    <SignaturePadModal
      open={signOpen}
      onClose={() => setSignOpen(false)}
      initialDataUrl={form.signatureDataUrl}
      onSave={(dataUrl) =>
        setForm((f) => ({
          ...f,
          signatureDataUrl: dataUrl,
          declarationSigned: true,
        }))
      }
    />
  );

  const sections = [
    studentSection,
    parentsSection,
    emergencySection,
    childInfoSection,
    tuitionSection,
    declarationSection,
  ];

  if (!stepped) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {STEPS.map((s, i) => (
          <section
            key={s.id}
            className="space-y-3 rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2E7DFF]">
              {s.title}
            </h2>
            {sections[i]}
          </section>
        ))}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!readOnly && onSubmit ? (
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#2E7DFF] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
          >
            {submitLabel}
          </button>
        ) : null}
        {signatureModal}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              disabled={readOnly ? false : i > step}
              onClick={() => {
                if (readOnly || i <= step) {
                  setError("");
                  setStep(i);
                }
              }}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i <= step ? "bg-[#2E7DFF]" : "bg-[#E5ECF5]",
              )}
              aria-label={`Langkah ${i + 1}: ${s.short}`}
            />
          ))}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#8A96A8]">
              Langkah {step + 1} dari {STEPS.length}
            </p>
            <h2 className="text-lg font-semibold text-[#1A2330]">
              {current.title}
            </h2>
          </div>
          <p className="hidden text-xs text-[#A0AAB8] sm:block">
            {STEPS.map((s) => s.short).join(" → ")}
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (readOnly || i <= step) {
                  setError("");
                  setStep(i);
                }
              }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                i === step
                  ? "bg-[#2E7DFF] text-white"
                  : i < step || readOnly
                    ? "bg-[#EEF3FA] text-[#2E7DFF]"
                    : "bg-[#F3F7FC] text-[#A0AAB8]",
              )}
            >
              {i + 1}. {s.short}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm sm:p-5">
        {sections[step]}
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-full px-4 py-3 text-sm font-medium",
            step === 0
              ? "cursor-not-allowed text-[#C5CDD8]"
              : "bg-[#EEF3FA] text-[#2E7DFF]",
          )}
        >
          <ChevronLeft className="size-4" />
          Kembali
        </button>

        {isLast ? (
          !readOnly && onSubmit ? (
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-5 py-3 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
            >
              {submitLabel}
            </button>
          ) : (
            <span className="self-center text-xs text-[#8A96A8]">
              Akhir formulir
            </span>
          )
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-[#2E7DFF] px-5 py-3 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
          >
            Lanjut
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
      {signatureModal}
    </form>
  );
}

function AdultFields({
  value,
  onChange,
  disabled,
  showOccupation = true,
  showBusiness = true,
}: {
  value: {
    name: string;
    homeAddress: string;
    email: string;
    homePhone: string;
    cellPhone: string;
    occupation?: string;
    businessName?: string;
    officeAddress?: string;
    businessPhone?: string;
  };
  onChange: (p: Record<string, string>) => void;
  disabled?: boolean;
  showOccupation?: boolean;
  showBusiness?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Field label="Name (Nama)">
        <input
          className={inputClass}
          disabled={disabled}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <Field label="Home Address (Alamat)">
        <textarea
          className={cn(inputClass, "min-h-[64px]")}
          disabled={disabled}
          value={value.homeAddress}
          onChange={(e) => onChange({ homeAddress: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Email">
          <input
            className={inputClass}
            disabled={disabled}
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Home phone">
          <input
            className={inputClass}
            disabled={disabled}
            value={value.homePhone}
            onChange={(e) => onChange({ homePhone: e.target.value })}
          />
        </Field>
        <Field label="Cell phone">
          <input
            className={inputClass}
            disabled={disabled}
            value={value.cellPhone}
            onChange={(e) => onChange({ cellPhone: e.target.value })}
          />
        </Field>
      </div>
      {showOccupation ? (
        <Field label="Occupation (Pekerjaan)">
          <input
            className={inputClass}
            disabled={disabled}
            value={value.occupation ?? ""}
            onChange={(e) => onChange({ occupation: e.target.value })}
          />
        </Field>
      ) : null}
      {showBusiness ? (
        <>
          <Field label="Business Name (Nama perusahaan)">
            <input
              className={inputClass}
              disabled={disabled}
              value={value.businessName ?? ""}
              onChange={(e) => onChange({ businessName: e.target.value })}
            />
          </Field>
          <Field label="Office Address (Alamat kantor)">
            <input
              className={inputClass}
              disabled={disabled}
              value={value.officeAddress ?? ""}
              onChange={(e) => onChange({ officeAddress: e.target.value })}
            />
          </Field>
          <Field label="Business Telephone (Telpon kantor)">
            <input
              className={inputClass}
              disabled={disabled}
              value={value.businessPhone ?? ""}
              onChange={(e) => onChange({ businessPhone: e.target.value })}
            />
          </Field>
        </>
      ) : null}
    </div>
  );
}
