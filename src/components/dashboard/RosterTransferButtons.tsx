"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  exportStudentsPdf,
  exportTeachersPdf,
  type RosterExportKind,
} from "@/lib/roster-pdf";
import type { SchoolClass, Student, Teacher } from "@/lib/types";

export function RosterTransferButtons({
  kind,
  students,
  teachers,
  classes,
}: {
  kind: RosterExportKind;
  students?: Student[];
  teachers?: Teacher[];
  classes: SchoolClass[];
}) {
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    setBusy(true);
    try {
      if (kind === "students") {
        await exportStudentsPdf(students ?? [], classes);
      } else {
        await exportTeachersPdf(teachers ?? [], classes);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={busy}
      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E5ECF5] bg-white px-3.5 py-2 text-sm font-medium text-[#1F3A56] hover:bg-[#F3F7FC] disabled:opacity-60"
    >
      <Download className="size-4" />
      {busy ? "Menyiapkan PDF…" : "Ekspor PDF"}
    </button>
  );
}
