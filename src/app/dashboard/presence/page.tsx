"use client";

import { useState } from "react";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { useDayOffs } from "@/components/dashboard/DayOffProvider";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { isWeekend } from "@/lib/mock-data";
import { formatDate, todayISO } from "@/lib/format";
import type { DayOffType } from "@/lib/types";

export default function TanggalPage() {
  const { dayOffs, getByDate, upsertDayOff, removeDayOff } = useDayOffs();
  const [date, setDate] = useState(todayISO);
  const [dayOffModal, setDayOffModal] = useState(false);

  const selectedOff = getByDate(date);
  const weekend = isWeekend(date);

  function saveDayOff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsertDayOff({
      id: selectedOff?.id,
      date,
      title: String(fd.get("title") || "Libur"),
      description: String(fd.get("description") || "") || undefined,
      type: (String(fd.get("type")) as DayOffType) || "holiday",
    });
    setDayOffModal(false);
  }

  const upcoming = [...dayOffs]
    .filter((d) => d.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A2330]">
          Tanggal
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Kalender sekolah · libur nasional, off, dan hari masuk
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-3">
          <AttendanceCalendar
            selectedDate={date}
            onSelectDate={setDate}
            dayOffs={dayOffs}
            variant="dashboard"
          />
          <button
            type="button"
            onClick={() => setDayOffModal(true)}
            className="w-full rounded-xl border border-[#E5ECF5] bg-white px-3 py-2.5 text-sm font-medium text-[#1A2330] hover:bg-[#EEF3FA]"
          >
            {selectedOff ? "Edit libur tanggal ini" : "Tandai libur / hari off"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E5ECF5] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
              {formatDate(date, "EEEE, dd MMMM yyyy")}
            </p>
            {weekend ? (
              <div className="mt-3">
                <p className="text-lg font-medium text-[#F0783C]">Akhir pekan</p>
                <p className="mt-1 text-sm text-[#8A96A8]">
                  Sabtu & Minggu otomatis libur. Tidak ada kegiatan sekolah.
                </p>
              </div>
            ) : selectedOff ? (
              <div className="mt-3">
                <p className="text-lg font-medium text-[#2E7DFF]">
                  {selectedOff.title}
                </p>
                {selectedOff.description ? (
                  <p className="mt-1 text-sm text-[#5B6B7C]">
                    {selectedOff.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs capitalize text-[#8A96A8]">
                  Jenis:{" "}
                  {selectedOff.type === "holiday"
                    ? "Libur nasional"
                    : selectedOff.type === "school_off"
                      ? "Off sekolah"
                      : "Lainnya"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDayOffModal(true)}
                    className="rounded-xl border border-[#E5ECF5] px-3 py-1.5 text-xs font-medium text-[#1A2330] hover:bg-[#EEF3FA]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDayOff(selectedOff.id)}
                    className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Hapus libur
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-lg font-medium text-[#1A2330]">Hari masuk</p>
                <p className="mt-1 text-sm text-[#8A96A8]">
                  Kegiatan kelas berjalan. Catat absensi siswa di menu Absensi.
                </p>
              </div>
            )}
          </div>

          <section className="rounded-2xl border border-[#E5ECF5] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#1A2330]">
              Libur mendatang
            </h2>
            <ul className="mt-3 space-y-2">
              {upcoming.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setDate(d.date)}
                    className="flex w-full items-start gap-3 rounded-xl bg-[#F7FAFD] px-3 py-2.5 text-left hover:bg-[#EEF3FA]"
                  >
                    <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#EEF3FA] text-[#2E7DFF]">
                      <span className="text-[10px] font-medium uppercase leading-none">
                        {formatDate(d.date, "MMM")}
                      </span>
                      <span className="text-sm font-medium leading-none">
                        {formatDate(d.date, "d")}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#1A2330]">
                        {d.title}
                      </span>
                      {d.description ? (
                        <span className="mt-0.5 block text-xs text-[#8A96A8] line-clamp-2">
                          {d.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
              {upcoming.length === 0 ? (
                <li className="py-6 text-center text-sm text-[#8A96A8]">
                  Tidak ada libur terjadwal
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>

      <Modal
        open={dayOffModal}
        onClose={() => setDayOffModal(false)}
        title={selectedOff ? "Edit hari libur" : "Tambah hari libur"}
      >
        <form onSubmit={saveDayOff} className="space-y-3">
          <Field label="Tanggal">
            <input
              className={inputClass}
              value={formatDate(date, "dd MMMM yyyy")}
              readOnly
            />
          </Field>
          <Field label="Judul">
            <input
              name="title"
              required
              defaultValue={selectedOff?.title ?? ""}
              placeholder="cth. Hari Kemerdekaan"
              className={inputClass}
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              name="description"
              rows={3}
              defaultValue={selectedOff?.description ?? ""}
              placeholder="Keterangan singkat…"
              className={inputClass}
            />
          </Field>
          <Field label="Jenis">
            <select
              name="type"
              defaultValue={selectedOff?.type ?? "holiday"}
              className={inputClass}
            >
              <option value="holiday">Libur nasional</option>
              <option value="school_off">Libur sekolah</option>
              <option value="other">Lainnya</option>
            </select>
          </Field>
          <ModalActions
            onCancel={() => setDayOffModal(false)}
            submitLabel="Simpan"
          />
        </form>
      </Modal>
    </div>
  );
}
