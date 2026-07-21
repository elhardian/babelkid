import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { KasProvider } from "@/components/dashboard/KasProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KasProvider>
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        <DashboardSidebar />
        <main className="flex-1 overflow-x-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </KasProvider>
  );
}
