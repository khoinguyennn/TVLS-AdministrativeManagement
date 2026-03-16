"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  AlertTriangle,
  Building2,
  CalendarOff,
  ClipboardList,
  FileText,
  Fingerprint,
  Monitor,
  Settings,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { DashboardCarousel } from "@/components/dashboard/DashboardCarousel";

// ── Quick action definitions per role ──
const allQuickActions = [
  { href: "/dashboard/users", labelKey: "manageUsers", icon: Users, color: "text-primary", roles: ["admin"] },
  { href: "/dashboard/staff", labelKey: "staffProfiles", icon: FileText, color: "text-violet-500", roles: ["admin", "manager"] },
  { href: "/dashboard/work-orders", labelKey: "workOrders", icon: ClipboardList, color: "text-blue-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/buildings", labelKey: "manageBuildings", icon: Building2, color: "text-orange-500", roles: ["admin", "manager"] },
  { href: "/dashboard/devices", labelKey: "manageDevices", icon: Monitor, color: "text-cyan-500", roles: ["admin", "manager"] },
  { href: "/dashboard/device-reports", labelKey: "deviceReports", icon: AlertTriangle, color: "text-amber-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/leave-requests", labelKey: "leaveManagement", icon: CalendarOff, color: "text-rose-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/digital-signatures", labelKey: "digitalSignatures", icon: Fingerprint, color: "text-emerald-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings, color: "text-slate-500", roles: ["admin", "manager", "teacher", "technician"] },
];

export default function DashboardPage() {
  const tHome = useTranslations("DashboardHome");
  const { user } = useAuth();
  const tSidebar = useTranslations("Sidebar");
  const userRole = user?.role || "";

  const quickActions = allQuickActions
    .filter((a) => a.roles.includes(userRole))
    .map((action) => ({
      ...action,
      label: action.labelKey === "settings" ? tSidebar("settings") : tHome(action.labelKey),
    }));

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return tHome("goodMorning");
            if (hour < 18) return tHome("goodAfternoon");
            return tHome("goodEvening");
          })()}, {user?.fullName || "User"}! 👋
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          {(() => {
            const now = new Date();
            const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
            const dayName = days[now.getDay()];
            const dateStr = now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
            return tHome("todayIs", { date: `${dayName}, ${dateStr}` });
          })()}
        </p>
      </div>

      <DashboardCarousel />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{tHome("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="rounded-lg bg-muted p-2.5">
                  <action.icon className={`size-5 ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-foreground sm:text-sm">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
