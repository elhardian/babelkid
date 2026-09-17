"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRegistrations } from "@/components/dashboard/RegistrationProvider";
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
import { classes, getClass } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { RegistrationStatus } from "@/lib/types";

const statusTone: Record<
  RegistrationStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending: "warning",
  reviewing: "info",
  approved: "success",
  rejected: "danger",
};

const statusLabel: Record<RegistrationStatus, string> = {
  pending: "Menunggu",
  reviewing: "Direview",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

export default function DashboardRegistrationPage() {
  const { applications, updateStatus, pendingCount, submit } =
    useRegistrations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const preschool = useMemo(
    () =>
      classes.filter(
        (c) => c.level === "preschool" || c.level === "kindergarten",
      ),
    [],
  );

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (!q) return true;
      return (
        a.parent.name.toLowerCase().includes(q) ||
        a.child.name.toLowerCase().includes(q) ||
        a.child.nickname.toLowerCase().includes(q) ||
        a.parent.email.toLowerCase().includes(q)
      );
    });
  }, [applications, search, status]);

  function onAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submit({
      parent: {
        name: String(fd.get("parentName") || "").trim(),
        relationship: String(fd.get("relationship") || "mother") as
          | "mother"
          | "father"
          | "guardian",
        phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        occupation:
          String(fd.get("occupation") || "").trim() || undefined,
      },
      child: {
        name: String(fd.get("childName") || "").trim(),
        nickname: String(fd.get("nickname") || "").trim(),
        dateOfBirth: String(fd.get("dateOfBirth") || ""),
        gender: String(fd.get("gender") || "female") as "male" | "female",
        preferredClassId:
          String(fd.get("preferredClassId") || "").trim() || undefined,
        allergies: String(fd.get("allergies") || "").trim() || undefined,
        notes: String(fd.get("notes") || "").trim() || undefined,
      },
    });
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Pendaftaran
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Formulir dari website & input staf · {pendingCount} menunggu
            tindakan
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
        >
          <Plus className="size-4" />
          Tambah pendaftaran
        </button>
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
          options={[
            { value: "all", label: "Semua" },
            { value: "pending", label: "Menunggu" },
            { value: "reviewing", label: "Direview" },
            { value: "approved", label: "Disetujui" },
            { value: "rejected", label: "Ditolak" },
          ]}
        />
      </SearchFilterBar>

      <ul className="space-y-3">
        {list.map((a) => {
          const open = openId === a.id;
          const cls = a.child.preferredClassId
            ? getClass(a.child.preferredClassId)
            : undefined;
          return (
            <li
              key={a.id}
              className="overflow-hidden rounded-2xl border border-[#E5ECF5] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : a.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
              >
                <div>
                  <p className="font-medium text-[#1A2330]">
                    {a.child.nickname}{" "}
                    <span className="font-normal text-[#8A96A8]">
                      ({a.child.name})
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    Ortu: {a.parent.name} ·{" "}
                    {formatDate(a.submittedAt.slice(0, 10))}
                    {cls ? ` · ${cls.name}` : ""}
                  </p>
                </div>
                <StatusBadge
                  label={statusLabel[a.status]}
                  tone={statusTone[a.status]}
                />
              </button>

              {open ? (
                <div className="border-t border-[#EEF3FA] bg-[#F7FAFD] px-4 py-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Orang tua
                      </p>
                      <p className="mt-1 font-medium text-[#1A2330]">
                        {a.parent.name}
                      </p>
                      <p className="text-[#5B6B7C]">
                        {relLabel[a.parent.relationship] ??
                          a.parent.relationship}{" "}
                        · {a.parent.phone}
                      </p>
                      <p className="text-[#5B6B7C]">{a.parent.email}</p>
                      <p className="mt-1 text-[#5B6B7C]">{a.parent.address}</p>
                      {a.parent.occupation ? (
                        <p className="text-[#8A96A8]">
                          {a.parent.occupation}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Anak
                      </p>
                      <p className="mt-1 font-medium text-[#1A2330]">
                        {a.child.name} · {a.child.nickname}
                      </p>
                      <p className="text-[#5B6B7C]">
                        Lahir {formatDate(a.child.dateOfBirth)} ·{" "}
                        {a.child.gender === "female"
                          ? "Perempuan"
                          : "Laki-laki"}
                      </p>
                      {cls ? (
                        <p className="text-[#5B6B7C]">Kelas: {cls.name}</p>
                      ) : null}
                      {a.child.allergies ? (
                        <p className="text-rose-600">
                          Alergi: {a.child.allergies}
                        </p>
                      ) : null}
                      {a.child.notes ? (
                        <p className="mt-1 text-[#5B6B7C]">{a.child.notes}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "reviewing")}
                      className="rounded-xl bg-[#EEF3FA] px-3 py-2 text-xs font-medium text-[#2E7DFF]"
                    >
                      Tandai review
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "approved")}
                      className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-700"
                    >
                      Setujui
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "rejected")}
                      className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-700"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
        {list.length === 0 ? (
          <EmptyState message="Belum ada pendaftaran" />
        ) : null}
      </ul>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah pendaftaran"
        wide
      >
        <form onSubmit={onAddSubmit} className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
            Orang tua / wali
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama lengkap">
              <input name="parentName" className={inputClass} required />
            </Field>
            <Field label="Hubungan">
              <select
                name="relationship"
                className={inputClass}
                defaultValue="mother"
              >
                <option value="mother">Ibu</option>
                <option value="father">Ayah</option>
                <option value="guardian">Wali</option>
              </select>
            </Field>
            <Field label="No. HP / WhatsApp">
              <input name="phone" className={inputClass} required />
            </Field>
            <Field label="Email">
              <input
                type="email"
                name="email"
                className={inputClass}
                required
              />
            </Field>
          </div>
          <Field label="Alamat">
            <textarea
              name="address"
              className={`${inputClass} min-h-[72px]`}
              required
            />
          </Field>
          <Field label="Pekerjaan (opsional)">
            <input name="occupation" className={inputClass} />
          </Field>

          <p className="pt-2 text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
            Anak
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama lengkap">
              <input name="childName" className={inputClass} required />
            </Field>
            <Field label="Nama panggilan">
              <input name="nickname" className={inputClass} required />
            </Field>
            <Field label="Tanggal lahir">
              <input
                type="date"
                name="dateOfBirth"
                className={inputClass}
                required
              />
            </Field>
            <Field label="Jenis kelamin">
              <select
                name="gender"
                className={inputClass}
                defaultValue="female"
              >
                <option value="female">Perempuan</option>
                <option value="male">Laki-laki</option>
              </select>
            </Field>
            <Field label="Kelas pilihan">
              <select
                name="preferredClassId"
                className={inputClass}
                defaultValue={preschool[0]?.id ?? ""}
              >
                {preschool.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.level}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Alergi (opsional)">
              <input name="allergies" className={inputClass} />
            </Field>
          </div>
          <Field label="Catatan (opsional)">
            <textarea
              name="notes"
              className={`${inputClass} min-h-[64px]`}
            />
          </Field>
          <ModalActions
            onCancel={() => setAddOpen(false)}
            submitLabel="Simpan pendaftaran"
          />
        </form>
      </Modal>
    </div>
  );
}
