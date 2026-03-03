import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />
      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <DashboardHeader />
        <div className="mx-auto w-full max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
