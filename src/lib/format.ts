import { format, parseISO } from "date-fns";

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string, pattern = "dd MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function formatMonth(yyyyMm: string): string {
  try {
    return format(parseISO(`${yyyyMm}-01`), "MMMM yyyy");
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
