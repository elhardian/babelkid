"use client";

import { useEffect, useState } from "react";

export type DayPeriod = "morning" | "noon" | "afternoon" | "night";

export interface DayPeriodTheme {
  period: DayPeriod;
  label: string;
  greeting: string;
  /** Outer page wash */
  pageBg: string;
  /** Phone shell sky */
  shellBg: string;
  /** Hero area gradient */
  skyGradient: string;
  cloud: string;
  bird: string;
  hillBack: string;
  hillFront: string;
  accent: string;
  title: string;
  /** Celestial body */
  celestial: "sun" | "moon" | "none";
  celestialColor: string;
  showStars: boolean;
  showBirds: boolean;
}

const themes: Record<DayPeriod, DayPeriodTheme> = {
  morning: {
    period: "morning",
    label: "Pagi",
    greeting: "Selamat pagi",
    pageBg: "#F5D5B8",
    shellBg: "#FFE4C8",
    skyGradient: "linear-gradient(180deg, #FFD4A8 0%, #FFE8D2 45%, #C8E4F8 100%)",
    cloud: "rgba(255,255,255,0.75)",
    bird: "rgba(26,35,48,0.35)",
    hillBack: "#B8D4A8",
    hillFront: "#9BC48A",
    accent: "#E07A3D",
    title: "#1A2330",
    celestial: "sun",
    celestialColor: "#FFB347",
    showStars: false,
    showBirds: true,
  },
  noon: {
    period: "noon",
    label: "Siang",
    greeting: "Selamat siang",
    pageBg: "#BFDCF5",
    shellBg: "#C8E4F8",
    skyGradient: "linear-gradient(180deg, #7EC8F5 0%, #A8D8F5 50%, #C8E4F8 100%)",
    cloud: "rgba(255,255,255,0.7)",
    bird: "rgba(26,35,48,0.35)",
    hillBack: "#B8D9F5",
    hillFront: "#A8CFF0",
    accent: "#2E7DFF",
    title: "#1A2330",
    celestial: "sun",
    celestialColor: "#F5D76E",
    showStars: false,
    showBirds: true,
  },
  afternoon: {
    period: "afternoon",
    label: "Sore",
    greeting: "Selamat sore",
    pageBg: "#E8B89A",
    shellBg: "#F5C4A0",
    skyGradient:
      "linear-gradient(180deg, #F0783C 0%, #F5A66A 35%, #F8C9A0 70%, #E8D4C8 100%)",
    cloud: "rgba(255,230,210,0.65)",
    bird: "rgba(26,35,48,0.4)",
    hillBack: "#C4A080",
    hillFront: "#A88868",
    accent: "#D45A2A",
    title: "#1A2330",
    celestial: "sun",
    celestialColor: "#FF8C42",
    showStars: false,
    showBirds: true,
  },
  night: {
    period: "night",
    label: "Malam",
    greeting: "Selamat malam",
    pageBg: "#1A2744",
    shellBg: "#243B5C",
    skyGradient: "linear-gradient(180deg, #0F1C33 0%, #1A2F4A 55%, #243B5C 100%)",
    cloud: "rgba(160,180,210,0.25)",
    bird: "rgba(200,210,230,0.2)",
    hillBack: "#1A3348",
    hillFront: "#152A3C",
    accent: "#7BA3D4",
    title: "#F3F7FC",
    celestial: "moon",
    celestialColor: "#F5F0D8",
    showStars: true,
    showBirds: false,
  },
};

export function getDayPeriod(date = new Date()): DayPeriod {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 15) return "noon";
  if (h >= 15 && h < 18) return "afternoon";
  return "night";
}

export function getDayPeriodTheme(date = new Date()): DayPeriodTheme {
  return themes[getDayPeriod(date)];
}

/** Arc position across the sky — peaks at center (noon / midnight) */
export function getCelestialPosition(date = new Date()): {
  left: number;
  top: number;
} {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const sunrise = 5 * 60;
  const sunset = 18 * 60;

  let progress: number;
  if (minutes >= sunrise && minutes < sunset) {
    progress = (minutes - sunrise) / (sunset - sunrise);
  } else {
    const nightLen = 24 * 60 - sunset + sunrise;
    const nightMin =
      minutes >= sunset ? minutes - sunset : minutes + (24 * 60 - sunset);
    progress = nightMin / nightLen;
  }

  // Left → center → right; high in the middle of the arc
  const left = 50 + Math.cos(Math.PI - progress * Math.PI) * 40;
  const top = 40 - Math.sin(progress * Math.PI) * 30;
  return { left, top };
}

export type DayPeriodState = DayPeriodTheme & {
  celestialPos: { left: number; top: number };
};

/** Live theme that updates with the clock */
export function useDayPeriodTheme(): DayPeriodState {
  const [state, setState] = useState<DayPeriodState>(() => ({
    ...getDayPeriodTheme(),
    celestialPos: getCelestialPosition(),
  }));

  useEffect(() => {
    const sync = () =>
      setState({
        ...getDayPeriodTheme(),
        celestialPos: getCelestialPosition(),
      });
    sync();
    const id = window.setInterval(sync, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return state;
}
