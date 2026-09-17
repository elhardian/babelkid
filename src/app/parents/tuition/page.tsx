"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { ParentsKidsRow } from "@/components/parents/ParentsKidsRow";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import {
  formatDate,
  formatIDR,
  formatMonth,
  paymentMethodLabel,
  todayISO,
  tuitionStatusLabel,
} from "@/lib/format";
import { tuitionRecords } from "@/lib/mock-data";
import type { TuitionRecord } from "@/lib/types";

function ProofModal({
  record,
  onClose,
}: {
  record: TuitionRecord | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [record, onClose]);

  if (!record?.proofUrl || !mounted) return null;

  const proofLabel =
    record.proofStatus === "approved"
      ? "Disetujui"
      : record.proofStatus === "pending"
        ? "Menunggu review"
        : record.proofStatus ?? "—";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:py-8">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2330]/55 backdrop-blur-sm"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-modal-title"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        style={{ maxHeight: "min(82vh, 640px)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#EEF3FA] px-4 py-3">
          <div className="min-w-0 pr-2">
            <h2
              id="proof-modal-title"
              className="text-base font-medium text-[#1A2330]"
            >
              Bukti pembayaran
            </h2>
            <p className="truncate text-xs text-[#8A96A8]">
              {formatMonth(record.month)} · {formatIDR(record.amount)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-[#8A96A8] hover:bg-[#F3F7FC]"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="relative mx-auto h-[min(48vh,380px)] w-full overflow-hidden rounded-2xl bg-[#F3F7FC]">
            <Image
              src={record.proofUrl}
              alt={`Bukti ${formatMonth(record.month)}`}
              fill
              className="object-contain"
              sizes="400px"
              priority
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-[#EEF3FA] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-xs text-[#8A96A8]">
            Status bukti:{" "}
            <span className="font-medium text-[#1A2330]">{proofLabel}</span>
            {record.paymentMethod
              ? ` · ${paymentMethodLabel(record.paymentMethod)}`
              : ""}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ParentsTuitionPage() {
  const { selectedChildId, selectedChild } = useParentKids();
  const [year, setYear] = useState(() => Number(todayISO().slice(0, 4)));
  const [proofRecord, setProofRecord] = useState<TuitionRecord | null>(null);

  const all = useMemo(
    () =>
      tuitionRecords
        .filter((t) => t.studentId === selectedChildId)
        .sort((a, b) => b.month.localeCompare(a.month)),
    [selectedChildId],
  );

  const filtered = useMemo(
    () => all.filter((t) => t.month.startsWith(String(year))),
    [all, year],
  );

  const statusStyle = (status: string) => {
    if (status === "paid") return "bg-emerald-500/15 text-emerald-700";
    if (status === "overdue") return "bg-rose-500/15 text-rose-700";
    if (status === "submitted") return "bg-amber-500/15 text-amber-800";
    return "bg-[#EEF3FA] text-[#2E7DFF]";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          SPP
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Riwayat pembayaran · dicatat oleh staf sekolah ·{" "}
          {selectedChild.nickname}
        </p>
      </div>

      <ParentsKidsRow />

      <div className="flex items-center justify-between rounded-[1.5rem] bg-white px-2 py-2 shadow-sm shadow-black/5">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Tahun sebelumnya"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-base font-medium text-[#1A2330]">{year}</p>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Tahun berikutnya"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <ul className="space-y-2.5">
        {filtered.map((t) => {
          const hasProof = Boolean(t.proofUrl);

          return (
            <li
              key={t.id}
              className="rounded-[1.5rem] bg-white p-4 shadow-sm shadow-black/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1A2330]">
                    {formatMonth(t.month)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    Jatuh tempo {formatDate(t.dueDate)}
                    {t.paidAt ? ` · Dibayar ${formatDate(t.paidAt)}` : ""}
                    {t.paymentMethod
                      ? ` · ${paymentMethodLabel(t.paymentMethod)}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium tabular-nums text-[#1A2330]">
                    {formatIDR(t.amount)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle(t.status)}`}
                  >
                    {tuitionStatusLabel(t.status)}
                  </span>
                </div>
              </div>
              {t.note ? (
                <p className="mt-2 text-xs text-[#8A96A8]">{t.note}</p>
              ) : null}

              {hasProof ? (
                <button
                  type="button"
                  onClick={() => setProofRecord(t)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#2E7DFF]"
                >
                  <Eye className="size-3.5" />
                  Lihat bukti bayar
                </button>
              ) : t.status === "paid" || t.status === "submitted" ? (
                <p className="mt-3 text-xs text-[#8A96A8]">Tidak ada foto bukti</p>
              ) : null}
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="rounded-[1.5rem] bg-white py-10 text-center text-sm text-[#8A96A8] shadow-sm">
            Belum ada data SPP untuk tahun {year}
          </li>
        ) : null}
      </ul>

      <ProofModal
        record={proofRecord}
        onClose={() => setProofRecord(null)}
      />
    </div>
  );
}
