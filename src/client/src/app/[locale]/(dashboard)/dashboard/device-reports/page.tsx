"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit,
  Eye,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Settings2,
  Trash2,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Textarea } from "@/ui/textarea";

import { env } from "@/env";
import {
  deviceReportService,
  type CreateDeviceReportPayload,
  type UpdateDeviceReportPayload,
} from "@/services/device-report.service";
import { deviceService, type DeviceItem } from "@/services/device.service";
import { adminUserService } from "@/services/admin-user.service";
import type { DeviceReport, DeviceReportStats } from "@/types/device-report.types";
import type { User } from "@/types/auth.types";

// ── Constants ──
const STATUSES = [
  "pending", "received", "repairing", "repaired",
  "waiting_replacement", "unfixable", "recheck_required", "completed",
] as const;
const PAGE_SIZE = 8;

// ── Status badge colours (matching HTML template) ──
const statusBadgeClass: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  received:
    "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 border-sky-100 dark:border-sky-800",
  repairing:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  repaired:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  waiting_replacement:
    "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800",
  unfixable:
    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  recheck_required:
    "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-800",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
};

// ── Helpers ──
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarUrl(src?: string | null) {
  if (!src) return undefined;
  if (src.startsWith("blob:") || src.startsWith("http")) return src;
  return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ═══════════════════════════════════════════════════════════
export default function DeviceReportsPage() {
  const t = useTranslations("DeviceReport");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");

  // ── Data state ──
  const [reports, setReports] = useState<DeviceReport[]>([]);
  const [stats, setStats] = useState<DeviceReportStats>({ total: 0, pending: 0, repairing: 0, completed: 0 });
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dialog state ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DeviceReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<DeviceReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState<DeviceReport | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Form state ──
  const [formDeviceId, setFormDeviceId] = useState<string>("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("pending");
  const [formAssignedTo, setFormAssignedTo] = useState<string>("");
  const [formTechnicianNote, setFormTechnicianNote] = useState("");

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes, devicesRes, usersRes] = await Promise.all([
        deviceReportService.getAll(),
        deviceReportService.getStats(),
        deviceService.getAll(),
        adminUserService.getAll(),
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
      setDevices(devicesRes.data);
      // Filter technicians from user list
      setTechnicians(usersRes.data.filter((u) => u.role === "technician"));
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered & paginated data ──
  const filteredReports = useMemo(() => {
    let result = reports;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.device?.name && r.device.name.toLowerCase().includes(q)) ||
          (r.reporter?.fullName && r.reporter.fullName.toLowerCase().includes(q)) ||
          r.description.toLowerCase().includes(q) ||
          String(r.id).includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    return result;
  }, [reports, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Open create dialog ──
  const handleOpenCreate = useCallback(() => {
    setEditingReport(null);
    setFormDeviceId("");
    setFormDescription("");
    setFormImageFile(null);
    setFormImagePreview("");
    setFormStatus("pending");
    setFormAssignedTo("");
    setFormTechnicianNote("");
    setDialogOpen(true);
  }, []);

  // ── Open edit dialog ──
  const handleOpenEdit = useCallback((report: DeviceReport) => {
    setEditingReport(report);
    setFormDeviceId(String(report.deviceId));
    setFormDescription(report.description);
    setFormImageFile(null);
    setFormImagePreview(report.imageUrl ? getAvatarUrl(report.imageUrl) || "" : "");
    setFormStatus(report.status);
    setFormAssignedTo(report.assignedTo ? String(report.assignedTo) : "");
    setFormTechnicianNote(report.technicianNote || "");
    setDialogOpen(true);
  }, []);

  // ── View detail ──
  const handleView = useCallback((report: DeviceReport) => {
    setViewingReport(report);
    setViewDialogOpen(true);
  }, []);

  // ── Submit create / edit ──
  const handleSubmit = useCallback(async () => {
    try {
      setFormLoading(true);

      if (editingReport) {
        const payload: UpdateDeviceReportPayload = {};
        if (formDescription !== editingReport.description) payload.description = formDescription;
        if (formImageFile) payload.image = formImageFile;
        if (formStatus !== editingReport.status) payload.status = formStatus as DeviceReport["status"];
        if (formTechnicianNote !== (editingReport.technicianNote || "")) payload.technicianNote = formTechnicianNote;

        const assignedToNum = formAssignedTo ? Number(formAssignedTo) : undefined;
        if (assignedToNum !== (editingReport.assignedTo || undefined)) {
          payload.assignedTo = assignedToNum;
        }

        if (Object.keys(payload).length === 0) {
          setDialogOpen(false);
          return;
        }

        await deviceReportService.update(editingReport.id, payload);
        toast.success(t("toast.updateSuccess"));
      } else {
        const payload: CreateDeviceReportPayload = {
          deviceId: Number(formDeviceId),
          description: formDescription,
        };
        if (formImageFile) payload.image = formImageFile;

        await deviceReportService.create(payload);
        toast.success(t("toast.createSuccess"));
      }

      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [editingReport, formDeviceId, formDescription, formImageFile, formStatus, formAssignedTo, formTechnicianNote, fetchData, t]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!deletingReport) return;
    try {
      setFormLoading(true);
      await deviceReportService.delete(deletingReport.id);
      toast.success(t("toast.deleteSuccess"));
      setDeleteDialogOpen(false);
      setDeletingReport(null);
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [deletingReport, fetchData, t]);

  // ── Pagination helpers ──
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // ── Stat cards config ──
  const statCards = [
    {
      label: t("stats.total"),
      value: stats.total,
      icon: <FileText className="size-5" />,
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-300",
    },
    {
      label: t("stats.pending"),
      value: stats.pending,
      icon: <Clock className="size-5" />,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600",
    },
    {
      label: t("stats.repairing"),
      value: stats.repairing,
      icon: <Settings2 className="size-5" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600",
    },
    {
      label: t("stats.completed"),
      value: stats.completed,
      icon: <CheckCircle2 className="size-5" />,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600",
    },
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("deviceReports")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t("addReport")}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${card.bg} ${card.text}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
          </div>
        ) : paginatedReports.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            {t("noResults")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.id")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.device")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.reporter")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.assignee")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.date")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                    {/* ID */}
                    <TableCell className="px-6 py-4 text-sm font-semibold text-primary">
                      #{report.id}
                    </TableCell>

                    {/* Device */}
                    <TableCell className="px-6 py-4">
                      <div className="text-sm font-medium">{report.device?.name || "-"}</div>
                    </TableCell>

                    {/* Reporter */}
                    <TableCell className="px-6 py-4">
                      {report.reporter ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={getAvatarUrl(report.reporter.avatar)} alt={report.reporter.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {getInitials(report.reporter.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">{report.reporter.fullName}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Assignee */}
                    <TableCell className="px-6 py-4">
                      {report.assignee ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={getAvatarUrl(report.assignee.avatar)} alt={report.assignee.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {getInitials(report.assignee.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">{report.assignee.fullName}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{t("form.noAssignee")}</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className={statusBadgeClass[report.status] || ""}>
                        {t(`statuses.${report.status}`)}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleView(report)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenEdit(report)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingReport(report);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t("pagination.showing")} {(currentPage - 1) * PAGE_SIZE + 1}{" "}
                {t("pagination.to")}{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredReports.length)}{" "}
                {t("pagination.of")} {filteredReports.length} {t("pagination.reports")}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    className="h-8 min-w-8 px-3 text-xs font-semibold"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── View Detail Dialog ── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" />
              #{viewingReport?.id}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("columns.device")}</p>
                  <p className="text-sm font-semibold">{viewingReport.device?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("columns.status")}</p>
                  <Badge variant="outline" className={statusBadgeClass[viewingReport.status] || ""}>
                    {t(`statuses.${viewingReport.status}`)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("columns.reporter")}</p>
                  <p className="text-sm">{viewingReport.reporter?.fullName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("columns.assignee")}</p>
                  <p className="text-sm">{viewingReport.assignee?.fullName || t("form.noAssignee")}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.description")}</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{viewingReport.description}</p>
              </div>
              {viewingReport.technicianNote && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.technicianNote")}</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{viewingReport.technicianNote}</p>
                </div>
              )}
              {viewingReport.imageUrl && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.image")}</p>
                  <Image src={getAvatarUrl(viewingReport.imageUrl) || ""} alt="Report" width={400} height={192} className="rounded-lg max-h-48 object-contain" unoptimized />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">{t("columns.date")}:</span> {formatDate(viewingReport.createdAt)}
                </div>
                {viewingReport.confirmedAt && (
                  <div>
                    <span className="font-medium">Confirmed:</span> {formatDate(viewingReport.confirmedAt)}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("form.cancel")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? t("editReport") : t("addReport")}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Device (only for create) */}
            {!editingReport && (
              <div className="grid gap-2">
                <Label>{t("form.device")}</Label>
                <Select value={formDeviceId} onValueChange={setFormDeviceId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectDevice")} />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t("form.description")}</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            {/* Image Upload (single) */}
            <div className="grid gap-2">
              <Label>{t("form.image")}</Label>
              {formImagePreview ? (
                <div className="relative group w-fit">
                  <Image
                    src={formImagePreview}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="rounded-lg object-cover max-h-40 border"
                    unoptimized
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full size-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setFormImageFile(null);
                      setFormImagePreview("");
                    }}
                  >
                    ✕
                  </button>
                  {formImageFile && (
                    <p className="text-xs text-muted-foreground mt-1">{formImageFile.name}</p>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="reportImage"
                  className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Plus className="size-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{t("form.imagePlaceholder")}</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG, GIF, WEBP (max 5MB)</span>
                  <input
                    id="reportImage"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormImageFile(file);
                        setFormImagePreview(URL.createObjectURL(file));
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {/* Status + Assignee (only for edit) */}
            {editingReport && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("form.status")}</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`statuses.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>{t("form.assignee")}</Label>
                    <Select value={formAssignedTo} onValueChange={setFormAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectAssignee")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("form.noAssignee")}</SelectItem>
                        {technicians.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Technician Note */}
                <div className="grid gap-2">
                  <Label htmlFor="technicianNote">{t("form.technicianNote")}</Label>
                  <Textarea
                    id="technicianNote"
                    value={formTechnicianNote}
                    onChange={(e) => setFormTechnicianNote(e.target.value)}
                    placeholder={t("form.technicianNotePlaceholder")}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("form.cancel")}</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingReport ? t("form.update") : t("form.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirm.description", { id: String(deletingReport?.id || "") })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("deleteConfirm.cancel")}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("deleteConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
