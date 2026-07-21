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
        <p className="font-[family-name:var(--font-fredoka)] text-xl font-semibold">
          All caught up
        </p>
        <p className="text-sm text-neutral-500">
          No pending tuition for {selectedChild.nickname}.
        </p>
        <button
          type="button"
          onClick={() => router.push("/parents/tuition")}
          className="text-sm font-medium text-[#00B894]"
        >
          Back to history
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
          Submit payment
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {selectedChild.nickname} · upload proof for admin approval
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs text-neutral-500">{formatMonth(unpaid.month)}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#00B894]">
          {formatIDR(unpaid.amount)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Transfer to BCA 1234567890 a/n Yayasan BabelKids. Then upload your
          receipt below.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert(
            `Payment proof for ${selectedChild.nickname} submitted${fileName ? `: ${fileName}` : ""} (demo). Admin will review.`,
          );
          router.push("/parents/tuition");
        }}
      >
        <label className="block">
          <span className="text-xs font-medium text-neutral-500">
            Payment method
          </span>
          <select
            required
            className="mt-1 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm outline-none"
            defaultValue="transfer"
          >
            <option value="transfer">Transfer</option>
            <option value="tunai">Tunai (cash at school)</option>
            <option value="whatsapp">WhatsApp confirm</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500">
            Payment proof
          </span>
          <div className="mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#00B894]/30 bg-white px-4 py-10">
            <input
              type="file"
              accept="image/*,.pdf"
              required
              className="text-sm"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? (
              <p className="mt-2 text-xs text-neutral-600">{fileName}</p>
            ) : null}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500">
            Note (optional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Transfer from BCA, 02 Jul 10:15"
            className="mt-1 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-[#00B894] py-3.5 text-sm font-semibold text-white"
        >
          Submit for approval
        </button>
      </form>
    </div>
  );
}
