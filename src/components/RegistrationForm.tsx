"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { submitRegistration } from "@/components/dashboard/RegistrationProvider";
import { classes } from "@/lib/mock-data";
import { cn } from "@/lib/format";

type Step = 1 | 2 | 3;

const emptyParent = {
  name: "",
  relationship: "mother" as const,
  phone: "",
  email: "",
  address: "",
  occupation: "",
};

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

export function RegistrationForm({
  variant = "page",
}: {
  variant?: "page" | "embed";
}) {
  const [step, setStep] = useState<Step>(1);
  const [parent, setParent] = useState(emptyParent);
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

  const canParent =
    parent.name.trim() &&
    parent.phone.trim() &&
    parent.email.trim() &&
    parent.address.trim();

  const canChild =
    child.name.trim() &&
    child.nickname.trim() &&
    child.dateOfBirth.trim();

  const input = variant === "embed" ? fieldClassEmbed : fieldClass;
  const embed = variant === "embed";

  function submit() {
    setError("");
    if (!canParent || !canChild) {
      setError("Lengkapi data orang tua dan anak terlebih dahulu.");
      return;
    }
    const row = submitRegistration({
      parent: {
        name: parent.name.trim(),
        relationship: parent.relationship,
        phone: parent.phone.trim(),
        email: parent.email.trim(),
        address: parent.address.trim(),
        occupation: parent.occupation.trim() || undefined,
      },
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
              onClick={() => {
                setDoneId(null);
                setStep(1);
                setParent(emptyParent);
                setChild(emptyChild);
                setError("");
              }}
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
            "space-y-3",
            !embed &&
              "rounded-[1.75rem] bg-white p-5 shadow-sm shadow-black/5",
          )}
          onSubmit={(e) => {
            e.preventDefault();
            if (canParent) {
              setError("");
              setStep(2);
            } else setError("Lengkapi data orang tua.");
          }}
        >
          {!embed ? (
            <h2 className="text-lg font-medium text-[#1A2330]">
              Data orang tua / wali
            </h2>
          ) : null}
          <input
            required
            name="parentName"
            placeholder="Nama lengkap orang tua"
            className={input}
            value={parent.name}
            onChange={(e) =>
              setParent((p) => ({ ...p, name: e.target.value }))
            }
          />
          <select
            className={input}
            value={parent.relationship}
            onChange={(e) =>
              setParent((p) => ({
                ...p,
                relationship: e.target.value as typeof p.relationship,
              }))
            }
          >
            <option value="mother">Ibu</option>
            <option value="father">Ayah</option>
            <option value="guardian">Wali</option>
          </select>
          <input
            required
            name="phone"
            placeholder="No. HP / WhatsApp"
            className={input}
            value={parent.phone}
            onChange={(e) =>
              setParent((p) => ({ ...p, phone: e.target.value }))
            }
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className={input}
            value={parent.email}
            onChange={(e) =>
              setParent((p) => ({ ...p, email: e.target.value }))
            }
          />
          <textarea
            required
            name="address"
            placeholder="Alamat"
            rows={2}
            className={cn(input, "min-h-[72px] resize-none")}
            value={parent.address}
            onChange={(e) =>
              setParent((p) => ({ ...p, address: e.target.value }))
            }
          />
          <input
            name="occupation"
            placeholder="Pekerjaan (opsional)"
            className={input}
            value={parent.occupation}
            onChange={(e) =>
              setParent((p) => ({ ...p, occupation: e.target.value }))
            }
          />
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
          <select
            className={input}
            value={child.gender}
            onChange={(e) =>
              setChild((c) => ({
                ...c,
                gender: e.target.value as "male" | "female",
              }))
            }
          >
            <option value="female">Perempuan</option>
            <option value="male">Laki-laki</option>
          </select>
          <select
            className={input}
            value={child.preferredClassId}
            onChange={(e) =>
              setChild((c) => ({
                ...c,
                preferredClassId: e.target.value,
              }))
            }
          >
            {preschool.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.level}
              </option>
            ))}
          </select>
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
