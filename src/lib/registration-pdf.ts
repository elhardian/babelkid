import type { RegistrationApplication, RegistrationDetailedForm } from "@/lib/types";
import { autofillDetailedForm } from "@/lib/registration-form";

function esc(s: string | undefined | null) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function line(label: string, value: string, bilingual?: string) {
  return `
    <div class="field">
      <div class="label">☑ ${esc(label)}${bilingual ? ` <span class="bi">(${esc(bilingual)})</span>` : ""}</div>
      <div class="value">${esc(value) || "&nbsp;"}</div>
    </div>`;
}

function check(label: string, on: boolean) {
  return `<span class="chk">${on ? "☑" : "☐"} ${esc(label)}</span>`;
}

function adultBlock(
  title: string,
  a: RegistrationDetailedForm["father"],
) {
  return `
    <h3>${esc(title)}</h3>
    ${line("Name (Nama)", a.name)}
    ${line("Home Address (Alamat)", a.homeAddress)}
    <div class="row3">
      ${line("E-mail", a.email)}
      ${line("Home Phone", a.homePhone)}
      ${line("Cell Phone", a.cellPhone)}
    </div>
    ${line("Occupation (Pekerjaan)", a.occupation)}
    ${line("Business Name (Nama Perusahaan)", a.businessName)}
    ${line("Office Address (Alamat Kantor)", a.officeAddress)}
    ${line("Business Telephone (Telpon Kantor)", a.businessPhone)}
  `;
}

export function buildRegistrationPrintHtml(
  app: RegistrationApplication,
): string {
  const f = app.detailedForm ?? autofillDetailedForm(app);
  const s = f.student;
  const sexF = s.gender === "female";
  const sexM = s.gender === "male";
  const ms = f.maritalStatus;

  const signature = f.signatureDataUrl
    ? `<img class="sig" src="${f.signatureDataUrl}" alt="Signature" />`
    : `<div class="sig-line"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Registration Form · ${esc(s.fullName || app.child.name)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, Georgia, serif;
    font-size: 11pt;
    color: #111;
    line-height: 1.35;
    margin: 0;
    padding: 0;
  }
  .sheet { max-width: 800px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 14px; }
  .header .school { font-size: 16pt; font-weight: 700; letter-spacing: 0.02em; }
  .header .addr { font-size: 9.5pt; margin-top: 4px; }
  .header .title {
    margin-top: 12px;
    font-size: 14pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 2px solid #111;
    padding-bottom: 6px;
  }
  h2 {
    font-size: 11.5pt;
    margin: 16px 0 8px;
    border-bottom: 1px solid #333;
    padding-bottom: 3px;
    text-transform: uppercase;
  }
  h3 { font-size: 11pt; margin: 10px 0 6px; }
  .meta { font-size: 9pt; color: #444; margin-top: 4px; }
  .please { float: right; font-size: 9pt; font-style: italic; font-weight: normal; text-transform: none; }
  .field { margin: 5px 0 7px; }
  .label { font-size: 10pt; }
  .bi { font-size: 9pt; color: #444; font-weight: normal; }
  .value {
    border-bottom: 1px solid #333;
    min-height: 1.15em;
    padding: 2px 4px 1px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .chk { margin-right: 14px; white-space: nowrap; }
  .note {
    font-size: 9.5pt;
    margin: 8px 0;
    padding: 8px;
    border: 1px solid #999;
    background: #fafafa;
  }
  .decl { margin-top: 8px; font-size: 10pt; }
  .sign-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 28px;
    text-align: center;
  }
  .sig {
    max-height: 72px;
    max-width: 100%;
    display: block;
    margin: 0 auto 6px;
  }
  .sig-line {
    border-bottom: 1px solid #111;
    height: 48px;
    margin-bottom: 6px;
  }
  .cap { font-size: 9pt; }
  .footer {
    margin-top: 18px;
    font-size: 8.5pt;
    color: #666;
    text-align: center;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  .toolbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 10px 12px; background: #F3F7FC; border-bottom: 1px solid #E5ECF5;
  }
  .toolbar button {
    font-family: system-ui, sans-serif;
    border: 0; border-radius: 999px; padding: 8px 14px; cursor: pointer;
    font-size: 13px; font-weight: 600;
  }
  .toolbar .primary { background: #2E7DFF; color: #fff; }
  .toolbar .ghost { background: #fff; color: #1A2330; border: 1px solid #E5ECF5; }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="ghost" type="button" onclick="window.close()">Tutup</button>
    <button class="primary" type="button" onclick="window.print()">Unduh / Cetak PDF</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div class="school">BabelKids</div>
      <div class="addr">
        Jl. JK. Hasan Basri Sulaiman (Jl. Balai) No.97 Pangkalpinang, Bangka<br/>
        ☎ 0717 – 431640 · E-mail/IG : babelkids@gmail.com / Tkbabel_kids
      </div>
      <div class="title">Registration Form</div>
      <div class="meta">Ref: ${esc(app.id)} · Submitted ${esc(app.detailedFormSubmittedAt?.slice(0, 10) || app.submittedAt.slice(0, 10))}</div>
    </div>

    <h2>Student Information <span class="please">Please Print</span></h2>
    ${line("Full Name", s.fullName, "Nama lengkap")}
    <div class="row2">
      ${line("Nickname", s.nickname, "Nama panggilan")}
      ${line("T-shirt size", s.tshirtSize, "Ukuran kaos · child size")}
    </div>
    <div class="row2">
      <div class="field">
        <div class="label">☑ Sex <span class="bi">(Jenis kelamin)</span></div>
        <div class="value">${check("F", sexF)} ${check("M", sexM)}</div>
      </div>
      <div class="field">
        <div class="label">☑ Place, Date of Birth <span class="bi">(Tempat, tanggal lahir)</span></div>
        <div class="value">${esc(s.placeOfBirth)} / ${esc(s.dateOfBirth)}</div>
      </div>
    </div>
    ${line("Home Address", s.homeAddress, "Alamat rumah")}
    <div class="row2">
      ${line("Home Phone", s.homePhone, "No. Telpon Rumah")}
      ${line("Cell Phone", s.cellPhone, "No. Handphone")}
    </div>

    <h2>Parent / Guardian Information <span class="please">Please Print</span></h2>
    <div class="field">
      <div class="label">☑ Marital Status of Parents <span class="bi">(Status pernikahan orangtua)</span></div>
      <div class="value">
        ${check("Married (menikah)", ms === "married")}
        ${check("Separated (berpisah)", ms === "separated")}
        ${check("Divorced (bercerai)", ms === "divorced")}
      </div>
    </div>
    ${line(
      "If divorced/separated, who has legal custody?",
      f.custodyNote,
      "Hak asuh",
    )}
    ${adultBlock("Father / Guardian:", f.father)}
    ${adultBlock("Mother / Guardian:", f.mother)}

    <h2>Alternate Adult Available in Emergency</h2>
    ${line("Name (Nama)", f.emergency.name)}
    ${line("Home Address (Alamat)", f.emergency.homeAddress)}
    <div class="row3">
      ${line("E-mail", f.emergency.email)}
      ${line("Home Phone", f.emergency.homePhone)}
      ${line("Cell Phone", f.emergency.cellPhone)}
    </div>
    ${line("Relationship (Hubungan Kekerabatan)", f.emergency.relationship)}
    <p class="note">Child will not be released to anyone other than the above without consent of parent or guardian.</p>

    <h2>Child Important Information <span class="please">Please Print</span></h2>
    ${line("Does your child have any fears that we should be aware of?", f.childInfo.fears, "Ketakutan tertentu")}
    ${line("Other members in the household", f.childInfo.householdMembers, "Anggota keluarga lain")}
    ${line("Does your child play with other children at home? Please describe!", f.childInfo.playsWithOthers)}
    ${line("Does your child have an Imaginary Friend?", f.childInfo.imaginaryFriend)}
    ${line("Your child's habits (favourite blanket, toy, thumb sucking etc?)", f.childInfo.habits)}
    ${line("Behaviour difficulties (tantrums, biting, kicking, hitting, etc.?)", f.childInfo.behaviourDifficulties)}
    ${line("Does your child have any pets? Names and types:", f.childInfo.pets)}
    ${line("Languages spoken at home:", f.childInfo.languages)}
    ${line("Does your child have any speech difficulties?", f.childInfo.speechDifficulties)}
    ${line("Allergies, food restrictions or health problems?", f.childInfo.allergiesHealth)}
    ${line("Has your child been away from parents? Reactions:", f.childInfo.beenAwayFromParents)}
    ${line("What do you as parents want your child to get out of Preschool?", f.childInfo.preschoolGoals)}
    ${line("Any other information teachers should know?", f.childInfo.otherNotes)}
    <p class="note">If any change occurs in the home (new baby, working mother, etc.) Please notify the director.</p>

    <h2>Financial / Tuition Agreement <span class="please">Please Print</span></h2>
    ${line("Person responsible for tuition payments", f.tuitionResponsible.name, "Penanggung jawab SPP")}
    ${line("Home Address (Alamat)", f.tuitionResponsible.homeAddress)}
    <div class="row3">
      ${line("E-mail", f.tuitionResponsible.email)}
      ${line("Home Phone", f.tuitionResponsible.homePhone)}
      ${line("Cell Phone", f.tuitionResponsible.cellPhone)}
    </div>
    <p class="note">
      The first monthly payment will be withdrawn in July. This payment will secure your children's space in class.
      Tuition will be withdrawn on the 5th or 10th of each month. Monthly reminder statements are NOT sent out.
      No refunds can be made for registration fees.
    </p>

    <h2>Parent / Guardian Declaration <span class="please">Please Print</span></h2>
    <p class="decl">
      I/We the undersigned hereby certify the foregoing information given is true, correct and complete and that I/We
      understand that signing below indicates that I/We have read and understand the information contained in this
      Student Registration Form.
    </p>
    <div class="sign-row">
      <div>
        <div class="value" style="border:0;border-bottom:1px solid #111;min-height:1.4em">${esc(f.declarationDate)}</div>
        <div class="cap">Date</div>
      </div>
      <div>
        ${signature}
        <div class="cap">${esc(f.signedBy) || "Parent / Guardian Signature"}</div>
      </div>
    </div>

    <div class="footer">BabelKids Registration Form · ${esc(app.id)}</div>
  </div>
</body>
</html>`;
}

/** Open a print-ready window so admin can Save as PDF */
export function openRegistrationPdf(app: RegistrationApplication) {
  if (!app.detailedForm && !app.child) return;
  const html = buildRegistrationPrintHtml(app);
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!w) {
    // popup blocked — fallback download as HTML
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registration-${app.child.nickname || app.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
