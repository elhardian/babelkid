"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useDayPeriodTheme } from "@/components/parents/dayPeriod";
import { SkyIllustration } from "@/components/parents/ParentsIllustrations";
import { ParentsBottomNav } from "@/components/parents/ParentsBottomNav";
import {
  ParentKidsProvider,
  useParentKids,
} from "@/components/parents/ParentKidsProvider";

function ParentsShell({ children }: { children: React.ReactNode }) {
  const { parentName, selectedChild } = useParentKids();
  const firstName = parentName.split(" ")[0];
  const pathname = usePathname();
  const theme = useDayPeriodTheme();
  const isHome = pathname === "/parents";
  const isExpand =
    pathname.startsWith("/parents/activities/") ||
    pathname.startsWith("/parents/events/") ||
    pathname.startsWith("/parents/kids/");
  const isNight = theme.period === "night";

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-outfit)] font-light text-[#1A2330] transition-colors duration-1000"
      style={{ backgroundColor: theme.pageBg }}
    >
      <div
        className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden shadow-2xl shadow-[#1A2330]/15 transition-colors duration-1000"
        style={{ backgroundColor: isExpand ? "#FFFFFF" : theme.shellBg }}
      >
        {!isExpand ? (
          <div className="relative shrink-0 overflow-hidden">
            <SkyIllustration theme={theme} />
            <header className="relative z-10 flex items-center justify-end px-5 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))]">
              <Link
                href="/parents/profile"
                className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 shadow-sm shadow-black/5 backdrop-blur-md transition ${
                  isNight
                    ? "bg-white/15 text-[#F3F7FC] hover:bg-white/25"
                    : "bg-white/95 text-[#1A2330] hover:bg-white"
                }`}
              >
                <ChildAvatar
                  gender={selectedChild.gender}
                  nickname={selectedChild.nickname}
                  size="sm"
                  className="!size-9"
                />
                <span className="text-sm font-medium">{firstName}</span>
              </Link>
            </header>
            {isHome ? (
              <div className="relative z-10 px-6 pb-10 pt-4">
                <p
                  className="text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-700"
                  style={{ color: theme.accent }}
                >
                  {theme.greeting} · {theme.label}
                </p>
                <h1
                  className="mt-2 max-w-[14ch] text-[1.85rem] font-medium leading-tight tracking-tight animate-fade-up transition-colors duration-700"
                  style={{ color: theme.title }}
                >
                  Cerita tumbuh {selectedChild.nickname} hari ini.
                </h1>
              </div>
            ) : (
              <div className="relative z-10 h-6" />
            )}
          </div>
        ) : null}

        <div
          className={
            isExpand
              ? "flex-1"
              : "relative z-10 -mt-4 flex-1 rounded-t-[2rem] bg-[#F7FAFD] px-5 pb-32 pt-5 shadow-[0_-8px_30px_rgba(26,35,48,0.06)] animate-sheet-up"
          }
        >
          {children}
        </div>
        {!isExpand ? <ParentsBottomNav /> : null}
      </div>
    </div>
  );
}

export default function ParentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ParentKidsProvider>
      <ParentsShell>{children}</ParentsShell>
    </ParentKidsProvider>
  );
}
