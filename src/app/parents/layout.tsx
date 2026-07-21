"use client";

import { ParentsBottomNav } from "@/components/parents/ParentsBottomNav";
import { KidSwitcher } from "@/components/parents/KidSwitcher";
import { ParentKidsProvider, useParentKids } from "@/components/parents/ParentKidsProvider";

function ParentsShell({ children }: { children: React.ReactNode }) {
  const { parentName } = useParentKids();

  return (
    <div className="min-h-screen bg-[#E8F2EE]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#F4F9F6] shadow-2xl shadow-black/10">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F4F9F6]/95 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#00B894]">
                BabelKids
              </p>
              <p className="truncate text-xs text-neutral-500">
                Hi, {parentName.split(" ")[0]}
              </p>
            </div>
            <KidSwitcher />
          </div>
        </header>

        <div className="flex-1 px-5 pb-28 pt-4">{children}</div>
        <ParentsBottomNav />
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
