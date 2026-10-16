import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SchoolClass, Student, Teacher } from "@/lib/types";

const SCHOOL = {
  name: "BabelKids",
  tagline: "Taman Kanak-Kanak & Kelompok Bermain",
  address: "Pangkalpinang, Kepulauan Bangka Belitung",
  phone: "WhatsApp +62 812-1000-1001",
};

export type RosterExportKind = "students" | "teachers";

const INK = [26, 35, 48] as const;
const NAVY = [31, 58, 86] as const;
const MUTED = [91, 107, 124] as const;
const LINE = [197, 208, 220] as const;
const HEAD_BG = [234, 248, 255] as const;

function formatDateId(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function genderLabel(g: Student["gender"]) {
  return g === "male" ? "L" : "P";
}

function roleLabel(r: Teacher["role"]) {
  if (r === "owner") return "Kepala Sekolah";
  if (r === "admin") return "Admin";
  return "Guru";
}

function statusLabel(s: Student["status"]) {
  if (s === "active") return "Aktif";
  if (s === "inactive") return "Nonaktif";
  return "Alumni";
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawHeader(
  doc: jsPDF,
  title: string,
  count: number,
  logo: string | null,
) {
  const pageW = doc.internal.pageSize.getWidth();
  let x = 12;

  if (logo) {
    try {
      doc.addImage(logo, "PNG", x, 8, 16, 14);
      x = 32;
    } catch {
      /* ignore bad image */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(SCHOOL.name, x, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(SCHOOL.tagline, x, 19);
  doc.text(`${SCHOOL.address} · ${SCHOOL.phone}`, x, 23.5);

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Dokumen resmi", pageW - 12, 12, { align: "right" });
  doc.text(`Dicetak: ${todayLabel()}`, pageW - 12, 17, { align: "right" });
  doc.text(`${count} data`, pageW - 12, 22, { align: "right" });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.7);
  doc.line(12, 28, pageW - 12, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title.toUpperCase(), 12, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Daftar resmi administrasi sekolah · bersifat rahasia internal",
    12,
    41,
  );
}

function drawFooter(doc: jsPDF, kind: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.5);
    doc.line(12, pageH - 14, pageW - 12, pageH - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      `${SCHOOL.name} · ${kind} · Digenerate dari BabelKids Dashboard`,
      12,
      pageH - 9,
    );
    doc.text(
      `Halaman ${i} / ${pageCount} · © ${new Date().getFullYear()} BabelKids · Confidential`,
      pageW - 12,
      pageH - 9,
      { align: "right" },
    );
  }
}

function drawSignature(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const x = pageW - 70;
  const y = pageH - 42;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(`Pangkalpinang, ${todayLabel()}`, x, y, { align: "center" });
  doc.text("Mengetahui,", x, y + 5, { align: "center" });
  doc.setDrawColor(...INK);
  doc.line(x - 28, y + 22, x + 28, y + 22);
  doc.text("Kepala Sekolah", x, y + 27, { align: "center" });
}

export async function exportStudentsPdf(
  students: Student[],
  classes: SchoolClass[],
) {
  const className = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;

  const rows = students
    .slice()
    .sort((a, b) => {
      const ca = className(a.classId).localeCompare(className(b.classId));
      if (ca !== 0) return ca;
      return a.name.localeCompare(b.name);
    });

  const logo = await loadLogoDataUrl();
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  drawHeader(doc, "Daftar Siswa", rows.length, logo);

  const body = rows.map((s, i) => {
    const parents = s.parents
      .map((p) => {
        const rel =
          p.relationship === "mother"
            ? "Ibu"
            : p.relationship === "father"
              ? "Ayah"
              : "Wali";
        return `${p.name} (${rel})\n${p.phone}`;
      })
      .join("\n");

    const ttl = s.placeOfBirth
      ? `${s.placeOfBirth}\n${formatDateId(s.dateOfBirth)}`
      : formatDateId(s.dateOfBirth);

    const extra = (s.additionalContact || "—").replace(" · ", "\n");

    return [
      String(i + 1),
      s.name,
      genderLabel(s.gender),
      s.religion || "—",
      ttl,
      className(s.classId),
      statusLabel(s.status),
      parents || "—",
      extra,
      s.notes?.trim() || "—",
    ];
  });

  // A4 landscape usable width ≈ 297 - 16 = 281mm
  autoTable(doc, {
    startY: 44,
    head: [
      [
        "No",
        "Nama Lengkap",
        "JK",
        "Agama",
        "TTL",
        "Kelas",
        "Status",
        "Orang Tua / Wali",
        "Kontak tambahan",
        "Catatan",
      ],
    ],
    body,
    theme: "grid",
    styles: {
      fontSize: 6.5,
      cellPadding: { top: 1.2, right: 1.2, bottom: 1.2, left: 1.2 },
      textColor: [...INK],
      lineColor: [...LINE],
      lineWidth: 0.15,
      valign: "top",
      overflow: "linebreak",
      minCellHeight: 8,
    },
    headStyles: {
      fillColor: [...HEAD_BG],
      textColor: [...NAVY],
      fontStyle: "bold",
      fontSize: 6.5,
      valign: "middle",
    },
    alternateRowStyles: { fillColor: [247, 250, 253] },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 7,halign: "center" },
      3: { cellWidth: 14 },
      4: { cellWidth: 28 },
      5: { cellWidth: 18 },
      6: { cellWidth: 12,halign: "center" },
      7: { cellWidth: 48 },
      8: { cellWidth: 32 },
      9: { cellWidth: 20 },
    },
    margin: { left: 8, right: 8, top: 12, bottom: 36 },
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  drawSignature(doc);
  drawFooter(doc, "Data Siswa");
  doc.save(`babelkids-siswa-${stamp()}.pdf`);
}

export async function exportTeachersPdf(
  teachers: Teacher[],
  classes: SchoolClass[],
) {
  const rows = teachers.slice().sort((a, b) => a.name.localeCompare(b.name));
  const classFor = (teacherId: string) =>
    classes
      .filter((c) => c.teacherId === teacherId)
      .map((c) => c.name)
      .join(", ") || "—";

  const logo = await loadLogoDataUrl();
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  drawHeader(doc, "Daftar Guru & Staf", rows.length, logo);

  const body = rows.map((t, i) => [
    String(i + 1),
    t.name,
    roleLabel(t.role),
    t.jabatan || "—",
    t.email,
    t.phone,
    classFor(t.id),
    t.notes || "—",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "No",
        "Nama",
        "Peran",
        "Jabatan",
        "Email",
        "No. Telepon",
        "Wali Kelas",
        "Catatan",
      ],
    ],
    body,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 1.6,
      textColor: [...INK],
      lineColor: [...LINE],
      lineWidth: 0.2,
      valign: "top",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [...HEAD_BG],
      textColor: [...NAVY],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [247, 250, 253] },
    columnStyles: {
      0: { cellWidth: 8,halign: "center" },
      1: { cellWidth: 36 },
      2: { cellWidth: 22 },
      3: { cellWidth: 42 },
      4: { cellWidth: 44 },
      5: { cellWidth: 28 },
      6: { cellWidth: 28 },
      7: { cellWidth: "auto" },
    },
    margin: { left: 8, right: 8, top: 12, bottom: 36 },
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  drawSignature(doc);
  drawFooter(doc, "Data Guru & Staf");
  doc.save(`babelkids-guru-${stamp()}.pdf`);
}
