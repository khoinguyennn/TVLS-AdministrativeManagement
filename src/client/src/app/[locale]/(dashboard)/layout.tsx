import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
