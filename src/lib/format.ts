import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string, pattern = "dd MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern, { locale: id });
  } catch {
    return iso;
  }
}

export function formatMonth(yyyyMm: string): string {
  try {
    return format(parseISO(`${yyyyMm}-01`), "MMMM yyyy", { locale: id });
  } catch {
    return yyyyMm;
  }
}

export function ageFromDob(dob: string): number {
  const birth = parseISO(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function paymentMethodLabel(method?: string): string {
  if (method === "tunai") return "Tunai";
  if (method === "whatsapp") return "WhatsApp";
  if (method === "transfer") return "Transfer";
  return "—";
}

export function presenceStatusLabel(status: string): string {
  if (status === "present") return "Hadir";
  if (status === "absent") return "Tidak hadir";
  if (status === "late") return "Terlambat";
  if (status === "excused") return "Izin / sakit";
  return status;
}

/** Soft cell colors for parents attendance calendar */
export function presenceStatusColor(status: string): {
  bg: string;
  text: string;
  dot: string;
} {
  if (status === "present")
    return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (status === "absent")
    return { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" };
  if (status === "late")
    return { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" };
  if (status === "excused")
    return { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500" };
  return { bg: "bg-[#EEF3FA]", text: "text-[#1A2330]", dot: "bg-[#A0AAB8]" };
}

export function tuitionStatusLabel(status: string): string {
  if (status === "paid") return "Lunas";
  if (status === "pending") return "Belum bayar";
  if (status === "overdue") return "Terlambat";
  if (status === "submitted") return "Menunggu review";
  return status;
}

/** Tunai → cash kas; transfer / WhatsApp → bank kas */
export function kasAccountFromPaymentMethod(
  method?: string,
): "cash" | "bank" {
  return method === "tunai" ? "cash" : "bank";
}

export function kasAccountLabel(account: "cash" | "bank"): string {
  return account === "cash" ? "Cash (tunai)" : "Bank";
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
