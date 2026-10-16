"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, SquarePlus } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallParentApp({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setIos(isIos());
    setInstalled(isStandalone());

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installAndroid() {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } finally {
      setInstalling(false);
    }
  }

  const hero = variant === "hero";

  if (installed) {
    return (
      <div
        className={
          hero
            ? "rounded-2xl bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-sm"
            : "rounded-[1.75rem] border border-[#C5E8D8] bg-[#F0FBF6] px-4 py-3.5 text-sm text-[#1F3A56]"
        }
      >
        <p className="font-semibold">Aplikasi sudah terpasang</p>
        <p className={`mt-0.5 text-xs ${hero ? "text-white/75" : "text-[#5B6B7C]"}`}>
          Buka BabelKids dari layar utama HP Anda.
        </p>
      </div>
    );
  }

  const primaryBtn = hero
    ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#1F3A56] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#EAF8FF] disabled:opacity-60 sm:w-auto"
    : "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1F3A56] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60";

  const iosSteps = showIosSteps ? (
    <ol
      className={
        hero
          ? "space-y-3 rounded-2xl bg-white/12 p-4 text-sm text-white backdrop-blur-sm"
          : "space-y-3 rounded-2xl bg-[#F3F7FC] p-4 text-sm text-[#1F3A56]"
      }
    >
      <li className="flex gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3DB5E6] text-xs font-bold text-white">
          1
        </span>
        <p>
          Ketuk tombol{" "}
          <span className="inline-flex items-center gap-1 font-semibold">
            Bagikan <Share className="inline size-3.5" />
          </span>{" "}
          di bagian bawah Safari.
        </p>
      </li>
      <li className="flex gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3DB5E6] text-xs font-bold text-white">
          2
        </span>
        <p>
          Gulir lalu pilih{" "}
          <span className="inline-flex items-center gap-1 font-semibold">
            Add to Home Screen <SquarePlus className="inline size-3.5" />
          </span>
          .
        </p>
      </li>
      <li className="flex gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3DB5E6] text-xs font-bold text-white">
          3
        </span>
        <p>
          Ketuk <span className="font-semibold">Add</span> — ikon BabelKids
          muncul di layar utama.
        </p>
      </li>
    </ol>
  ) : null;

  if (hero) {
    return (
      <div className="w-full max-w-md space-y-3">
        {ios ? (
          <>
            <button
              type="button"
              onClick={() => setShowIosSteps((v) => !v)}
              className={primaryBtn}
            >
              <Download className="size-4" />
              {showIosSteps ? "Hide steps" : "Install"}
            </button>
            {iosSteps}
          </>
        ) : deferred ? (
          <button
            type="button"
            onClick={installAndroid}
            disabled={installing}
            className={primaryBtn}
          >
            <Download className="size-4" />
            {installing ? "Installing…" : "Install"}
          </button>
        ) : (
          <button type="button" disabled className={`${primaryBtn} opacity-80`}>
            <Download className="size-4" />
            Install
          </button>
        )}
        {!ios && !deferred ? (
          <p className="text-xs text-white/70">
            On Android Chrome: tap Install when available, or browser menu →
            Install app.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/95 p-5 shadow-[0_12px_32px_rgba(31,58,86,0.08)] backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#EAF8FF] text-[#3DB5E6]">
          <Smartphone className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1F3A56]">Install parent app</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[#5B6B7C]">
            Quick access from your home screen — no App Store needed.
          </p>
        </div>
      </div>

      {ios ? (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowIosSteps((v) => !v)}
            className={primaryBtn}
          >
            <Download className="size-4" />
            {showIosSteps ? "Hide steps" : "Install"}
          </button>
          {iosSteps}
        </div>
      ) : deferred ? (
        <button
          type="button"
          onClick={installAndroid}
          disabled={installing}
          className={`mt-4 ${primaryBtn}`}
        >
          <Download className="size-4" />
          {installing ? "Installing…" : "Install"}
        </button>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#F3F7FC] px-3 py-2.5 text-xs leading-relaxed text-[#5B6B7C]">
          Open this page in Chrome/Edge on Android, then tap{" "}
          <span className="font-medium text-[#1F3A56]">Install</span> when it
          appears — or browser menu →{" "}
          <span className="font-medium text-[#1F3A56]">Install app</span>.
        </p>
      )}
    </div>
  );
}
