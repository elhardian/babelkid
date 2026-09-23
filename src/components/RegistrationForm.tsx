"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { submitRegistration } from "@/components/dashboard/RegistrationProvider";
import { Select } from "@/components/dashboard/Select";
import { classes } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import type { RegistrationParent } from "@/lib/types";

type Step = 1 | 2 | 3;

type ParentDraft = {
  key: string;
  name: string;
  relationship: RegistrationParent["relationship"];
  phone: string;
  email: string;
  address: string;
  occupation: string;
};

function makeParent(
  relationship: RegistrationParent["relationship"] = "mother",
): ParentDraft {
  return {
    key: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    relationship,
    phone: "",
    email: "",
    address: "",
    occupation: "",
  };
}

const emptyChild: {
  name: string;
  nickname: string;
  dateOfBirth: string;
  gender: "male" | "female";
  preferredClassId: string;
  allergies: string;
  notes: string;
} = {
  name: "",
  nickname: "",
  dateOfBirth: "",
  gender: "female",
  preferredClassId: "c1",
  allergies: "",
  notes: "",
};

const fieldClass =
  "w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm text-[#1A2330] outline-none transition placeholder:text-[#8A96A8] focus:shadow-[0_0_0_4px_rgba(46,125,255,0.2)]";

const fieldClassEmbed =
  "w-full rounded-2xl border-0 bg-white/90 px-4 py-3.5 text-sm text-[#1A2330] outline-none transition placeholder:text-[#8A96A8] focus:shadow-[0_0_0_4px_rgba(255,107,107,0.25)]";

const MAX_PARENTS = 4;

function isParentComplete(p: ParentDraft) {
  return (
    Boolean(p.name.trim()) &&
    Boolean(p.phone.trim()) &&
    Boolean(p.email.trim()) &&
    Boolean(p.address.trim())
  );
}

export function RegistrationForm({
  variant = "page",
}: {
  variant?: "page" | "embed";
}) {
  const [step, setStep] = useState<Step>(1);
  const [parents, setParents] = useState<ParentDraft[]>(() => [
    makeParent("mother"),
    makeParent("father"),
  ]);
  const [child, setChild] = useState(emptyChild);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const preschool = useMemo(
    () =>
      classes.filter(
        (c) => c.level === "preschool" || c.level === "kindergarten",
      ),
    [],
  );

  const canParent = parents.length > 0 && parents.every(isParentComplete);

  const canChild =
    child.name.trim() && child.nickname.trim() && child.dateOfBirth.trim();

  const input = variant === "embed" ? fieldClassEmbed : fieldClass;
  const embed = variant === "embed";

  function updateParent(key: string, patch: Partial<ParentDraft>) {
    setParents((list) =>
      list.map((p) => (p.key === key ? { ...p, ...patch } : p)),
    );
  }

  function addParent() {
    if (parents.length >= MAX_PARENTS) return;
    setParents((list) => [...list, makeParent("guardian")]);
  }

  function removeParent(key: string) {
    if (parents.length <= 1) return;
    setParents((list) => list.filter((p) => p.key !== key));
  }

  function resetForm() {
    setDoneId(null);
    setStep(1);
    setParents([makeParent("mother"), makeParent("father")]);
    setChild(emptyChild);
    setError("");
  }

  function submit() {
    setError("");
    if (!canParent || !canChild) {
      setError("Lengkapi data orang tua dan anak terlebih dahulu.");
      return;
    }
    const parentRows: RegistrationParent[] = parents.map((p) => ({
      name: p.name.trim(),
      relationship: p.relationship,
      phone: p.phone.trim(),
      email: p.email.trim(),
      address: p.address.trim(),
      occupation: p.occupation.trim() || undefined,
    }));
    const row = submitRegistration({
      parent: parentRows[0],
      parents: parentRows,
      child: {
        name: child.name.trim(),
        nickname: child.nickname.trim(),
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        preferredClassId: child.preferredClassId || undefined,
        allergies: child.allergies.trim() || undefined,
        notes: child.notes.trim() || undefined,
      },
    });
    setDoneId(row.id);
    setStep(3);
  }

  if (doneId && step === 3) {
    return (
      <div
        className={cn(
          "rounded-[1.75rem] p-8 text-center",
          embed ? "bg-white/95 shadow-lg" : "bg-white shadow-sm shadow-black/5",
        )}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Check className="size-7" />
        </div>
        <h3 className="mt-4 text-2xl font-medium text-[#1A2330]">
          Pendaftaran terkirim
        </h3>
        <p className="mt-2 text-sm text-[#8A96A8]">
          Terima kasih. Tim BabelKids akan menghubungi Anda setelah meninjau
          data. Kode:{" "}
          <span className="font-medium text-[#1A2330]">{doneId}</span>
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {embed ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-[var(--bk-sun)] px-5 py-3 text-sm font-bold text-[var(--bk-ink)]"
            >
              Daftar lagi
            </button>
          ) : (
            <Link
              href="/"
              className="rounded-full bg-[#2E7DFF] px-5 py-3 text-sm font-medium text-white"
            >
              Kembali ke beranda
            </Link>
          )}
          <Link
            href="/parents"
            className={cn(
              "rounded-full px-5 py-3 text-sm font-medium",
              embed
                ? "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                : "bg-[#EEF3FA] text-[#2E7DFF]",
            )}
          >
            Buka Parent App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-left">
      <div className="mb-4 flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step >= s
                ? embed
                  ? "bg-[var(--bk-sun)]"
                  : "bg-[#2E7DFF]"
                : embed
                  ? "bg-white/40"
                  : "bg-[#E5ECF5]",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "mb-4 text-xs font-medium",
          embed ? "text-[var(--bk-ink)]/60" : "text-[#8A96A8]",
        )}
      >
        Langkah {step} dari 2 · {step === 1 ? "Orang tua" : "Anak"}
      </p>

      {step === 1 ? (
        <form
          className={cn(
            "space-y-4",
            !embed &&
              "rounded-[1.75rem] bg-white p-5 shadow-sm shadow-black/5",
          )}
          onSubmit={(e) => {
            e.preventDefault();
            if (canParent) {
              setError("");
              setStep(2);
            } else setError("Lengkapi semua data orang tua / wali.");
          }}
        >
          {!embed ? (
            <div>
              <h2 className="text-lg font-medium text-[#1A2330]">
                Data orang tua / wali
              </h2>
              <p className="mt-1 text-xs text-[#8A96A8]">
                Isi data ibu & ayah (atau wali). Bisa ditambah hingga{" "}
                {MAX_PARENTS} orang.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--bk-ink)]/60">
              Data ibu & ayah · bisa ditambah
            </p>
          )}

          {parents.map((p, index) => (
            <div
              key={p.key}
              className={cn(
                "space-y-3 rounded-2xl p-3",
                embed ? "bg-white/50" : "bg-[#F7FAFD]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    embed ? "text-[var(--bk-ink)]/50" : "text-[#8A96A8]",
                  )}
                >
                  Orang tua {index + 1}
                </p>
                {parents.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeParent(p.key)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                    aria-label={`Hapus orang tua ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </button>
                ) : null}
              </div>
              <input
                required
                placeholder="Nama lengkap"
                className={input}
                value={p.name}
                onChange={(e) => updateParent(p.key, { name: e.target.value })}
              />
              <Select
                value={p.relationship}
                onChange={(v) =>
                  updateParent(p.key, {
                    relationship: v as RegistrationParent["relationship"],
                  })
                }
                options={[
                  { value: "mother", label: "Ibu" },
                  { value: "father", label: "Ayah" },
                  { value: "guardian", label: "Wali" },
                ]}
                className="[&_button]:rounded-2xl [&_button]:border-0 [&_button]:bg-white [&_button]:px-4 [&_button]:py-3.5"
              />
              <input
                required
                placeholder="No. HP / WhatsApp"
                className={input}
                value={p.phone}
                onChange={(e) => updateParent(p.key, { phone: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className={input}
                value={p.email}
                onChange={(e) => updateParent(p.key, { email: e.target.value })}
              />
              <textarea
                required
                placeholder="Alamat"
                rows={2}
                className={cn(input, "min-h-[72px] resize-none")}
                value={p.address}
                onChange={(e) =>
                  updateParent(p.key, { address: e.target.value })
                }
              />
              <input
                placeholder="Pekerjaan (opsional)"
                className={input}
                value={p.occupation}
                onChange={(e) =>
                  updateParent(p.key, { occupation: e.target.value })
                }
              />
            </div>
          ))}

          {parents.length < MAX_PARENTS ? (
            <button
              type="button"
              onClick={addParent}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed py-3 text-sm font-medium",
                embed
                  ? "border-[var(--bk-ink)]/20 text-[var(--bk-ink)]"
                  : "border-[#D5DEEA] text-[#2E7DFF] hover:bg-[#F3F7FC]",
              )}
            >
              <Plus className="size-4" />
              Tambah orang tua / wali
            </button>
          ) : null}

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button
            type="submit"
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition hover:scale-[1.02]",
              embed
                ? "bg-[var(--bk-sun)] text-[var(--bk-ink)] shadow-md"
                : "bg-[#2E7DFF] font-medium text-white",
            )}
          >
            Lanjut ke data anak <ChevronRight className="size-4" />
          </button>
        </form>
      ) : (
        <form
          className={cn(
            "space-y-3",
            !embed &&
              "rounded-[1.75rem] bg-white p-5 shadow-sm shadow-black/5",
          )}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {!embed ? (
            <h2 className="text-lg font-medium text-[#1A2330]">Data anak</h2>
          ) : null}
          <input
            required
            name="childName"
            placeholder="Nama lengkap anak"
            className={input}
            value={child.name}
            onChange={(e) =>
              setChild((c) => ({ ...c, name: e.target.value }))
            }
          />
          <input
            required
            name="nickname"
            placeholder="Nama panggilan"
            className={input}
            value={child.nickname}
            onChange={(e) =>
              setChild((c) => ({ ...c, nickname: e.target.value }))
            }
          />
          <input
            required
            type="date"
            name="dob"
            className={input}
            value={child.dateOfBirth}
            onChange={(e) =>
              setChild((c) => ({ ...c, dateOfBirth: e.target.value }))
            }
          />
          <Select
            value={child.gender}
            onChange={(v) =>
              setChild((c) => ({
                ...c,
                gender: v as "male" | "female",
              }))
            }
            options={[
              { value: "female", label: "Perempuan" },
              { value: "male", label: "Laki-laki" },
            ]}
            className="[&_button]:rounded-2xl [&_button]:border-0 [&_button]:bg-white [&_button]:px-4 [&_button]:py-3.5"
          />
          <Select
            value={child.preferredClassId}
            onChange={(v) =>
              setChild((c) => ({
                ...c,
                preferredClassId: v,
              }))
            }
            options={preschool.map((c) => ({
              value: c.id,
              label: `${c.name} · ${c.level} · ${c.ageMinYears}–${c.ageMaxYears} thn`,
            }))}
            className="[&_button]:rounded-2xl [&_button]:border-0 [&_button]:bg-white [&_button]:px-4 [&_button]:py-3.5"
          />
          <input
            name="allergies"
            placeholder="Alergi (opsional)"
            className={input}
            value={child.allergies}
            onChange={(e) =>
              setChild((c) => ({ ...c, allergies: e.target.value }))
            }
          />
          <textarea
            name="notes"
            placeholder="Catatan (opsional)"
            rows={2}
            className={cn(input, "min-h-[72px] resize-none")}
            value={child.notes}
            onChange={(e) =>
              setChild((c) => ({ ...c, notes: e.target.value }))
            }
          />
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(1);
              }}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-full py-3.5 text-sm font-medium",
                embed
                  ? "bg-white/70 text-[var(--bk-ink)]"
                  : "bg-[#EEF3FA] text-[#2E7DFF]",
              )}
            >
              <ChevronLeft className="size-4" /> Kembali
            </button>
            <button
              type="submit"
              className={cn(
                "flex-[1.4] rounded-full py-3.5 text-sm font-bold transition hover:scale-[1.02]",
                embed
                  ? "bg-[var(--bk-sun)] text-[var(--bk-ink)] shadow-md"
                  : "bg-[#2E7DFF] font-medium text-white",
              )}
            >
              Kirim pendaftaran
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
