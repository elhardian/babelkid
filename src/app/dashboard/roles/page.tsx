"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Shield } from "lucide-react";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
import { useRolePermissions } from "@/components/dashboard/RolePermissionsProvider";
import { StatusBadge } from "@/components/dashboard/SearchFilterBar";
import { canManageStaffRoles } from "@/lib/staff-access";
import {
  DASHBOARD_PERMISSIONS,
  STAFF_ROLE_META,
  type AccessLevel,
  type PermissionId,
  type StaffRoleKey,
} from "@/lib/role-permissions";
import { cn } from "@/lib/format";

const EDITABLE_ROLES: StaffRoleKey[] = ["admin", "teacher"];

export default function DashboardRolesPage() {
  const session = useStaffSession();
  const canManage = canManageStaffRoles(session.role);
  const { matrix, setAccessLevel, resetDefaults } = useRolePermissions();
  const [activeRole, setActiveRole] = useState<StaffRoleKey>("teacher");

  const groups = useMemo(() => {
    const map = new Map<string, typeof DASHBOARD_PERMISSIONS>();
    for (const perm of DASHBOARD_PERMISSIONS) {
      const list = map.get(perm.group) ?? [];
      list.push(perm);
      map.set(perm.group, list);
    }
    return [...map.entries()];
  }, []);

  if (!canManage) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-lg font-medium text-[#1A2330]">Akses terbatas</p>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Hanya admin / kepala sekolah yang dapat mengelola peran & izin.
          </p>
        </div>
      </div>
    );
  }

  const locked = activeRole === "owner";

  function isLockedPermission(id: PermissionId) {
    const perm = DASHBOARD_PERMISSIONS.find((p) => p.id === id);
    if (activeRole === "owner") return true;
    if (id === "beranda") return true;
    if (perm?.managerOnly && activeRole === "admin") return true;
    if (perm?.managerOnly && activeRole === "teacher") return true;
    return false;
  }

  function applyLevel(id: PermissionId, next: AccessLevel) {
    const perm = DASHBOARD_PERMISSIONS.find((p) => p.id === id);
    if (perm?.readOnly && next === "write") {
      setAccessLevel(activeRole, id, "read");
      return;
    }
    if (perm?.managerOnly && activeRole === "teacher") {
      setAccessLevel(activeRole, id, "none");
      return;
    }
    setAccessLevel(activeRole, id, next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Peran & izin
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Centang Baca / Tulis per menu · kosong = tidak ada akses
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Kembalikan izin ke pengaturan bawaan?")) {
              resetDefaults();
            }
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E5ECF5] bg-white px-4 py-2.5 text-sm font-medium text-[#5B6B7C] hover:bg-[#F3F7FC] sm:w-auto"
        >
          <RotateCcw className="size-4" />
          Reset bawaan
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["owner", "admin", "teacher"] as StaffRoleKey[]).map((role) => {
          const meta = STAFF_ROLE_META[role];
          const active = activeRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                active
                  ? "border-[#2E7DFF] bg-[#2E7DFF]/10 shadow-sm"
                  : "border-[#E5ECF5] bg-white hover:bg-[#F7FAFD]",
              )}
            >
              <div className="flex items-center gap-2">
                <Shield
                  className={cn(
                    "size-4",
                    active ? "text-[#2E7DFF]" : "text-[#8A96A8]",
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-[#1A2330]" : "text-[#5B6B7C]",
                  )}
                >
                  {meta.label}
                </p>
                {!EDITABLE_ROLES.includes(role) ? (
                  <StatusBadge label="Terkunci" tone="neutral" />
                ) : null}
              </div>
              <p className="mt-1 text-xs text-[#8A96A8]">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#E5ECF5] bg-[#F7FAFD] px-4 py-3 text-sm text-[#5B6B7C]">
        {locked ? (
          <>
            Peran pemilik selalu{" "}
            <strong className="font-medium text-[#1A2330]">Tulis</strong> di
            semua menu.
          </>
        ) : (
          <>
            <strong className="font-medium text-[#1A2330]">READ</strong> = lihat
            saja ·{" "}
            <strong className="font-medium text-[#1A2330]">WRITE</strong> = lihat
            + ubah · tidak dicentang = tidak ada akses. Berlaku untuk{" "}
            <strong className="font-medium text-[#1A2330]">
              {STAFF_ROLE_META[activeRole].label}
            </strong>
            .
          </>
        )}
      </div>

      <div className="space-y-4">
        {groups.map(([group, perms]) => (
          <section
            key={group}
            className="overflow-hidden rounded-2xl border border-[#E5ECF5] bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF3FA] px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0AAB8]">
                {group}
              </h2>
              <div className="flex gap-6 text-[10px] font-medium uppercase tracking-wide text-[#A0AAB8]">
                <span className="w-14 text-center">READ</span>
                <span className="w-14 text-center">WRITE</span>
              </div>
            </div>
            <ul className="divide-y divide-[#EEF3FA]">
              {perms.map((perm) => {
                const level = matrix[activeRole][perm.id];
                const rowLocked = isLockedPermission(perm.id);
                const teacherBlocked =
                  activeRole === "teacher" && !!perm.managerOnly;
                const disabled = rowLocked || teacherBlocked;
                const hasRead = level === "read" || level === "write";
                const hasWrite = level === "write";
                const writeDisabled = disabled || !!perm.readOnly;

                return (
                  <li
                    key={perm.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3",
                      disabled ? "opacity-70" : "",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A2330]">
                        {perm.label}
                      </p>
                      <p className="text-xs text-[#8A96A8]">{perm.href}</p>
                      {teacherBlocked ? (
                        <div className="mt-1">
                          <StatusBadge label="Khusus admin" tone="warning" />
                        </div>
                      ) : null}
                      {perm.readOnly ? (
                        <div className="mt-1">
                          <StatusBadge label="Hanya baca" tone="info" />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-6">
                      <label className="flex w-14 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-[#C5D0DE] text-[#2E7DFF] focus:ring-[#2E7DFF]/30 disabled:cursor-not-allowed"
                          checked={hasRead}
                          disabled={disabled}
                          onChange={(e) => {
                            if (disabled) return;
                            if (e.target.checked) {
                              applyLevel(
                                perm.id,
                                hasWrite ? "write" : "read",
                              );
                            } else {
                              applyLevel(perm.id, "none");
                            }
                          }}
                        />
                        <span className="sr-only">Baca</span>
                      </label>
                      <label className="flex w-14 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-[#C5D0DE] text-[#2E7DFF] focus:ring-[#2E7DFF]/30 disabled:cursor-not-allowed"
                          checked={hasWrite}
                          disabled={writeDisabled}
                          onChange={(e) => {
                            if (writeDisabled) return;
                            if (e.target.checked) {
                              applyLevel(perm.id, "write");
                            } else {
                              applyLevel(perm.id, hasRead ? "read" : "none");
                            }
                          }}
                        />
                        <span className="sr-only">Tulis</span>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
