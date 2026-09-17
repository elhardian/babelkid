"use client";

import { cn } from "@/lib/format";

/** Flat illustration avatar — girl / boy styles */
export function ChildAvatar({
  gender,
  nickname,
  size = "md",
  className,
}: {
  gender: "male" | "female";
  nickname: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "size-20" : size === "sm" ? "size-11" : "size-14";
  const girl = gender === "female";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full shadow-sm ring-2 ring-white",
        dim,
        className,
      )}
      aria-label={nickname}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
        <circle cx="40" cy="40" r="40" fill={girl ? "#FFE0EC" : "#D6ECFF"} />
        {/* hair */}
        {girl ? (
          <>
            <ellipse cx="40" cy="34" rx="28" ry="26" fill="#5C3D2E" />
            <ellipse cx="18" cy="48" rx="10" ry="16" fill="#5C3D2E" />
            <ellipse cx="62" cy="48" rx="10" ry="16" fill="#5C3D2E" />
            <circle cx="24" cy="28" r="4" fill="#F0783C" />
            <circle cx="56" cy="28" r="4" fill="#2E7DFF" />
          </>
        ) : (
          <>
            <ellipse cx="40" cy="30" rx="26" ry="22" fill="#3D2B1F" />
            <rect x="16" y="28" width="48" height="14" rx="4" fill="#3D2B1F" />
          </>
        )}
        {/* face */}
        <ellipse cx="40" cy="44" rx="18" ry="20" fill="#F6C9A8" />
        <circle cx="33" cy="42" r="2.2" fill="#1A2330" />
        <circle cx="47" cy="42" r="2.2" fill="#1A2330" />
        <path
          d="M34 52 Q40 56 46 52"
          fill="none"
          stroke="#C47A5A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="28" cy="48" r="3" fill="#F5A8A0" opacity="0.55" />
        <circle cx="52" cy="48" r="3" fill="#F5A8A0" opacity="0.55" />
        {/* shirt */}
        <path
          d="M22 72 Q40 58 58 72 L58 80 L22 80 Z"
          fill={girl ? "#F0783C" : "#2E7DFF"}
        />
      </svg>
    </div>
  );
}
