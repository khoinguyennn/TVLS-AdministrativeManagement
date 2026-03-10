"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  AlertTriangle,
  Building2,
  CalendarOff,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  Fingerprint,
  Monitor,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { deviceReportService } from "@/services/device-report.service";
import { leaveRequestService } from "@/services/leave.service";

// ── Types ──
interface DashboardStats {
  deviceReports: { total: number; pending: number; repairing: number; completed: number };
  leaveRequests: { total: number; pending: number; approved: number; rejected: number };
}

// ── Quick action definitions per role ──
const allQuickActions = [
  { href: "/dashboard/users", label: "Quản lý người dùng", icon: Users, color: "text-primary", roles: ["admin"] },
  { href: "/dashboard/staff", label: "Hồ sơ nhân sự", icon: FileText, color: "text-violet-500", roles: ["admin", "manager"] },
  { href: "/dashboard/work-orders", label: "Quản lý công lệnh", icon: ClipboardList, color: "text-blue-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/buildings", label: "Quản lý tòa nhà", icon: Building2, color: "text-orange-500", roles: ["admin", "manager"] },
  { href: "/dashboard/devices", label: "Quản lý thiết bị", icon: Monitor, color: "text-cyan-500", roles: ["admin", "manager"] },
  { href: "/dashboard/device-reports", label: "Phiếu báo hỏng", icon: AlertTriangle, color: "text-amber-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/leave-requests", label: "Quản lý nghỉ phép", icon: CalendarOff, color: "text-rose-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/digital-signatures", label: "Chữ ký số", icon: Fingerprint, color: "text-emerald-500", roles: ["admin", "manager", "teacher", "technician"] },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings, color: "text-slate-500", roles: ["admin", "manager", "teacher", "technician"] },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations("Sidebar");
  const userRole = user?.role || "";

  const [stats, setStats] = useState<DashboardStats>({
    deviceReports: { total: 0, pending: 0, repairing: 0, completed: 0 },
    leaveRequests: { total: 0, pending: 0, approved: 0, rejected: 0 },
  });

  const fetchStats = useCallback(async () => {
    try {
      const [drRes, lrRes] = await Promise.all([
        deviceReportService.getStats(),
        leaveRequestService.getStats(),
      ]);
      setStats({
        deviceReports: drRes.data,
        leaveRequests: lrRes.data,
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const quickActions = allQuickActions.filter((a) => a.roles.includes(userRole));

  // ── Role label ──
  const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    manager: "Cán bộ quản lý",
    teacher: "Giáo viên",
    technician: "Kỹ thuật viên",
  };

  // ── Stat cards based on role ──
  const statCards = [
    ...(["admin", "manager", "technician"].includes(userRole)
      ? [
          {
            title: "Phiếu báo hỏng",
            value: stats.deviceReports.total,
            icon: AlertTriangle,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
          {
            title: "Chờ tiếp nhận",
            value: stats.deviceReports.pending,
            icon: Clock,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
          },
          {
            title: "Đang sửa chữa",
            value: stats.deviceReports.repairing,
            icon: Wrench,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            title: "Đã hoàn thành",
            value: stats.deviceReports.completed,
            icon: CheckCircle,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
          },
        ]
      : []),
    ...(["admin", "manager", "teacher"].includes(userRole)
      ? [
          {
            title: "Đơn nghỉ phép",
            value: stats.leaveRequests.total,
            icon: CalendarOff,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
          },
          {
            title: "Chờ duyệt",
            value: stats.leaveRequests.pending,
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
          {
            title: "Đã duyệt",
            value: stats.leaveRequests.approved,
            icon: CheckCircle,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Chào buổi sáng";
            if (hour < 18) return "Chào buổi chiều";
            return "Chào buổi tối";
          })()}, {user?.fullName || "Người dùng"}! 👋
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          {(() => {
            const now = new Date();
            const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
            const dayName = days[now.getDay()];
            const dateStr = now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
            return `Hôm nay là ${dayName}, ${dateStr}`;
          })()}{" "}
          - Chúc thầy/cô một ngày làm việc hiệu quả!
        </p>
      </div>

      {/* Stats Cards */}
      {statCards.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground sm:text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-2 sm:p-3 ${stat.bgColor}`}>
                    <stat.icon className={`size-5 sm:size-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Thao tác nhanh</CardTitle>
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
