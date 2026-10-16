import { prisma } from "@/lib/db";
import { fromDateOnly, toDateOnly } from "@/lib/dates";
import { mapKas, mapTuition } from "@/lib/data/mappers";
import type { FinanceSummary, KasEntry, TuitionRecord } from "@/lib/types";

export async function listTuition(): Promise<TuitionRecord[]> {
  const rows = await prisma.tuitionRecord.findMany({
    orderBy: [{ month: "desc" }, { studentId: "asc" }],
  });
  return rows.map(mapTuition);
}

export async function upsertTuition(input: {
  id?: string;
  studentId: string;
  month: string;
  amount: number;
  status: TuitionRecord["status"];
  dueDate: string;
  paidAt?: string;
  paymentMethod?: TuitionRecord["paymentMethod"];
  proofUrl?: string;
  proofStatus?: TuitionRecord["proofStatus"];
  note?: string;
  recordedBy?: string;
}): Promise<TuitionRecord> {
  const data = {
    studentId: input.studentId,
    month: input.month,
    amount: input.amount,
    status: input.status,
    dueDate: fromDateOnly(input.dueDate),
    paidAt: input.paidAt ? new Date(input.paidAt) : null,
    paymentMethod: input.paymentMethod ?? null,
    proofUrl: input.proofUrl ?? null,
    proofStatus: input.proofStatus ?? null,
    note: input.note ?? null,
    recordedBy: input.recordedBy ?? null,
  };
  if (input.id) {
    return mapTuition(
      await prisma.tuitionRecord.update({ where: { id: input.id }, data }),
    );
  }
  return mapTuition(await prisma.tuitionRecord.create({ data }));
}

export async function listKas(): Promise<KasEntry[]> {
  const rows = await prisma.kasEntry.findMany({ orderBy: { date: "desc" } });
  return rows.map(mapKas);
}

export async function addKasEntry(input: {
  id?: string;
  date: string;
  type: KasEntry["type"];
  account: KasEntry["account"];
  source: KasEntry["source"];
  amount: number;
  note: string;
  recordedBy: string;
  tuitionId?: string;
}): Promise<KasEntry> {
  return mapKas(
    await prisma.kasEntry.create({
      data: {
        id: input.id,
        date: fromDateOnly(input.date),
        type: input.type,
        account: input.account,
        source: input.source,
        amount: input.amount,
        note: input.note,
        recordedBy: input.recordedBy,
        tuitionId: input.tuitionId ?? null,
      },
    }),
  );
}

export async function getFinanceSummaries(): Promise<FinanceSummary[]> {
  const [tuition, kas] = await Promise.all([listTuition(), listKas()]);
  const months = new Set<string>();
  for (const t of tuition) months.add(t.month);
  for (const k of kas) months.add(toDateOnly(k.date).slice(0, 7));

  return [...months]
    .sort()
    .reverse()
    .map((month) => {
      const tuitionCollected = tuition
        .filter((t) => t.month === month && t.status === "paid")
        .reduce((s, t) => s + t.amount, 0);
      const tuitionPending = tuition
        .filter(
          (t) =>
            t.month === month &&
            (t.status === "pending" ||
              t.status === "overdue" ||
              t.status === "submitted"),
        )
        .reduce((s, t) => s + t.amount, 0);
      const monthKas = kas.filter((k) => k.date.startsWith(month));
      const eventFees = monthKas
        .filter((k) => k.source === "event" && k.type === "in")
        .reduce((s, k) => s + k.amount, 0);
      const expenses = monthKas
        .filter((k) => k.type === "out")
        .reduce((s, k) => s + k.amount, 0);
      return {
        month,
        tuitionCollected,
        tuitionPending,
        eventFees,
        expenses,
      };
    });
}
