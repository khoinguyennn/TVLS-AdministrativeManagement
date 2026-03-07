"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
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
  leaveRequestService,
  type CreateLeaveRequestPayload,
} from "@/services/leave.service";
import type { LeaveRequest, LeaveType, LeaveRequestStats } from "@/types/leave.types";

// ── Constants ──
const STATUSES = ["pending", "approved", "rejected"] as const;
const PAGE_SIZE = 8;

// ── Status badge colours ──
const statusBadgeClass: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  approved:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  rejected:
    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
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
export default function LeaveRequestsPage() {
  const t = useTranslations("LeaveRequest");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");

  // ── Data state ──
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<LeaveRequestStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dialog state ──
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<LeaveRequest | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Form state ──
  const [formLeaveTypeId, setFormLeaveTypeId] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formTotalDays, setFormTotalDays] = useState<string>("1");
  const [formReason, setFormReason] = useState("");
  const [formRejectedReason, setFormRejectedReason] = useState("");

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes, typesRes] = await Promise.all([
        leaveRequestService.getAll(),
        leaveRequestService.getStats(),
        leaveRequestService.getLeaveTypes(),
      ]);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
      setLeaveTypes(typesRes.data);
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Auto-calculate totalDays ──
  useEffect(() => {
    if (formStartDate && formEndDate) {
      const start = new Date(formStartDate);
      const end = new Date(formEndDate);
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormTotalDays(String(diffDays));
      }
    }
  }, [formStartDate, formEndDate]);

  // ── Filtered & paginated data ──
  const filteredRequests = useMemo(() => {
    let result = requests;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.user?.fullName && r.user.fullName.toLowerCase().includes(q)) ||
          (r.reason && r.reason.toLowerCase().includes(q)) ||
          String(r.id).includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    return result;
  }, [requests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Open create dialog ──
  const handleOpenCreate = useCallback(() => {
    setFormLeaveTypeId("");
    setFormStartDate("");
    setFormEndDate("");
    setFormTotalDays("1");
    setFormReason("");
    setCreateDialogOpen(true);
  }, []);

  // ── View detail ──
  const handleView = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setViewDialogOpen(true);
  }, []);

  // ── Submit create ──
  const handleCreate = useCallback(async () => {
    try {
      setFormLoading(true);
      const payload: CreateLeaveRequestPayload = {
        leaveTypeId: Number(formLeaveTypeId),
        startDate: formStartDate,
        endDate: formEndDate,
        totalDays: Number(formTotalDays),
      };
      if (formReason.trim()) payload.reason = formReason;

      await leaveRequestService.create(payload);
      toast.success(t("toast.createSuccess"));
      setCreateDialogOpen(false);
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [formLeaveTypeId, formStartDate, formEndDate, formTotalDays, formReason, fetchData, t]);

  // ── Approve ──
  const handleApprove = useCallback(
    async (id: number) => {
      try {
        setFormLoading(true);
        await leaveRequestService.approve(id);
        toast.success(t("toast.approveSuccess"));
        fetchData();
      } catch {
        toast.error(t("toast.error"));
      } finally {
        setFormLoading(false);
      }
    },
    [fetchData, t],
  );

  // ── Reject ──
  const handleReject = useCallback(async () => {
    if (!rejectingRequest) return;
    try {
      setFormLoading(true);
      await leaveRequestService.reject(rejectingRequest.id, formRejectedReason || undefined);
      toast.success(t("toast.rejectSuccess"));
      setRejectDialogOpen(false);
      setRejectingRequest(null);
      setFormRejectedReason("");
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [rejectingRequest, formRejectedReason, fetchData, t]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!deletingRequest) return;
    try {
      setFormLoading(true);
      await leaveRequestService.delete(deletingRequest.id);
      toast.success(t("toast.deleteSuccess"));
      setDeleteDialogOpen(false);
      setDeletingRequest(null);
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [deletingRequest, fetchData, t]);

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
      label: t("stats.approved"),
      value: stats.approved,
      icon: <CheckCircle2 className="size-5" />,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600",
    },
    {
      label: t("stats.rejected"),
      value: stats.rejected,
      icon: <XCircle className="size-5" />,
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600",
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
        <span className="font-medium text-foreground">{tSidebar("leaveRequests")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t("addRequest")}
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
        ) : paginatedRequests.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            {t("noResults")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.employee")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.leaveType")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.duration")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                    {/* Employee */}
                    <TableCell className="px-6 py-4">
                      {request.user ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={getAvatarUrl(request.user.avatar)} alt={request.user.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {getInitials(request.user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{request.user.fullName}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Leave Type */}
                    <TableCell className="px-6 py-4">
                      <span className="text-sm">{request.leaveType?.name || "-"}</span>
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {String(request.totalDays).padStart(2, "0")} {t("days")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </p>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4 text-center">
                      <Badge variant="outline" className={statusBadgeClass[request.status] || ""}>
                        {t(`statuses.${request.status}`)}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleView(request)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-emerald-600"
                              onClick={() => handleApprove(request.id)}
                              disabled={formLoading}
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-red-600"
                              onClick={() => {
                                setRejectingRequest(request);
                                setFormRejectedReason("");
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setDeletingRequest(request);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
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
                {Math.min(currentPage * PAGE_SIZE, filteredRequests.length)}{" "}
                {t("pagination.of")} {filteredRequests.length} {t("pagination.requests")}
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
              <CalendarDays className="size-5 text-primary" />
              {t("dialog.viewTitle")} #{viewingRequest?.id}
            </DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              {/* Employee */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="size-10">
                  <AvatarImage src={getAvatarUrl(viewingRequest.user?.avatar)} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {viewingRequest.user ? getInitials(viewingRequest.user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{viewingRequest.user?.fullName || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.leaveType")}</p>
                  <p className="font-medium">{viewingRequest.leaveType?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("columns.status")}</p>
                  <Badge variant="outline" className={statusBadgeClass[viewingRequest.status] || ""}>
                    {t(`statuses.${viewingRequest.status}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.startDate")}</p>
                  <p className="font-medium">{formatDate(viewingRequest.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.endDate")}</p>
                  <p className="font-medium">{formatDate(viewingRequest.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.totalDays")}</p>
                  <p className="font-medium">{viewingRequest.totalDays} {t("days")}</p>
                </div>
                {viewingRequest.approver && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.approvedBy")}</p>
                    <p className="font-medium">{viewingRequest.approver.fullName}</p>
                  </div>
                )}
              </div>

              {viewingRequest.reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.reason")}</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{viewingRequest.reason}</p>
                </div>
              )}

              {viewingRequest.rejectedReason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("form.rejectedReason")}</p>
                  <p className="text-sm bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-3 rounded-lg">
                    {viewingRequest.rejectedReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-110">
          <DialogHeader>
            <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
            <DialogDescription>{t("dialog.createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Leave Type */}
            <div className="grid gap-2">
              <Label>{t("form.leaveType")}</Label>
              <Select value={formLeaveTypeId} onValueChange={setFormLeaveTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.leaveTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.id} value={String(lt.id)}>
                      {lt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("form.startDate")}</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("form.endDate")}</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Total Days */}
            <div className="grid gap-2">
              <Label>{t("form.totalDays")}</Label>
              <Input
                type="number"
                min="1"
                value={formTotalDays}
                onChange={(e) => setFormTotalDays(e.target.value)}
              />
            </div>

            {/* Reason */}
            <div className="grid gap-2">
              <Label>{t("form.reason")}</Label>
              <Textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder={t("form.reasonPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={formLoading || !formLeaveTypeId || !formStartDate || !formEndDate}
            >
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>{t("dialog.rejectTitle")}</DialogTitle>
            <DialogDescription>{t("dialog.rejectDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("form.rejectedReason")}</Label>
              <Textarea
                value={formRejectedReason}
                onChange={(e) => setFormRejectedReason(e.target.value)}
                placeholder={t("form.rejectedReasonPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleReject} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>{t("dialog.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("dialog.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
