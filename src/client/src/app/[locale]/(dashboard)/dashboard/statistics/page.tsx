"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { Download, Users, GraduationCap, BadgeCheck, Crown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  staffStatisticsService,
  type StaffStatistics,
} from "@/services/staff-statistics.service";
import { exportStaffStatisticsExcel } from "@/lib/export-statistics-excel";
import { toast } from "sonner";

// ── Color configs ──
const STATUS_CONFIG: { key: string; label: string; border: string; bg: string; text: string }[] = [
  { key: "working", label: "Đang công tác", border: "border-blue-100", bg: "bg-blue-50/50", text: "text-blue-700" },
  { key: "resigned", label: "Nghỉ việc", border: "border-red-100", bg: "bg-red-50/50", text: "text-red-700" },
  { key: "transferred", label: "Chuyển công tác", border: "border-orange-100", bg: "bg-orange-50/50", text: "text-orange-700" },
  { key: "maternity_leave", label: "Nghỉ hậu sản", border: "border-pink-100", bg: "bg-pink-50/50", text: "text-pink-700" },
  { key: "unpaid_leave", label: "Nghỉ không lương", border: "border-slate-200", bg: "bg-slate-50/50", text: "text-slate-400" },
];

const EDU_CONFIG = [
  { key: "Mầm non", color: "border-blue-500", barBg: "bg-blue-100", barFill: "bg-blue-500" },
  { key: "Tiểu học", color: "border-emerald-500", barBg: "bg-emerald-100", barFill: "bg-emerald-500" },
  { key: "THCS", color: "border-orange-500", barBg: "bg-orange-100", barFill: "bg-orange-500" },
  { key: "THPT", color: "border-purple-500", barBg: "bg-purple-100", barFill: "bg-purple-500" },
];

const ETHNICITY_COLORS = ["bg-blue-500", "bg-orange-400", "bg-emerald-400", "bg-violet-400", "bg-rose-400", "bg-amber-400"];

export default function StatisticsPage() {
  const t = useTranslations("Statistics");
  const [stats, setStats] = useState<StaffStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllDepts, setShowAllDepts] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffStatisticsService.getStatistics();
      if (res.data) setStats(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Derived data ──
  const deptData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.bySubjectGroup)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const ethnicityData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byEthnicity)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const maxEthnicityCount = useMemo(() => {
    return ethnicityData.length ? ethnicityData[0].count : 1;
  }, [ethnicityData]);

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

  const total = stats.total;
  const working = stats.byStatus["working"] || 0;
  const resigned = stats.byStatus["resigned"] || 0;
  const transferred = stats.byStatus["transferred"] || 0;
  const maternityLeave = stats.byStatus["maternity_leave"] || 0;
  const unpaidLeave = stats.byStatus["unpaid_leave"] || 0;

  // Count by job position type
  const gvBienChe = stats.byJobPosition?.["Giáo viên"] || 0;
  const gvHopDong = stats.byJobPosition?.["Giáo viên HĐ"] || 0;
  const nvBienChe = stats.byJobPosition?.["Nhân viên"] || 0;

  // CBQL consists of Principal and Vice Principal in Position Group
  const hieuTruong = stats.byPositionGroup?.["Hiệu trưởng"] || 0;
  const phoHieuTruong = stats.byPositionGroup?.["Phó hiệu trưởng"] || 0;
  const cbql = hieuTruong + phoHieuTruong;

  const visibleDepts = showAllDepts ? deptData : deptData.slice(0, 5);
  const remainingDepts = deptData.length > 5 && !showAllDepts ? deptData.slice(5) : [];
  const remainingCount = remainingDepts.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description", { date: new Date().toLocaleDateString() })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!stats) return;
              try {
                exportStaffStatisticsExcel(stats);
                toast.success("Xuất báo cáo thành công!");
              } catch {
                toast.error("Lỗi khi xuất báo cáo");
              }
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
          >
            <Download className="size-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── Row 1: 4 Bento Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Staff - Blue hero card */}
        <div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Users className="size-5 opacity-80" />
              <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-full">{t("overall")}</span>
            </div>
            <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">{t("totalStaff")}</h3>
            <div className="text-4xl font-bold mt-2">{total}</div>
            <div className="flex gap-4 mt-4 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300" /> {t("male")}: {stats.byGender?.male || 0}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-300" /> {t("female")}: {stats.byGender?.female || 0}</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 transition-transform group-hover:scale-[1.7]">
            <Users className="size-28" />
          </div>
        </div>

        {/* Teachers */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
                <GraduationCap className="size-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{t("teachers")}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-muted-foreground text-sm">{t("tenured")}</span>
                <span className="text-xl font-bold">{gvBienChe}</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${total ? Math.min((gvBienChe / total) * 100, 100) : 0}%` }} />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-muted-foreground text-sm">{t("contract")}</span>
                <span className="text-xl font-bold">{gvHopDong}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
                <BadgeCheck className="size-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">{t("staff")}</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">{t("tenured")}</span>
                <span className="text-sm font-bold">{nvBienChe}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">{t("regionalSalary")}</span>
                <span className="text-sm font-bold">{stats.byContractType?.["Hợp đồng lương vùng theo Nghị định 74/2024/NĐ-CP"] || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">{t("contract")}</span>
                <span className="text-sm font-bold">{stats.byContractType?.["Hợp đồng khoán"] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management */}
        <Card className="hover:border-primary/30 transition-all flex flex-col justify-between bg-muted/30">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground mb-2">{t("managementBoard")}</h3>
            <div className="text-3xl font-bold">{cbql}</div>
            <div className="flex -space-x-3 mt-4">
              <Crown className="size-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Tình trạng nhân sự + Dân tộc ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personnel Status */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-bold">{t("personnelStatus")}</h3>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{t("currentMonth")}</span>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {STATUS_CONFIG.map((s) => {
                const val = s.key === "working" ? working :
                  s.key === "resigned" ? resigned :
                    s.key === "transferred" ? transferred :
                      s.key === "maternity_leave" ? maternityLeave :
                        unpaidLeave;
                return (
                  <div key={s.key} className={`text-center p-4 rounded-xl border ${s.border} ${s.bg}`}>
                    <div className={`text-2xl font-bold ${s.text}`}>{val}</div>
                    <div className={`text-[11px] font-bold uppercase mt-1 ${s.text} leading-tight`}>{t(`status.${s.key}`)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ethnicity Stats */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-bold">{t("ethnicityStats")}</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            {ethnicityData.slice(0, 3).map((e, i) => (
              <div key={e.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{e.name}</span>
                  <span className="font-bold">{e.count}</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className={`${ETHNICITY_COLORS[i % ETHNICITY_COLORS.length]} h-full rounded-full transition-all`}
                    style={{ width: `${(e.count / maxEthnicityCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {ethnicityData.length > 3 && (
              <div className="flex items-center justify-between text-sm pt-2">
                <div className="flex items-center gap-4">
                  {ethnicityData.slice(3).map((e) => (
                    <div key={e.name}>
                      <span className="text-muted-foreground">{e.name}:</span>
                      <span className="font-semibold ml-1">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Tổ bộ môn Table + Thống kê cấp học ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Departments Table */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-bold uppercase tracking-tight text-sm">
              {t("departmentList", { count: deptData.length })}
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">{t("department")}</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-right">{t("quantity")}</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">{t("ratio")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleDepts.map((d) => (
                  <tr key={d.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium">{d.name}</td>
                    <td className="px-6 py-3 text-right font-bold text-primary">{d.count}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                        <span
                          className="block bg-primary h-full rounded-full"
                          style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
                {!showAllDepts && remainingDepts.length > 0 && (
                  <tr className="hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium text-muted-foreground">
                      {t("other", { count: remainingDepts.length })}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-primary">{remainingCount}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                        <span
                          className="block bg-muted-foreground/40 h-full rounded-full"
                          style={{ width: `${total ? (remainingCount / total) * 100 : 0}%` }}
                        />
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-muted/30 text-center border-t">
            <button
              onClick={() => setShowAllDepts(!showAllDepts)}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
            >
              {showAllDepts ? t("collapse") : t("viewAll")}
            </button>
          </div>
        </Card>

        {/* Education Level Stats */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
            <h3 className="font-bold text-sm">{t("educationLevelStats")}</h3>
          </div>
          <CardContent className="p-8 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-8">
              {EDU_CONFIG.map((edu) => {
                const count = stats.byEducationLevel[edu.key] || 0;
                const maxEdu = Math.max(...Object.values(stats.byEducationLevel), 1);
                const pct = (count / maxEdu) * 100;
                return (
                  <div key={edu.key} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full border-4 ${edu.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                      {count}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{edu.key}</p>
                      <div className={`w-24 h-1.5 ${edu.barBg} rounded-full mt-1 overflow-hidden`}>
                        <div className={`${edu.barFill} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Mini bar chart decoration */}
            <div className="mt-12 h-24 relative flex items-end justify-between gap-1 px-4">
              {EDU_CONFIG.map((edu) => {
                const count = stats.byEducationLevel[edu.key] || 0;
                const maxEdu = Math.max(...Object.values(stats.byEducationLevel), 1);
                const pct = Math.max((count / maxEdu) * 100, 5);
                return (
                  <div key={edu.key} className={`w-full ${edu.barFill} rounded-t-sm transition-all`} style={{ height: `${pct}%` }} />
                );
              })}
              {[40, 60, 30, 55, 45, 80].map((h, i) => (
                <div key={`deco-${i}`} className="w-full bg-muted rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
