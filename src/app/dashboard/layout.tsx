import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { ClassActivityProvider } from "@/components/dashboard/ClassActivityProvider";
import { ClassesProvider } from "@/components/dashboard/ClassesProvider";
import { DayOffProvider } from "@/components/dashboard/DayOffProvider";
import { KasProvider } from "@/components/dashboard/KasProvider";
import { ParentsProvider } from "@/components/dashboard/ParentsProvider";
import { RegistrationProvider } from "@/components/dashboard/RegistrationProvider";
import { StudentsProvider } from "@/components/dashboard/StudentsProvider";
import { TeachersProvider } from "@/components/dashboard/TeachersProvider";
import { StaffSessionProvider } from "@/components/dashboard/StaffSessionProvider";
import { RolePermissionsProvider } from "@/components/dashboard/RolePermissionsProvider";
import { DashboardRoleGuard } from "@/components/dashboard/DashboardRoleGuard";
import { HydrateOpsRegistry } from "@/components/dashboard/HydrateOpsRegistry";
import { getSession } from "@/lib/auth";
import * as roster from "@/lib/data/roster";
import * as ops from "@/lib/data/ops";
import * as finance from "@/lib/data/finance";
import * as events from "@/lib/data/events";
import * as rolePerms from "@/lib/data/role-permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession("staff");
  if (!session) {
    redirect("/login");
  }

  const [
    teachers,
    classes,
    students,
    parents,
    dayOffs,
    activities,
    kas,
    rolePermissions,
    registrations,
    presence,
    tuition,
    reports,
    schoolEvents,
  ] = await Promise.all([
    roster.listTeachers(),
    roster.listClasses(),
    roster.listStudents(),
    roster.listParents(),
    ops.listDayOffs(),
    ops.listActivities(),
    finance.listKas(),
    rolePerms.getRolePermissionMatrix(),
    events.listRegistrations(),
    ops.listPresence(),
    finance.listTuition(),
    ops.listReports(),
    events.listEvents(),
  ]);

  return (
    <StaffSessionProvider session={session}>
      <RolePermissionsProvider initial={rolePermissions}>
        <KasProvider initial={kas}>
          <DayOffProvider initial={dayOffs}>
            <ParentsProvider initial={parents}>
              <TeachersProvider initial={teachers}>
                <ClassesProvider initial={classes}>
                  <StudentsProvider initial={students}>
                    <RegistrationProvider initial={registrations}>
                      <ClassActivityProvider initial={activities}>
                        <HydrateOpsRegistry
                          presence={presence}
                          tuition={tuition}
                          reports={reports}
                          events={schoolEvents}
                        />
                        <div className="dashboard-shell flex h-dvh flex-col overflow-hidden bg-[#F3F7FC] font-[family-name:var(--font-outfit)] font-light text-[#1A2330] lg:flex-row">
                          <DashboardSidebar />
                          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                            <DashboardTopBar />
                            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                              <div className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                                <DashboardRoleGuard>
                                  {children}
                                </DashboardRoleGuard>
                              </div>
                            </main>
                          </div>
                        </div>
                      </ClassActivityProvider>
                    </RegistrationProvider>
                  </StudentsProvider>
                </ClassesProvider>
              </TeachersProvider>
            </ParentsProvider>
          </DayOffProvider>
        </KasProvider>
      </RolePermissionsProvider>
    </StaffSessionProvider>
  );
}
