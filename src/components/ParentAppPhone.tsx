import Image from "next/image";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Receipt,
  Sparkles,
} from "lucide-react";

function MockBottomNav({
  active,
}: {
  active: "home" | "presence" | "tuition";
}) {
  const item = (
    label: string,
    Icon: typeof CalendarDays,
    key: string,
  ) => {
    const on = active === key;
    return (
      <div
        className={`flex w-9 flex-col items-center gap-0.5 ${
          on ? "text-[#2E7DFF]" : "text-[#A0AAB8]"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={on ? 2.2 : 1.7} />
        <span className="text-[7px] font-medium leading-none">{label}</span>
      </div>
    );
  };

  return (
    <div className="absolute inset-x-1.5 bottom-1.5 z-20 flex items-end justify-between rounded-[1.1rem] bg-white/95 px-1 pb-1.5 pt-1.5 shadow-[0_8px_24px_rgba(26,35,48,0.12)]">
      {item("Absensi", CalendarDays, "presence")}
      {item("SPP", Receipt, "tuition")}
      <div className="relative -mt-5 flex w-10 flex-col items-center">
        <span
          className={`flex size-9 items-center justify-center rounded-full bg-[#2E7DFF] text-white shadow-md shadow-[#2E7DFF]/35 ${
            active === "home" ? "ring-2 ring-[#2E7DFF]/25" : ""
          }`}
        >
          <LayoutDashboard className="size-4" strokeWidth={2} />
        </span>
        <span
          className={`mt-0.5 text-[7px] font-medium ${
            active === "home" ? "text-[#2E7DFF]" : "text-[#A0AAB8]"
          }`}
        >
          Dashboard
        </span>
      </div>
      {item("Acara", Sparkles, "events")}
      {item("Laporan", FileText, "reports")}
    </div>
  );
}

function MockSkyHeader({ title }: { title: string }) {
  return (
    <div
      className="relative overflow-hidden px-2.5 pb-3 pt-5"
      style={{
        background:
          "linear-gradient(180deg, #FFD4A8 0%, #FFE8D2 45%, #C8E4F8 100%)",
      }}
    >
      {/* sun */}
      <div className="absolute right-3 top-2 size-7 rounded-full bg-[#FFD93D] opacity-90 shadow-[0_0_12px_#FFD93D]" />
      {/* clouds */}
      <div className="absolute left-2 top-6 h-3 w-8 rounded-full bg-white/70" />
      <div className="absolute left-5 top-5 h-3.5 w-6 rounded-full bg-white/80" />
      <div className="absolute right-8 top-8 h-2.5 w-7 rounded-full bg-white/65" />
      <div className="relative z-10 flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/95 py-0.5 pl-0.5 pr-2 shadow-sm">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#FFB4C8] text-[8px] font-semibold text-[#1A2330]">
            A
          </span>
          <span className="text-[8px] font-medium text-[#1A2330]">Sari</span>
        </div>
      </div>
      <p className="relative z-10 mt-2 text-[7px] font-medium uppercase tracking-[0.12em] text-[#E8910F]">
        Selamat pagi · Pagi
      </p>
      <h3 className="relative z-10 mt-0.5 max-w-[12ch] text-[11px] font-medium leading-tight tracking-tight text-[#1A2330]">
        {title}
      </h3>
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="flex h-full flex-col bg-[#F5D5B8] font-[family-name:var(--font-outfit)]">
      <MockSkyHeader title="Cerita tumbuh Alya hari ini." />
      <div className="relative z-10 -mt-1 flex-1 space-y-2.5 overflow-hidden rounded-t-[1.25rem] bg-[#F3F7FC] px-2.5 pb-14 pt-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[9px] font-medium text-[#1A2330]">Anak saya</p>
            <p className="text-[7px] text-[#8A96A8]">Profil →</p>
          </div>
          <div className="flex gap-1.5">
            {[
              { n: "Alya", c: "#FFB4C8", on: true },
              { n: "Kenzo", c: "#54C6EB", on: false },
            ].map((k) => (
              <div
                key={k.n}
                className={`flex items-center gap-1 rounded-full px-1.5 py-1 ${
                  k.on ? "bg-white shadow-sm ring-1 ring-[#2E7DFF]/30" : "bg-white/70"
                }`}
              >
                <span
                  className="flex size-5 items-center justify-center rounded-full text-[7px] font-semibold text-[#1A2330]"
                  style={{ backgroundColor: k.c }}
                >
                  {k.n[0]}
                </span>
                <span className="text-[8px] font-medium text-[#1A2330]">{k.n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1rem] bg-white p-2 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[7px] text-[#8A96A8]">Ringkasan kehadiran · bulan ini</p>
              <p className="text-[9px] font-medium text-[#1A2330]">Alya</p>
            </div>
            <p className="text-sm font-medium tabular-nums text-[#2E7DFF]">
              94<span className="text-[8px] text-[#8A96A8]">%</span>
            </p>
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            {[
              { l: "Hadir", v: "18", c: "text-emerald-600" },
              { l: "Tidak", v: "0", c: "text-rose-600" },
              { l: "Izin", v: "1", c: "text-sky-600" },
              { l: "Telat", v: "0", c: "text-amber-700" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg bg-[#F3F7FC] py-1 text-center">
                <p className={`text-[9px] font-medium tabular-nums ${s.c}`}>{s.v}</p>
                <p className="text-[6px] text-[#8A96A8]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[9px] font-medium text-[#1A2330]">Kegiatan kelas</p>
            <p className="text-[7px] text-[#2E7DFF]">Lihat semua →</p>
          </div>
          <div className="flex gap-1.5 overflow-hidden">
            {[
              { t: "Fun Cooking", img: "/preschool.png" },
              { t: "Art Time", img: "/kindergarten.jpg" },
            ].map((a) => (
              <div
                key={a.t}
                className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-[0.85rem]"
              >
                <Image src={a.img} alt="" fill className="object-cover" sizes="72px" />
                <div className="absolute inset-x-1 bottom-1 rounded-md bg-white/85 p-1 backdrop-blur-sm">
                  <p className="line-clamp-2 text-[7px] font-medium leading-tight text-[#1A2330]">
                    {a.t}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MockBottomNav active="home" />
    </div>
  );
}

function PresenceScreen() {
  return (
    <div className="flex h-full flex-col bg-[#F5D5B8] font-[family-name:var(--font-outfit)]">
      <MockSkyHeader title="Absensi Alya" />
      <div className="relative z-10 -mt-1 flex-1 space-y-2 overflow-hidden rounded-t-[1.25rem] bg-[#F3F7FC] px-2.5 pb-14 pt-2.5">
        <div className="rounded-[1rem] bg-white p-2 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[7px] text-[#8A96A8]">Ringkasan kehadiran · bulan ini</p>
              <p className="text-[9px] font-medium text-[#1A2330]">Alya</p>
            </div>
            <p className="text-sm font-medium tabular-nums text-[#2E7DFF]">
              94<span className="text-[8px] text-[#8A96A8]">%</span>
            </p>
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            {[
              { l: "Hadir", v: "18", c: "text-emerald-600" },
              { l: "Tidak", v: "0", c: "text-rose-600" },
              { l: "Izin", v: "1", c: "text-sky-600" },
              { l: "Telat", v: "0", c: "text-amber-700" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg bg-[#F3F7FC] py-1 text-center">
                <p className={`text-[9px] font-medium tabular-nums ${s.c}`}>{s.v}</p>
                <p className="text-[6px] text-[#8A96A8]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {[
            { d: "Sen, 22 Sep", s: "Hadir", c: "bg-emerald-50 text-emerald-700" },
            { d: "Sel, 23 Sep", s: "Hadir", c: "bg-emerald-50 text-emerald-700" },
            { d: "Rab, 24 Sep", s: "Izin", c: "bg-sky-50 text-sky-700" },
          ].map((row) => (
            <div
              key={row.d}
              className="flex items-center justify-between rounded-xl bg-white px-2 py-1.5 shadow-sm"
            >
              <p className="text-[8px] font-medium text-[#1A2330]">{row.d}</p>
              <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-medium ${row.c}`}>
                {row.s}
              </span>
            </div>
          ))}
        </div>
      </div>
      <MockBottomNav active="presence" />
    </div>
  );
}

function TuitionScreen() {
  return (
    <div className="flex h-full flex-col bg-[#F5D5B8] font-[family-name:var(--font-outfit)]">
      <MockSkyHeader title="SPP & pembayaran" />
      <div className="relative z-10 -mt-1 flex-1 space-y-2 overflow-hidden rounded-t-[1.25rem] bg-[#F3F7FC] px-2.5 pb-14 pt-2.5">
        <div className="flex gap-1">
          {["Alya", "Kenzo"].map((n, i) => (
            <div
              key={n}
              className={`rounded-full px-2 py-1 text-[8px] font-medium ${
                i === 0
                  ? "bg-white text-[#1A2330] shadow-sm ring-1 ring-[#2E7DFF]/30"
                  : "bg-white/60 text-[#8A96A8]"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        <div className="rounded-[1rem] bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-[#8A96A8]">Juli 2026</p>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-medium text-emerald-700">
              Lunas
            </span>
          </div>
          <p className="mt-1 text-base font-medium tabular-nums text-[#1A2330]">
            Rp 2.500.000
          </p>
          <p className="mt-0.5 text-[8px] text-[#8A96A8]">Transfer · 5 Jul 2026</p>
          <div className="mt-2 flex gap-1">
            <span className="rounded-lg bg-[#F3F7FC] px-2 py-1 text-[7px] font-medium text-[#2E7DFF]">
              Lihat bukti
            </span>
          </div>
        </div>

        <div className="rounded-[1rem] bg-white p-2.5 shadow-sm opacity-80">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-[#8A96A8]">Juni 2026</p>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-medium text-emerald-700">
              Lunas
            </span>
          </div>
          <p className="mt-1 text-sm font-medium tabular-nums text-[#1A2330]">
            Rp 2.500.000
          </p>
        </div>
      </div>
      <MockBottomNav active="tuition" />
    </div>
  );
}

const screens = {
  home: HomeScreen,
  presence: PresenceScreen,
  tuition: TuitionScreen,
} as const;

export function ParentAppPhone({
  screen,
  className = "",
}: {
  screen: keyof typeof screens;
  className?: string;
}) {
  const Screen = screens[screen];
  return (
    <div className={`relative mx-auto w-[11.5rem] shrink-0 sm:w-[13.5rem] ${className}`}>
      <div className="relative overflow-hidden rounded-[2rem] border-[5px] border-[#1A2330] bg-[#1A2330] shadow-[0_24px_50px_rgba(26,35,48,0.35)]">
        <div className="absolute left-1/2 top-1.5 z-30 h-3.5 w-[4.5rem] -translate-x-1/2 rounded-full bg-[#1A2330]" />
        <div className="relative aspect-[9/19] overflow-hidden rounded-[1.55rem] bg-[#F5D5B8]">
          <Screen />
        </div>
      </div>
    </div>
  );
}

export const parentAppScreenMeta = [
  { key: "home" as const, label: "Beranda", caption: "Kegiatan kelas & kehadiran anak" },
  { key: "presence" as const, label: "Absensi", caption: "Rekap hadir, izin, dan sakit" },
  { key: "tuition" as const, label: "SPP", caption: "Status bayar & bukti transfer" },
];
