"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
import { useRolePermissions } from "@/components/dashboard/RolePermissionsProvider";

export function DashboardRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useStaffSession();
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessPath } = useRolePermissions();
  const allowed = canAccessPath(session.role, pathname);

  useEffect(() => {
    if (!allowed) {
      router.replace("/dashboard");
    }
  }, [allowed, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-5 text-center">
        <div>
          <p className="text-lg font-medium text-[#1A2330]">Akses terbatas</p>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Menu ini tidak tersedia untuk peran Anda.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
