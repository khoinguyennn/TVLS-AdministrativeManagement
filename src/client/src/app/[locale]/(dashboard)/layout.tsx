"use client";

import { useEffect, useState } from "react";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { authStorage } from "@/lib/auth-storage";
import { userService } from "@/services/user.service";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync latest profile from server to localStorage on dashboard mount
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          authStorage.setUser({
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.fullName,
            role: response.data.role,
            avatar: response.data.avatar
          });
        }
      } catch {
        // Ignore - user data will come from localStorage
      }
    };
    syncProfile();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
