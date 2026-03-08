"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  PenLine,
  Plus,
  Printer,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import type { LeaveRequest, LeaveRequestStats, LeaveType } from "@/types/leave.types";
import { env } from "@/env";

import { authStorage } from "@/lib/auth-storage";

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
  DialogTitle
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import { leaveRequestService, type CreateLeaveRequestPayload } from "@/services/leave.service";

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
    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800"
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
    year: "numeric"
  });
}

// ═══════════════════════════════════════════════════════════
export default function LeaveRequestsPage() {
  const t = useTranslations("LeaveRequest");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");

  // ── Data state ──
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<LeaveRequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
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
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signingRequest, setSigningRequest] = useState<LeaveRequest | null>(null);
  const [signPin, setSignPin] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<LeaveRequest | null>(null);
  const [approvePin, setApprovePin] = useState("");
  const [rejectPin, setRejectPin] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // ── Form state ──
  const [formLeaveTypeId, setFormLeaveTypeId] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formTotalDays, setFormTotalDays] = useState<string>("1");
  const [formReason, setFormReason] = useState("");
  const [formRejectedReason, setFormRejectedReason] = useState("");

  // ── Current user role ──
  const [userRole, setUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  useEffect(() => {
    const user = authStorage.getUser();
    if (user?.role) setUserRole(user.role);
    if (user?.id) setCurrentUserId(user.id);
  }, []);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes, typesRes] = await Promise.all([
        leaveRequestService.getAll(),
        leaveRequestService.getStats(),
        leaveRequestService.getLeaveTypes()
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
          String(r.id).includes(q)
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
        totalDays: Number(formTotalDays)
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
  const handleApprove = useCallback(async () => {
    if (!approvingRequest || !approvePin) return;
    try {
      setFormLoading(true);
      await leaveRequestService.approve(approvingRequest.id, approvePin);
      toast.success(t("toast.approveSuccess"));
      setApproveDialogOpen(false);
      setApprovingRequest(null);
      setApprovePin("");
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [approvingRequest, approvePin, fetchData, t]);

  // ── Reject ──
  const handleReject = useCallback(async () => {
    if (!rejectingRequest || !rejectPin) return;
    try {
      setFormLoading(true);
      await leaveRequestService.reject(
        rejectingRequest.id,
        rejectPin,
        formRejectedReason || undefined
      );
      toast.success(t("toast.rejectSuccess"));
      setRejectDialogOpen(false);
      setRejectingRequest(null);
      setFormRejectedReason("");
      setRejectPin("");
      fetchData();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [rejectingRequest, rejectPin, formRejectedReason, fetchData, t]);

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

  // ── Export PDF ──
  const handleExportPdf = useCallback(
    async (id: number) => {
      try {
        const blob = await leaveRequestService.exportPdf(id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leave-request-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(t("toast.pdfDownloaded"));
      } catch {
        toast.error(t("toast.pdfError"));
      }
    },
    [t]
  );

  // ── Print PDF ──
  const handlePrint = useCallback(
    async (id: number) => {
      try {
        const blob = await leaveRequestService.exportPdf(id);
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.addEventListener("load", () => {
            printWindow.print();
          });
        }
      } catch {
        toast.error(t("toast.pdfError"));
      }
    },
    [t]
  );

  // ── Sign Request ──
  const handleSign = useCallback(async () => {
    if (!signingRequest || !signPin) return;
    try {
      setFormLoading(true);
      await leaveRequestService.signRequest(signingRequest.id, signPin);
      toast.success(t("toast.signSuccess"));
      setSignDialogOpen(false);
      setSigningRequest(null);
      setSignPin("");
      fetchData();
    } catch {
      toast.error(t("toast.signError"));
    } finally {
      setFormLoading(false);
    }
  }, [signingRequest, signPin, fetchData, t]);

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
      text: "text-slate-600 dark:text-slate-300"
    },
    {
      label: t("stats.pending"),
      value: stats.pending,
      icon: <Clock className="size-5" />,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600"
    },
    {
      label: t("stats.approved"),
      value: stats.approved,
      icon: <CheckCircle2 className="size-5" />,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600"
    },
    {
      label: t("stats.rejected"),
      value: stats.rejected,
      icon: <XCircle className="size-5" />,
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600"
    }
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="transition-colors hover:text-foreground">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("leaveRequests")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t("addRequest")}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-lg p-2 ${card.bg} ${card.text}`}>{card.icon}</div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="relative min-w-75 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">{t("noResults")}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold tracking-wider uppercase">
                    {t("columns.employee")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold tracking-wider uppercase">
                    {t("columns.leaveType")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold tracking-wider uppercase">
                    {t("columns.duration")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center text-xs font-bold tracking-wider uppercase">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold tracking-wider uppercase">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id} className="transition-colors hover:bg-muted/30">
                    {/* Employee */}
                    <TableCell className="px-6 py-4">
                      {request.user ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={getAvatarUrl(request.user.avatar)}
                              alt={request.user.fullName}
                            />
                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-blue-600"
                          onClick={() => handleExportPdf(request.id)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-orange-600"
                          onClick={() => handlePrint(request.id)}
                          title={t("dialog.print")}
                        >
                          <Printer className="size-4" />
                        </Button>
                        {request.status === "pending" && isAdminOrManager && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-emerald-600"
                              onClick={() => {
                                setApprovingRequest(request);
                                setApprovePin("");
                                setApproveDialogOpen(true);
                              }}
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
                                setRejectPin("");
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </>
                        )}
                        {request.status === "pending" &&
                          request.userId === currentUserId &&
                          !request.signedAt && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-violet-600"
                              title={t("dialog.signTitle")}
                              onClick={() => {
                                setSigningRequest(request);
                                setSignPin("");
                                setSignDialogOpen(true);
                              }}
                            >
                              <PenLine className="size-4" />
                            </Button>
                          )}
                        {request.signedAt && (
                          <Badge
                            variant="outline"
                            className="border-violet-200 bg-violet-50 text-xs text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400"
                          >
                            {t("dialog.signed")}
                          </Badge>
                        )}
                        {request.status === "pending" && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t bg-muted/50 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {t("pagination.showing")} {(currentPage - 1) * PAGE_SIZE + 1} {t("pagination.to")}{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredRequests.length)} {t("pagination.of")}{" "}
                {filteredRequests.length} {t("pagination.requests")}
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
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="size-10">
                  <AvatarImage src={getAvatarUrl(viewingRequest.user?.avatar)} />
                  <AvatarFallback className="bg-primary/10 font-bold text-primary">
                    {viewingRequest.user ? getInitials(viewingRequest.user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{viewingRequest.user?.fullName || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.leaveType")}
                  </p>
                  <p className="font-medium">{viewingRequest.leaveType?.name || "-"}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("columns.status")}
                  </p>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[viewingRequest.status] || ""}
                  >
                    {t(`statuses.${viewingRequest.status}`)}
                  </Badge>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.startDate")}
                  </p>
                  <p className="font-medium">{formatDate(viewingRequest.startDate)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.endDate")}
                  </p>
                  <p className="font-medium">{formatDate(viewingRequest.endDate)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.totalDays")}
                  </p>
                  <p className="font-medium">
                    {viewingRequest.totalDays} {t("days")}
                  </p>
                </div>
                {viewingRequest.approver && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t("form.approvedBy")}
                    </p>
                    <p className="font-medium">{viewingRequest.approver.fullName}</p>
                  </div>
                )}
              </div>

              {viewingRequest.reason && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.reason")}
                  </p>
                  <p className="rounded-lg bg-muted/50 p-3 text-sm">{viewingRequest.reason}</p>
                </div>
              )}

              {viewingRequest.rejectedReason && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("form.rejectedReason")}
                  </p>
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/10 dark:text-red-400">
                    {viewingRequest.rejectedReason}
                  </p>
                </div>
              )}

              {viewingRequest.signedAt && (
                <div className="flex items-center gap-2 rounded-lg bg-violet-50 p-3 dark:bg-violet-900/10">
                  <PenLine className="size-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-700 dark:text-violet-400">
                    {t("dialog.signed")} — {formatDate(viewingRequest.signedAt)}
                  </span>
                </div>
              )}

              {viewingRequest.approverSignedAt && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/10">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {t("dialog.approverSigned")} — {formatDate(viewingRequest.approverSignedAt)}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {viewingRequest && (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleExportPdf(viewingRequest.id)}
                >
                  <Download className="size-4" />
                  {t("dialog.exportPdf")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handlePrint(viewingRequest.id)}
                >
                  <Printer className="size-4" />
                  {t("dialog.print")}
                </Button>
              </>
            )}
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
            <div className="grid gap-2">
              <Label>{t("dialog.signPin")}</Label>
              <Input
                type="password"
                maxLength={6}
                value={rejectPin}
                onChange={(e) => setRejectPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("dialog.signPinPlaceholder")}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={formLoading || rejectPin.length !== 6}
            >
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sign Dialog ── */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="size-5 text-violet-600" />
              {t("dialog.signTitle")}
            </DialogTitle>
            <DialogDescription>{t("dialog.signDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("dialog.signPin")}</Label>
              <Input
                type="password"
                maxLength={6}
                value={signPin}
                onChange={(e) => setSignPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("dialog.signPinPlaceholder")}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSign}
              disabled={formLoading || signPin.length !== 6}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.signConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Approve Dialog (PIN) ── */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              {t("dialog.approveTitle")}
            </DialogTitle>
            <DialogDescription>{t("dialog.approveDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("dialog.signPin")}</Label>
              <Input
                type="password"
                maxLength={6}
                value={approvePin}
                onChange={(e) => setApprovePin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("dialog.signPinPlaceholder")}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("dialog.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleApprove}
              disabled={formLoading || approvePin.length !== 6}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dialog.approveConfirm")}
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
