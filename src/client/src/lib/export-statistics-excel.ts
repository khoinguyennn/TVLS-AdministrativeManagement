import * as XLSX from "xlsx";
import type { StaffStatistics } from "@/services/staff-statistics.service";

const STATUS_LABELS: Record<string, string> = {
  working: "Đang công tác",
  resigned: "Nghỉ việc",
  transferred: "Chuyển công tác",
  maternity_leave: "Nghỉ hậu sản",
  unpaid_leave: "Nghỉ không lương",
};

const FILTER_LABELS: Record<string, string> = {
  all_no_gvhd: "Toàn trường",
  "Giáo viên": "Giáo viên",
  "Nhân viên": "Nhân viên",
  "Giáo viên HĐ": "Giáo viên HĐ",
};

function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  const data = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}

// ═══════ Export: Thống kê nhân sự ═══════
export function exportStaffStatisticsExcel(stats: StaffStatistics) {
  const wb = XLSX.utils.book_new();
  const date = new Date().toLocaleDateString("vi-VN");

  // Sheet 1: Tổng quan
  const overviewData = [
    ["BÁO CÁO THỐNG KÊ NHÂN SỰ"],
    [`Ngày xuất: ${date}`],
    [],
    ["Hạng mục", "Số lượng"],
    ["Tổng nhân sự", stats.total],
    ["Nam", stats.byGender?.male || 0],
    ["Nữ", stats.byGender?.female || 0],
    [],
    ["PHÂN LOẠI THEO VỊ TRÍ", ""],
    ["Giáo viên biên chế", stats.byJobPosition?.["Giáo viên"] || 0],
    ["Giáo viên hợp đồng", stats.byJobPosition?.["Giáo viên HĐ"] || 0],
    ["Nhân viên biên chế", stats.byJobPosition?.["Nhân viên"] || 0],
    [],
    ["BAN GIÁM HIỆU", ""],
    ["Hiệu trưởng", stats.byPositionGroup?.["Hiệu trưởng"] || 0],
    ["Phó hiệu trưởng", stats.byPositionGroup?.["Phó hiệu trưởng"] || 0],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  setColumnWidths(wsOverview, [30, 15]);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");

  // Sheet 2: Tình trạng nhân sự
  const statusData = [
    ["TÌNH TRẠNG NHÂN SỰ"],
    [],
    ["Trạng thái", "Số lượng"],
    ...Object.entries(stats.byStatus).map(([key, count]) => [
      STATUS_LABELS[key] || key,
      count,
    ]),
  ];
  const wsStatus = XLSX.utils.aoa_to_sheet(statusData);
  setColumnWidths(wsStatus, [25, 15]);
  XLSX.utils.book_append_sheet(wb, wsStatus, "Tình trạng");

  // Sheet 3: Tổ bộ môn
  const deptEntries = Object.entries(stats.bySubjectGroup).sort(([, a], [, b]) => b - a);
  const deptTotal = deptEntries.reduce((s, [, c]) => s + c, 0);
  const deptData = [
    ["TỔ BỘ MÔN"],
    [],
    ["Tổ / Bộ phận", "Số lượng", "Tỷ lệ (%)"],
    ...deptEntries.map(([name, count]) => [
      name,
      count,
      deptTotal ? `${((count / deptTotal) * 100).toFixed(1)}%` : "0%",
    ]),
    [],
    ["Tổng cộng", deptTotal, "100%"],
  ];
  const wsDept = XLSX.utils.aoa_to_sheet(deptData);
  setColumnWidths(wsDept, [30, 15, 12]);
  XLSX.utils.book_append_sheet(wb, wsDept, "Tổ bộ môn");

  // Sheet 4: Dân tộc
  const ethData = [
    ["THỐNG KÊ THEO DÂN TỘC"],
    [],
    ["Dân tộc", "Số lượng"],
    ...Object.entries(stats.byEthnicity)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => [name, count]),
  ];
  const wsEth = XLSX.utils.aoa_to_sheet(ethData);
  setColumnWidths(wsEth, [20, 15]);
  XLSX.utils.book_append_sheet(wb, wsEth, "Dân tộc");

  // Sheet 5: Cấp học
  const eduData = [
    ["THỐNG KÊ THEO CẤP HỌC"],
    [],
    ["Cấp học", "Số lượng"],
    ...Object.entries(stats.byEducationLevel)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => [name, count]),
  ];
  const wsEdu = XLSX.utils.aoa_to_sheet(eduData);
  setColumnWidths(wsEdu, [20, 15]);
  XLSX.utils.book_append_sheet(wb, wsEdu, "Cấp học");

  const filename = `thong-ke-nhan-su-${new Date().toISOString().split("T")[0]}.xlsx`;
  saveWorkbook(wb, filename);
}

// ═══════ Export: Thống kê theo độ tuổi ═══════
const AGE_GROUPS = ["20-29", "30-39", "40-49", "50-54", "55-59", "60+"];
const EDU_LEVELS = ["THPT", "THCS", "Tiểu học", "Mầm non"];

export function exportAgeStatisticsExcel(stats: StaffStatistics, filter: string) {
  const wb = XLSX.utils.book_new();
  const date = new Date().toLocaleDateString("vi-VN");
  const filterLabel = FILTER_LABELS[filter] || filter;

  // Sheet 1: Phân bổ độ tuổi
  const ageData = AGE_GROUPS.map((g) => ({
    name: g,
    count: stats.byAgeGroup[g] || 0,
  }));
  const totalAge = ageData.reduce((s, d) => s + d.count, 0);

  const sheet1Data = [
    ["THỐNG KÊ NHÂN SỰ THEO ĐỘ TUỔI"],
    [`Ngày xuất: ${date} | Bộ lọc: ${filterLabel}`],
    [],
    ["Nhóm tuổi", "Số lượng", "Tỷ lệ (%)"],
    ...ageData.map((d) => [
      d.name,
      d.count,
      totalAge ? `${((d.count / totalAge) * 100).toFixed(1)}%` : "0%",
    ]),
    [],
    ["Tổng cộng", totalAge, "100%"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  setColumnWidths(ws1, [15, 15, 12]);
  XLSX.utils.book_append_sheet(wb, ws1, "Phân bổ độ tuổi");

  // Sheet 2: Chi tiết theo cấp học (cross-tab)
  const header = ["Cấp học / Đơn vị", ...AGE_GROUPS, "Tổng cộng"];
  const rows = EDU_LEVELS.map((edu) => {
    const row: (string | number)[] = [edu];
    let total = 0;
    for (const ag of AGE_GROUPS) {
      const ageRow = stats.ageByEducation.find((r) => r.ageGroup === ag);
      const val = (ageRow?.[edu] as number) || 0;
      row.push(val);
      total += val;
    }
    row.push(total);
    return row;
  });

  // Column totals
  const colTotals: (string | number)[] = ["Tổng cộng"];
  let grandTotal = 0;
  for (const ag of AGE_GROUPS) {
    const colSum = rows.reduce((s, r) => s + ((r[AGE_GROUPS.indexOf(ag) + 1] as number) || 0), 0);
    colTotals.push(colSum);
    grandTotal += colSum;
  }
  colTotals.push(grandTotal);

  const sheet2Data = [
    ["CHI TIẾT THEO CẤP HỌC VÀ ĐỘ TUỔI"],
    [`Bộ lọc: ${filterLabel}`],
    [],
    header,
    ...rows,
    [],
    colTotals,
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  setColumnWidths(ws2, [20, ...AGE_GROUPS.map(() => 10), 12]);
  XLSX.utils.book_append_sheet(wb, ws2, "Chi tiết cấp học");

  const filename = `thong-ke-do-tuoi-${filterLabel.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`;
  saveWorkbook(wb, filename);
}
