"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatIDR, formatMonth } from "@/lib/format";
import { tuitionRecords } from "@/lib/mock-data";

export default function ParentsPayPage() {
  const router = useRouter();
  const { selectedChildId, selectedChild } = useParentKids();
  const unpaid = tuitionRecords.find(
    (t) =>
      t.studentId === selectedChildId &&
      (t.status === "pending" || t.status === "overdue"),
  );
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  if (!unpaid) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-xl font-medium text-[#1F1F1F]">Sudah lunas</p>
        <p className="text-sm text-[#8A857C]">
          Tidak ada SPP tertunda untuk {selectedChild.nickname}.
        </p>
        <button
          type="button"
          onClick={() => router.push("/parents/tuition")}
          className="text-sm font-medium text-[#F28B4C]"
        >
          Kembali ke riwayat
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1F1F1F]">
          Kirim pembayaran
        </h1>
        <p className="mt-1 text-sm text-[#8A857C]">
          {selectedChild.nickname} · unggah bukti untuk disetujui admin
        </p>
      </div>

      <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
        <p className="text-xs text-[#8A857C]">{formatMonth(unpaid.month)}</p>
        <p className="mt-1 text-2xl font-medium tabular-nums text-[#F28B4C]">
          {formatIDR(unpaid.amount)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#8A857C]">
          Transfer ke BCA 1234567890 a/n Yayasan BabelKids. Lalu unggah bukti
          transfer di bawah.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert(
            `Bukti pembayaran untuk ${selectedChild.nickname} telah dikirim${fileName ? `: ${fileName}` : ""} (demo). Admin akan meninjau.`,
          );
          router.push("/parents/tuition");
        }}
      >
        <label className="block">
          <span className="text-xs font-medium text-[#8A857C]">
            Metode pembayaran
          </span>
          <select
            required
            className="mt-1 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm outline-none"
            defaultValue="transfer"
          >
            <option value="transfer">Transfer</option>
            <option value="tunai">Tunai (di sekolah)</option>
            <option value="whatsapp">Konfirmasi WhatsApp</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[#8A857C]">
            Bukti pembayaran
          </span>
          <div className="mt-1 flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-[#F28B4C]/35 bg-white px-4 py-10">
            <input
              type="file"
              accept="image/*,.pdf"
              required
              className="text-sm"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? (
              <p className="mt-2 text-xs text-[#8A857C]">{fileName}</p>
            ) : null}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[#8A857C]">
            Catatan (opsional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="cth. Transfer dari BCA, 02 Jul 10:15"
            className="mt-1 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-[1.5rem] bg-[#1C1C1C] py-3.5 text-sm font-medium text-white"
        >
          Kirim untuk disetujui
        </button>
      </form>
    </div>
  );
}
