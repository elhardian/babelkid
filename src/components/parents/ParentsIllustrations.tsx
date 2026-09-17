"use client";

import type { DayPeriodState } from "@/components/parents/dayPeriod";

/** Soft sky + drifting clouds — sun/moon arc follows the clock */
export function SkyIllustration({
  theme,
  className = "",
}: {
  theme: DayPeriodState;
  className?: string;
}) {
  const { left, top } = theme.celestialPos;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-[background] duration-1000 ${className}`}
      style={{ background: theme.skyGradient }}
      aria-hidden
    >
      {theme.celestial === "sun" ? (
        <div
          className="absolute z-[1] size-[5.5rem] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-1000 ease-in-out"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <div className="relative size-full animate-celestial-bob">
            <div
              className="absolute inset-0 animate-sun-rays"
              style={{ color: theme.celestialColor }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <span
                  key={deg}
                  className="absolute left-1/2 top-1/2 block h-3.5 w-1.5 -translate-x-1/2 rounded-full opacity-60"
                  style={{
                    backgroundColor: "currentColor",
                    transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-2.15rem)`,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, #FFF6D0, ${theme.celestialColor})`,
                boxShadow: `0 0 24px ${theme.celestialColor}cc, 0 0 48px ${theme.celestialColor}66`,
              }}
            />
          </div>
        </div>
      ) : null}

      {theme.celestial === "moon" ? (
        <div
          className="absolute z-[1] size-[4.5rem] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-1000 ease-in-out"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <div className="size-full animate-celestial-bob">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full overflow-visible animate-moon-glow"
            >
              <defs>
                <mask id="crescent-mask">
                  <rect width="100" height="100" fill="white" />
                  <circle cx="62" cy="42" r="28" fill="black" />
                </mask>
              </defs>
              <circle
                cx="48"
                cy="52"
                r="30"
                fill={theme.celestialColor}
                mask="url(#crescent-mask)"
              />
              <circle cx="38" cy="48" r="4" fill="#E8E0C0" opacity="0.35" />
              <circle cx="44" cy="62" r="3" fill="#E8E0C0" opacity="0.3" />
              <circle cx="32" cy="58" r="2.5" fill="#E8E0C0" opacity="0.25" />
            </svg>
          </div>
        </div>
      ) : null}

      {theme.showStars
        ? [
            [12, 18],
            [28, 42],
            [48, 14],
            [62, 36],
            [78, 22],
            [88, 48],
            [35, 58],
            [70, 8],
          ].map(([x, y], i) => (
            <span
              key={i}
              className="absolute size-1 rounded-full bg-white/80 animate-pulse-soft"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${i * 0.35}s`,
                opacity: 0.5 + (i % 3) * 0.15,
              }}
            />
          ))
        : null}

      <svg
        className="absolute left-[-10%] top-6 h-10 w-28 animate-cloud-drift"
        style={{ color: theme.cloud }}
        viewBox="0 0 120 40"
        fill="currentColor"
      >
        <ellipse cx="40" cy="24" rx="28" ry="12" />
        <ellipse cx="62" cy="20" rx="22" ry="14" />
        <ellipse cx="28" cy="20" rx="16" ry="10" />
      </svg>
      <svg
        className="absolute right-[8%] top-16 h-8 w-24 animate-cloud-drift [animation-delay:1.5s]"
        style={{ color: theme.cloud }}
        viewBox="0 0 120 40"
        fill="currentColor"
      >
        <ellipse cx="48" cy="22" rx="30" ry="11" />
        <ellipse cx="70" cy="18" rx="18" ry="12" />
      </svg>
      <svg
        className="absolute left-[35%] top-28 h-7 w-20 animate-cloud-drift [animation-delay:3s]"
        style={{ color: theme.cloud }}
        viewBox="0 0 100 36"
        fill="currentColor"
      >
        <ellipse cx="40" cy="20" rx="26" ry="10" />
        <ellipse cx="58" cy="16" rx="16" ry="11" />
      </svg>

      {theme.showBirds ? (
        <svg
          className="absolute left-[15%] top-12 h-16 w-40 animate-bird-fly"
          viewBox="0 0 160 70"
          fill="none"
          style={{ stroke: theme.bird }}
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M40 32 q8 -8 16 0" />
          <path d="M72 22 q7 -7 14 0" />
          <path d="M100 38 q6 -6 12 0" />
        </svg>
      ) : null}

      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50 Q80 20 160 48 T320 42 L400 55 L400 80 L0 80 Z"
          fill={theme.hillBack}
        />
        <path
          d="M0 62 Q100 38 200 60 T400 58 L400 80 L0 80 Z"
          fill={theme.hillFront}
        />
      </svg>
    </div>
  );
}

/** Flat camp / nature scene used as decorative activity cover fallback */
export function CampSceneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="320" height="400" fill="#C8E4F8" />
      <circle cx="250" cy="70" r="28" fill="#F5D76E" />
      <path d="M0 220 L80 120 L160 220 Z" fill="#7BA3C4" />
      <path d="M100 230 L200 90 L300 230 Z" fill="#5B87B0" />
      <path d="M0 260 L320 260 L320 400 L0 400 Z" fill="#6FAE7A" />
      <ellipse cx="160" cy="300" rx="90" ry="28" fill="#4A9BC7" opacity="0.85" />
      <path d="M70 320 L110 250 L150 320 Z" fill="#E8B84A" />
      <path d="M170 325 L210 255 L250 325 Z" fill="#E07A5F" />
      <rect x="108" y="250" width="4" height="20" fill="#4A3728" />
      <rect x="208" y="255" width="4" height="20" fill="#4A3728" />
      <path d="M40 340 L55 280 L70 340 Z" fill="#2D6A4F" />
      <path d="M250 345 L268 275 L286 345 Z" fill="#2D6A4F" />
      <path d="M280 350 L295 290 L310 350 Z" fill="#40916C" />
    </svg>
  );
}
