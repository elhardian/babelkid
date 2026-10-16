/** Canonical school / marketing site config for SEO & structured data */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://babelkids.id";

export const SITE_NAME = "BabelKids";
export const SITE_LEGAL_NAME = "BabelKids Pangkalpinang";

export const SITE_TAGLINE =
  "TK & Kelompok Bermain Bilingual di Pangkalpinang";

export const SITE_DESCRIPTION =
  "BabelKids adalah TK dan Kelompok Bermain bilingual di Pangkalpinang, Bangka Belitung. Pembelajaran student-centered, kurikulum Singapore + Diknas, karakter sejak dini. Daftar sekarang.";

export const SITE_KEYWORDS = [
  "TK Pangkalpinang",
  "Taman Kanak-Kanak Pangkalpinang",
  "Kelompok Bermain Pangkalpinang",
  "Playgroup Pangkalpinang",
  "sekolah anak Pangkalpinang",
  "TK bilingual Pangkalpinang",
  "PAUD Pangkalpinang",
  "TK Bangka Belitung",
  "BabelKids",
  "sekolah bilingual Pangkalpinang",
  "pendidikan anak usia dini Pangkalpinang",
] as const;

export const SCHOOL_ADDRESS = {
  street: "Jl. JK. Hasan Basri Sulaiman (Jl. Balai) No.97",
  city: "Pangkalpinang",
  region: "Kepulauan Bangka Belitung",
  postalCode: "33134",
  country: "ID",
  full: "Jl. JK. Hasan Basri Sulaiman (Jl. Balai) No.97, Pangkalpinang, Kepulauan Bangka Belitung",
} as const;

export const SCHOOL_GEO = {
  lat: -2.1252929,
  lng: 106.1078513,
} as const;

export const SCHOOL_CONTACT = {
  phoneDisplay: "0717-431640",
  phoneE164: "+62717431640",
  whatsappE164: "6281210001001",
  email: "babelkids@gmail.com",
  instagram: "Tkbabel_kids",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SCHOOL_CONTACT.whatsappE164}?text=${encodeURIComponent(
  "Halo BabelKids, saya ingin bertanya tentang sekolah di Pangkalpinang.",
)}`;

export const MAPS_URL =
  "https://www.google.com/maps/place/Babel+Kids/@-2.1252929,106.1078513,17z/data=!3m1!4b1!4m6!3m5!1s0x2e22c126527c90d9:0xc51d961435f321c8!8m2!3d-2.1252929!4d106.1078513!16s%2Fg%2F11c53n95s3";

export const MAPS_EMBED =
  "https://www.google.com/maps?q=Babel+Kids+-2.1252929,106.1078513&z=17&output=embed";

export const MARKETING_PATHS = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/tentang", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/lokasi", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" as const },
  {
    path: "/program/kelompok-bermain",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/program/taman-kanak-kanak",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/program/bilingual",
    priority: 0.85,
    changeFrequency: "monthly" as const,
  },
  { path: "/register", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "/app", priority: 0.6, changeFrequency: "monthly" as const },
] as const;
