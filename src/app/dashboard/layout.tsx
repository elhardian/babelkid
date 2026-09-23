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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KasProvider>
      <DayOffProvider>
        <ParentsProvider>
          <TeachersProvider>
            <ClassesProvider>
              <StudentsProvider>
                <RegistrationProvider>
                  <ClassActivityProvider>
                    <div className="dashboard-shell flex min-h-screen flex-col overflow-x-hidden bg-[#F3F7FC] font-[family-name:var(--font-outfit)] font-light text-[#1A2330] lg:flex-row">
                      <DashboardSidebar />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <DashboardTopBar />
                        <main className="min-w-0 flex-1 overflow-x-hidden">
                          <div className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                            {children}
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
  );
}
