import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { ClassActivityProvider } from "@/components/dashboard/ClassActivityProvider";
import { DayOffProvider } from "@/components/dashboard/DayOffProvider";
import { KasProvider } from "@/components/dashboard/KasProvider";
import { RegistrationProvider } from "@/components/dashboard/RegistrationProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KasProvider>
      <DayOffProvider>
        <RegistrationProvider>
          <ClassActivityProvider>
            <div className="dashboard-shell flex min-h-screen bg-[#F3F7FC] font-[family-name:var(--font-outfit)] font-light text-[#1A2330]">
              <DashboardSidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <DashboardTopBar />
                <main className="min-w-0 flex-1">
                  <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </ClassActivityProvider>
        </RegistrationProvider>
      </DayOffProvider>
    </KasProvider>
  );
}
