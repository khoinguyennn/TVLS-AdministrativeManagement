'use client';

import {
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Tổng hồ sơ',
    value: '84',
    change: '+12%',
    icon: FileText,
    color: 'text-[#2060df]',
    bgColor: 'bg-[#2060df]/10',
  },
  {
    title: 'Đang chờ xử lý',
    value: '23',
    change: '+5%',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'Đã phê duyệt',
    value: '52',
    change: '+18%',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Từ chối',
    value: '9',
    change: '-3%',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

const recentActivities = [
  {
    id: 1,
    action: 'đã nộp hồ sơ mới',
    user: 'Trần Duy',
    record: 'Báo cáo tài chính Q3',
    time: '5 phút trước',
  },
  {
    id: 2,
    action: 'đã phê duyệt hồ sơ',
    user: 'Admin',
    record: 'Đề xuất mua sắm thiết bị IT',
    time: '1 giờ trước',
  },
  {
    id: 3,
    action: 'đã từ chối hồ sơ',
    user: 'Admin',
    record: 'Hợp đồng đối tác ABC',
    time: '2 giờ trước',
  },
  {
    id: 4,
    action: 'đã chỉnh sửa hồ sơ',
    user: 'Phạm Thúy',
    record: 'Kế hoạch marketing Tết',
    time: '3 giờ trước',
  },
];

export default function DashboardPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h2>
        <p className="text-slate-500">
          Xin chào! Đây là tổng quan về hệ thống quản lý hành chính.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="size-3" />
                    <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                    <span>so với tháng trước</span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="size-5 text-[#2060df]" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                >
                  <div className="size-8 rounded-full bg-[#2060df]/10 flex items-center justify-center text-[10px] font-bold text-[#2060df]">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      {activity.action}{' '}
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
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="size-5 text-[#2060df]" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/dashboard/records"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FileText className="size-5 text-[#2060df]" />
                <span className="text-sm font-medium">Xem tất cả hồ sơ</span>
              </Link>
              <Link
                href="/dashboard/records/new"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FileText className="size-5 text-green-500" />
                <span className="text-sm font-medium">Tạo hồ sơ mới</span>
              </Link>
              <Link
                href="/dashboard/departments"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Users className="size-5 text-amber-500" />
                <span className="text-sm font-medium">Quản lý phòng ban</span>
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
