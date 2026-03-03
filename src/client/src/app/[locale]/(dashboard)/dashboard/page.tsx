"use client";

import Link from "next/link";

import { BarChart3, CheckCircle, Clock, FileText, TrendingUp, Users, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Tổng hồ sơ",
    value: "84",
    change: "+12%",
    icon: FileText,
    color: "text-[#2060df]",
    bgColor: "bg-[#2060df]/10"
  },
  {
    title: "Đang chờ xử lý",
    value: "23",
    change: "+5%",
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  {
    title: "Đã phê duyệt",
    value: "52",
    change: "+18%",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    title: "Từ chối",
    value: "9",
    change: "-3%",
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  }
];

const recentActivities = [
  {
    id: 1,
    action: "đã nộp hồ sơ mới",
    user: "Trần Duy",
    record: "Báo cáo tài chính Q3",
    time: "5 phút trước"
  },
  {
    id: 2,
    action: "đã phê duyệt hồ sơ",
    user: "Admin",
    record: "Đề xuất mua sắm thiết bị IT",
    time: "1 giờ trước"
  },
  {
    id: 3,
    action: "đã từ chối hồ sơ",
    user: "Admin",
    record: "Hợp đồng đối tác ABC",
    time: "2 giờ trước"
  },
  {
    id: 4,
    action: "đã chỉnh sửa hồ sơ",
    user: "Phạm Thúy",
    record: "Kế hoạch marketing Tết",
    time: "3 giờ trước"
  }
];

export default function DashboardPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h2>
        <p className="text-sm text-slate-500 sm:text-base">
          Xin chào! Đây là tổng quan về hệ thống quản lý hành chính.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="order-2 sm:order-1">
                  <p className="mb-1 text-xs text-slate-500 sm:text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                    <TrendingUp className="size-3" />
                    <span
                      className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}
                    >
                      {stat.change}
                    </span>
                    <span>so với tháng trước</span>
                  </p>
                </div>
                <div className={`order-1 self-start rounded-xl p-2 sm:order-2 sm:p-3 ${stat.bgColor}`}>
                  <stat.icon className={`size-5 sm:size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="size-5 text-[#2060df]" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-slate-800"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#2060df]/10 text-[10px] font-bold text-[#2060df]">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                      <span className="font-medium text-[#2060df]">{activity.record}</span>
                    </p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5 text-[#2060df]" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/dashboard/records"
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <FileText className="size-5 text-[#2060df]" />
                <span className="text-sm font-medium">Xem tất cả hồ sơ</span>
              </Link>
              <Link
                href="/dashboard/records/new"
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <FileText className="size-5 text-green-500" />
                <span className="text-sm font-medium">Tạo hồ sơ mới</span>
              </Link>
              <Link
                href="/dashboard/departments"
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Users className="size-5 text-amber-500" />
                <span className="text-sm font-medium">Quản lý phòng ban</span>
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <BarChart3 className="size-5 text-purple-500" />
                <span className="text-sm font-medium">Xem báo cáo</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
