"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Download, Info, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  staffStatisticsService,
  type StaffStatistics,
} from "@/services/staff-statistics.service";

// ── Constants ──
const AGE_GROUPS = ["20-29", "30-39", "40-49", "50-54", "55-59", "60+"];

const BAR_COLORS = ["#bfdbfe", "#2563eb", "#93c5fd", "#b9c7df", "#c3c6d7", "#e2e8f0"];

const EDU_LEVELS = ["THPT", "THCS", "Tiểu học", "Mầm non"];

const FILTER_OPTIONS = [
  { value: "all_no_gvhd", label: "Toàn trường" },
  { value: "Giáo viên", label: "Giáo viên" },
  { value: "Nhân viên", label: "Nhân viên" },
  { value: "Giáo viên HĐ", label: "Giáo viên HĐ" },
];

export default function AgeStatisticsPage() {
  const [stats, setStats] = useState<StaffStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all_no_gvhd");

  const fetchStats = useCallback(async (jobPosition: string) => {
    try {
      setLoading(true);
      const res = await staffStatisticsService.getStatistics(jobPosition);
      if (res.data) setStats(res.data);
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(filter);
  }, [fetchStats, filter]);

  // ── Derived data ──
  const ageData = useMemo(() => {
    if (!stats) return [];
    return AGE_GROUPS.map((name) => ({
      name,
      value: stats.byAgeGroup[name] || 0,
    }));
  }, [stats]);

  const totalAge = useMemo(() => ageData.reduce((s, d) => s + d.value, 0), [ageData]);

  // Most common age group
  const mostCommon = useMemo(() => {
    if (!ageData.length) return { name: "-", value: 0, pct: 0 };
    const max = ageData.reduce((a, b) => (a.value >= b.value ? a : b));
    return { ...max, pct: totalAge ? ((max.value / totalAge) * 100).toFixed(1) : 0 };
  }, [ageData, totalAge]);

  // Education cross-tab
  const eduByAge = useMemo(() => {
    if (!stats) return [];
    return EDU_LEVELS.map((edu) => {
      const row: Record<string, string | number> = { name: edu };
      let total = 0;
      for (const ag of AGE_GROUPS) {
        const ageRow = stats.ageByEducation.find((r) => r.ageGroup === ag);
        const val = (ageRow?.[edu] as number) || 0;
        row[ag] = val;
        total += val;
      }
      row["total"] = total;
      return row;
    });
  }, [stats]);

  // Column totals
  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const ag of AGE_GROUPS) {
      totals[ag] = eduByAge.reduce((s, r) => s + ((r[ag] as number) || 0), 0);
    }
    totals["total"] = Object.values(totals).reduce((s, v) => s + v, 0);
    return totals;
  }, [eduByAge]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header + Filter Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Thống kê nhân sự theo độ tuổi</h1>
          <p className="text-sm text-muted-foreground">
            Dữ liệu cập nhật dựa trên hệ thống quản lý nhân sự tập trung
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                filter === opt.value
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ Section 1: Chart + Summary Cards ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Biểu đồ phân bổ độ tuổi
              </h2>
              <span className="text-xs font-medium px-3 py-1 bg-muted rounded-full text-muted-foreground">
                Đơn vị: Nhân sự
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [value, "Nhân sự"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  label={{ position: "top", fontSize: 12, fontWeight: "bold" }}
                >
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="flex flex-col gap-6">
          {/* Total Card — Blue */}
          <div className="bg-primary text-primary-foreground flex-1 p-6 rounded-xl flex flex-col justify-center items-center">
            <span className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">
              Tổng số nhân sự
            </span>
            <div className="text-5xl font-bold">{totalAge}</div>
            <div className="mt-4 px-3 py-1 bg-white/10 rounded-full text-[10px] font-medium uppercase tracking-wider">
              Cập nhật hôm nay
            </div>
          </div>

          {/* Most Common Age Card */}
          <Card className="flex-1 bg-muted/50">
            <CardContent className="p-6 flex flex-col justify-center items-center h-full">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Độ tuổi phổ biến
              </span>
              <div className="text-3xl font-bold">
                {mostCommon.name}
              </div>
              <div className="mt-4 text-xs font-medium text-primary flex items-center gap-1">
                <TrendingUp className="size-3.5" />
                {mostCommon.pct}% Tổng số
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══════ Section 2: Detailed Table ═══════ */}
      <Card className="shadow-sm overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-muted-foreground/60 rounded-full" />
            Thống kê chi tiết theo cấp học
          </h2>
          <button className="flex items-center gap-2 text-sm text-primary font-medium px-4 py-2 hover:bg-muted rounded-lg transition-all">
            <Download className="size-4" />
            Xuất dữ liệu Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="py-5 px-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Cấp học / Đơn vị
                </th>
                {AGE_GROUPS.map((ag) => (
                  <th key={ag} className="py-5 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                    {ag.replace("-", " - ").replace("+", " +")}
                  </th>
                ))}
                <th className="py-5 px-8 text-xs font-bold text-primary uppercase tracking-widest text-right">
                  Tổng cộng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {eduByAge.map((row) => (
                <tr key={row.name as string} className="hover:bg-muted/30 transition-colors">
                  <td className="py-5 px-8 font-semibold text-sm">{row.name as string}</td>
                  {AGE_GROUPS.map((ag) => {
                    const val = (row[ag] as number) || 0;
                    return (
                      <td
                        key={ag}
                        className={`py-5 px-4 text-sm text-center ${
                          val === 0 ? "text-muted-foreground/30" : ""
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="py-5 px-8 text-sm font-bold text-right text-primary">
                    {row.total as number}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted font-bold">
                <td className="py-6 px-8 text-sm">Tổng cộng</td>
                {AGE_GROUPS.map((ag) => (
                  <td key={ag} className="py-6 px-4 text-sm text-center">
                    {colTotals[ag]}
                  </td>
                ))}
                <td className="py-6 px-8 text-lg text-right text-primary">
                  {colTotals.total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* ═══════ Section 3: Insight Cards ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-muted/30 border">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Nhận xét chuyên môn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cơ cấu nhân sự tập trung chủ yếu ở độ tuổi vàng (30-49 tuổi). Đây là nguồn lực
                giàu kinh nghiệm và đang trong giai đoạn cống hiến cao nhất cho nhà trường.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Dự báo nhân sự</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tỷ lệ nhân sự trẻ (dưới 30 tuổi) cần được chú trọng tuyển dụng thêm trong giai
                đoạn tới để đảm bảo tính kế thừa liên tục cho các cấp học.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
