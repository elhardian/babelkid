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
import { useKas } from "@/components/dashboard/KasProvider";
import { formatDate, formatIDR } from "@/lib/format";
import type { KasAccount, KasEntry } from "@/lib/types";

const inflowSources = ["donation", "gift", "sponsor", "other"] as const;

const inflowSourceLabel: Record<(typeof inflowSources)[number], string> = {
  donation: "Donasi",
  gift: "Hadiah",
  sponsor: "Sponsor",
  other: "Lainnya",
};

const kasSourceLabel: Record<string, string> = {
  tuition: "SPP",
  event: "Acara",
  donation: "Donasi",
  gift: "Hadiah",
  sponsor: "Sponsor",
  expense: "Pengeluaran",
  other: "Lainnya",
};

type ModalMode = "in" | "out" | null;

export default function KasPage() {
  const { entries, balances, addEntry } = useKas();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState<KasAccount>("bank");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
        if (accountFilter !== "all" && e.account !== accountFilter) return false;
        if (!q) return true;
        return (
          e.note.toLowerCase().includes(q) ||
          e.source.includes(q) ||
          e.account.includes(q) ||
          e.recordedBy.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, search, sourceFilter, accountFilter]);

  const scoped = useMemo(() => {
    if (accountFilter === "all") return entries;
    return entries.filter((e) => e.account === accountFilter);
  }, [entries, accountFilter]);

  const totalIn = scoped
    .filter((e) => e.type === "in")
    .reduce((s, e) => s + e.amount, 0);
  const totalOut = scoped
    .filter((e) => e.type === "out")
    .reduce((s, e) => s + e.amount, 0);

  function openIn() {
    setAmount(0);
    setAccount("bank");
    setModal("in");
  }

  function openOut() {
    setAmount(0);
    setAccount("cash");
    setModal("out");
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount <= 0) return;
    const fd = new FormData(e.currentTarget);
    addEntry({
      date: String(fd.get("date") || new Date().toISOString().slice(0, 10)),
      type: modal === "out" ? "out" : "in",
      account,
      source:
        modal === "out"
          ? "expense"
          : ((String(fd.get("source")) as KasEntry["source"]) || "other"),
      amount,
      note: String(fd.get("note") || ""),
      recordedBy: "Maya Santoso",
    });
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Saldo tunai dan bank terpisah · SPP masuk ke sini setelah disetujui
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openOut}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Catat pengeluaran
          </button>
          <button
            type="button"
            onClick={openIn}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-[#1A2330] hover:bg-neutral-800"
          >
            Tambah saldo
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Tunai
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatIDR(balances.cash)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Bank
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatIDR(balances.bank)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Total masuk
            {accountFilter !== "all" ? ` · ${accountFilter === "cash" ? "tunai" : "bank"}` : ""}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">
            {formatIDR(totalIn)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Total keluar
            {accountFilter !== "all" ? ` · ${accountFilter === "cash" ? "tunai" : "bank"}` : ""}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-rose-700">
            {formatIDR(totalOut)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Total gabungan:{" "}
        <span className="font-semibold tabular-nums text-neutral-900">
          {formatIDR(balances.total)}
        </span>
        <span className="text-neutral-400">
          {" "}
          · Pembayaran tunai → Tunai · Transfer / WhatsApp → Bank
        </span>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari catatan atau sumber…"
      >
        <FilterSelect
          label="Akun"
          value={accountFilter}
          onChange={setAccountFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "cash", label: "Tunai" },
            { value: "bank", label: "Bank" },
          ]}
        />
        <FilterSelect
          label="Sumber"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "tuition", label: "SPP" },
            { value: "event", label: "Acara" },
            { value: "donation", label: "Donasi" },
            { value: "gift", label: "Hadiah" },
            { value: "sponsor", label: "Sponsor" },
            { value: "expense", label: "Pengeluaran" },
            { value: "other", label: "Lainnya" },
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada entri kas yang cocok dengan filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Akun</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Sumber</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Catatan</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50/80">
                  <td className="px-4 py-3 tabular-nums">{formatDate(e.date)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StatusBadge
                      label={e.account === "cash" ? "Tunai" : "Bank"}
                      tone={e.account === "cash" ? "warning" : "info"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={e.type === "in" ? "Masuk" : "Keluar"}
                      tone={e.type === "in" ? "success" : "danger"}
                    />
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                    {kasSourceLabel[e.source] ?? e.source}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium tabular-nums ${
                      e.type === "in" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {e.type === "in" ? "+" : "−"}
                    {formatIDR(e.amount)}
                  </td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-neutral-600 md:table-cell">
                    {e.note}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 lg:table-cell">
                    {e.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal === "in"}
        onClose={() => setModal(null)}
        title="Tambah saldo (pemasukan)"
      >
        <form onSubmit={save} className="space-y-3">
          <Field label="Akun">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "cash", label: "Tunai" },
                  { value: "bank", label: "Bank" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccount(opt.value)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-medium transition ${
                    account === opt.value
                      ? "border-neutral-900 bg-neutral-900 text-[#1A2330]"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Sumber">
            <select name="source" required className={inputClass} defaultValue="donation">
              {inflowSources.map((s) => (
                <option key={s} value={s}>
                  {inflowSourceLabel[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jumlah">
            <CurrencyInput value={amount} onChange={setAmount} required />
          </Field>
          <Field label="Tanggal">
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
          <Field label="Catatan">
            <textarea
              name="note"
              rows={2}
              required
              placeholder="mis. Donasi orang tua / hadiah tunai"
              className={inputClass}
            />
          </Field>
          <ModalActions onCancel={() => setModal(null)} submitLabel="Tambah" />
        </form>
      </Modal>

      <Modal
        open={modal === "out"}
        onClose={() => setModal(null)}
        title="Catat pengeluaran"
      >
        <form onSubmit={save} className="space-y-3">
          <Field label="Dari akun">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "cash", label: "Tunai" },
                  { value: "bank", label: "Bank" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccount(opt.value)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-medium transition ${
                    account === opt.value
                      ? "border-neutral-900 bg-neutral-900 text-[#1A2330]"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Jumlah">
            <CurrencyInput value={amount} onChange={setAmount} required />
          </Field>
          <Field label="Tanggal">
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
          <Field label="Catatan">
            <textarea
              name="note"
              rows={2}
              required
              placeholder="mis. Perlengkapan minggu seni"
              className={inputClass}
            />
          </Field>
          <ModalActions onCancel={() => setModal(null)} submitLabel="Catat" />
        </form>
      </Modal>
    </div>
  );
}
