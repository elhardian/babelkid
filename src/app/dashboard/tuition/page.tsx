"use client";

import { useMemo, useState } from "react";
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
import { StudentSearchSelect } from "@/components/dashboard/StudentSearchSelect";
import {
  formatDate,
  formatIDR,
  formatMonth,
  paymentMethodLabel,
  tuitionStatusLabel,
} from "@/lib/format";
import { getStudent, students, tuitionRecords as initial } from "@/lib/mock-data";
import type { PaymentMethod, TuitionRecord, TuitionStatus } from "@/lib/types";
import { useKas } from "@/components/dashboard/KasProvider";

const months = Array.from(new Set(initial.map((t) => t.month))).sort().reverse();

function toneFor(status: TuitionStatus) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  if (status === "submitted") return "warning" as const;
  return "info" as const;
}

type ModalMode = "record" | "edit" | "view" | "add" | null;

export default function TuitionPage() {
  const { postTuitionToKas } = useKas();
  const [rows, setRows] = useState<TuitionRecord[]>(initial);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(months[0] ?? "2026-07");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<TuitionRecord | null>(null);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState(2500000);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) => {
      if (t.month !== month) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (methodFilter !== "all" && t.paymentMethod !== methodFilter) return false;
      if (!q) return true;
      const student = getStudent(t.studentId);
      return student?.name.toLowerCase().includes(q) ?? false;
    });
  }, [rows, search, month, statusFilter, methodFilter]);

  const totals = useMemo(() => {
    const paid = filtered.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
    const outstanding = filtered.filter((t) => t.status !== "paid").reduce((s, t) => s + t.amount, 0);
    return { paid, outstanding };
  }, [filtered]);

  function approve(id: string) {
    const record = rows.find((t) => t.id === id);
    if (!record || record.status === "paid") return;
    const method = record.paymentMethod ?? "transfer";
    const paidAt = new Date().toISOString().slice(0, 10);
    const updated: TuitionRecord = {
      ...record,
      status: "paid",
      proofStatus: "approved",
      paidAt,
      paymentMethod: method,
    };
    setRows((prev) => prev.map((t) => (t.id === id ? updated : t)));
    postTuitionToKas(updated, method);
  }

  function saveRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const method = String(fd.get("paymentMethod")) as PaymentMethod;
    const sid = String(fd.get("studentId") || studentId || active?.studentId);
    const note = String(fd.get("note") || "");
    const paidAt = String(fd.get("paidAt") || new Date().toISOString().slice(0, 10));

    if (modal === "record" && active) {
      const updated: TuitionRecord = {
        ...active,
        status: "paid",
        paymentMethod: method,
        paidAt,
        note: note || active.note,
        proofStatus: "approved",
        recordedBy: "Maya Santoso",
      };
      setRows((prev) => prev.map((t) => (t.id === active.id ? updated : t)));
      postTuitionToKas(updated, method);
    } else if (modal === "edit" && active) {
      setRows((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? {
                ...t,
                amount,
                status: String(fd.get("status")) as TuitionStatus,
                paymentMethod: method || t.paymentMethod,
                note,
              }
            : t,
        ),
      );
    } else if (modal === "add") {
      if (!sid) return;
      const newMonth = String(fd.get("month") || month);
      const markPaid = Boolean(method);
      const created: TuitionRecord = {
        id: `tu${Date.now()}`,
        studentId: sid,
        month: newMonth,
        amount,
        status: markPaid ? "paid" : "pending",
        dueDate: `${newMonth}-05`,
        paidAt: markPaid ? paidAt : undefined,
        paymentMethod: method || undefined,
        proofStatus: markPaid ? "approved" : undefined,
        note,
        recordedBy: markPaid ? "Maya Santoso" : undefined,
      };
      setRows((prev) => [created, ...prev]);
      if (markPaid) postTuitionToKas(created, method);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SPP</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Biaya per siswa · transfer / tunai / WhatsApp
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActive(null);
            setStudentId("");
            setAmount(2500000);
            setModal("add");
          }}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-[#1A2330] hover:bg-neutral-800"
        >
          Tambah / catat pembayaran
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Terkumpul · {formatMonth(month)}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{formatIDR(totals.paid)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Belum lunas · {formatMonth(month)}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{formatIDR(totals.outstanding)}</p>
        </div>
      </div>

      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari siswa…">
        <FilterSelect
          label="Bulan"
          value={month}
          onChange={setMonth}
          options={months.map((m) => ({ value: m, label: formatMonth(m) }))}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "paid", label: "Lunas" },
            { value: "pending", label: "Belum bayar" },
            { value: "submitted", label: "Menunggu review" },
            { value: "overdue", label: "Terlambat" },
          ]}
        />
        <FilterSelect
          label="Metode"
          value={methodFilter}
          onChange={setMethodFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "transfer", label: "Transfer" },
            { value: "tunai", label: "Tunai" },
            { value: "whatsapp", label: "WhatsApp" },
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada data SPP untuk bulan ini." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Metode</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Bukti</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((t) => {
                const student = getStudent(t.studentId);
                return (
                  <tr key={t.id} className="hover:bg-neutral-50/80">
                    <td className="px-4 py-3 font-medium">{student?.name}</td>
                    <td className="px-4 py-3 tabular-nums">{formatIDR(t.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={tuitionStatusLabel(t.status)} tone={toneFor(t.status)} />
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-600 md:table-cell">
                      {paymentMethodLabel(t.paymentMethod)}
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-600 lg:table-cell">
                      {t.proofStatus === "approved"
                        ? "Disetujui"
                        : t.proofStatus === "pending"
                          ? "Menunggu"
                          : t.proofStatus === "rejected"
                            ? "Ditolak"
                            : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2 text-xs font-medium">
                        <button type="button" onClick={() => { setActive(t); setModal("view"); }} className="text-neutral-600 hover:text-neutral-900">
                          Lihat
                        </button>
                        <button type="button" onClick={() => { setActive(t); setAmount(t.amount); setModal("edit"); }} className="text-neutral-600 hover:text-neutral-900">
                          Edit
                        </button>
                        {t.status !== "paid" ? (
                          <button
                            type="button"
                            onClick={() => { setActive(t); setModal("record"); }}
                            className="text-neutral-900 underline-offset-2 hover:underline"
                          >
                            Catat bayar
                          </button>
                        ) : null}
                        {t.status === "submitted" ? (
                          <button type="button" onClick={() => approve(t.id)} className="text-neutral-900 underline-offset-2 hover:underline">
                            Setujui
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal === "record" || modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={
          modal === "record"
            ? "Catat pembayaran (tunai / WA / transfer)"
            : modal === "edit"
              ? "Edit SPP"
              : "Tambah SPP / pembayaran"
        }
      >
        <form onSubmit={saveRecord} className="space-y-3">
          {modal === "add" ? (
            <>
              <Field label="Siswa">
                <StudentSearchSelect
                  students={students.filter((s) => s.status === "active")}
                  value={studentId}
                  onChange={setStudentId}
                  required
                />
              </Field>
              <Field label="Bulan (YYYY-MM)">
                <input name="month" required defaultValue={month} className={inputClass} />
              </Field>
              <Field label="Jumlah">
                <CurrencyInput value={amount} onChange={setAmount} required />
              </Field>
            </>
          ) : null}

          {modal === "edit" && active ? (
            <>
              <p className="text-sm text-neutral-600">{getStudent(active.studentId)?.name}</p>
              <Field label="Jumlah">
                <CurrencyInput value={amount} onChange={setAmount} required />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={active.status} className={inputClass}>
                  <option value="paid">Lunas</option>
                  <option value="pending">Belum bayar</option>
                  <option value="submitted">Menunggu review</option>
                  <option value="overdue">Terlambat</option>
                </select>
              </Field>
            </>
          ) : null}

          {modal === "record" && active ? (
            <p className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
              {getStudent(active.studentId)?.name} · {formatMonth(active.month)} · {formatIDR(active.amount)}
            </p>
          ) : null}

          <Field label="Metode pembayaran">
            <select
              name="paymentMethod"
              required={modal === "record"}
              defaultValue={active?.paymentMethod ?? (modal === "record" ? "tunai" : "transfer")}
              className={inputClass}
            >
              <option value="transfer">Transfer</option>
              <option value="tunai">Tunai</option>
              <option value="whatsapp">WhatsApp (konfirmasi langsung)</option>
            </select>
          </Field>

          {(modal === "record" || modal === "add") ? (
            <Field label="Tanggal bayar">
              <input
                name="paidAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
            </Field>
          ) : null}

          <Field label="Catatan (mis. chat WA / kwitansi tunai)">
            <textarea
              name="note"
              rows={2}
              defaultValue={active?.note}
              placeholder="Bayar tunai di front desk / konfirmasi WA ke Bu Maya"
              className={inputClass}
            />
          </Field>

          <ModalActions
            onCancel={() => setModal(null)}
            submitLabel={modal === "record" ? "Tandai lunas" : "Simpan"}
          />
        </form>
      </Modal>

      <Modal open={modal === "view"} onClose={() => setModal(null)} title="Detail SPP">
        {active ? (
          <div className="space-y-3 text-sm">
            <p className="text-lg font-semibold">{getStudent(active.studentId)?.name}</p>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-xs text-neutral-500">Bulan</dt><dd>{formatMonth(active.month)}</dd></div>
              <div><dt className="text-xs text-neutral-500">Jumlah</dt><dd className="tabular-nums">{formatIDR(active.amount)}</dd></div>
              <div><dt className="text-xs text-neutral-500">Status</dt><dd>{tuitionStatusLabel(active.status)}</dd></div>
              <div><dt className="text-xs text-neutral-500">Metode</dt><dd>{paymentMethodLabel(active.paymentMethod)}</dd></div>
              <div><dt className="text-xs text-neutral-500">Jatuh tempo</dt><dd>{formatDate(active.dueDate)}</dd></div>
              <div><dt className="text-xs text-neutral-500">Dibayar</dt><dd>{active.paidAt ? formatDate(active.paidAt) : "—"}</dd></div>
              <div><dt className="text-xs text-neutral-500">Bukti</dt><dd>{active.proofStatus === "approved" ? "Disetujui" : active.proofStatus === "pending" ? "Menunggu" : active.proofStatus === "rejected" ? "Ditolak" : "—"}</dd></div>
              <div><dt className="text-xs text-neutral-500">Dicatat oleh</dt><dd>{active.recordedBy ?? "—"}</dd></div>
            </dl>
            {active.note ? <p className="rounded-md bg-neutral-50 p-3 text-neutral-700">{active.note}</p> : null}
            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
              <button type="button" onClick={() => setModal(null)} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">Tutup</button>
              {active.status !== "paid" ? (
                <button type="button" onClick={() => setModal("record")} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-[#1A2330]">
                  Catat pembayaran
                </button>
              ) : (
                <button type="button" onClick={() => { setAmount(active.amount); setModal("edit"); }} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-[#1A2330]">
                  Edit
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
