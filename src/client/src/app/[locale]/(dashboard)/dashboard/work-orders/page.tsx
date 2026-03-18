"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { Plus, Search, Loader2, Filter, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrderTable, WorkOrderDialog } from "@/components/work-orders";
import { TablePagination } from "@/components/shared/table-pagination";
import { env } from "@/env";
import { useAuth } from "@/hooks/use-auth";
import { workOrderService } from "@/services/work-order.service";
import { personnelService } from "@/services/personnel.service";
import type { WorkOrder, CreateWorkOrderPayload, UpdateWorkOrderPayload } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

export default function WorkOrdersPage() {
  const { user } = useAuth();
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");
  const tWorkOrders = useTranslations("WorkOrders");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [evidenceWorkOrder, setEvidenceWorkOrder] = useState<WorkOrder | undefined>();
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isEvidenceSubmitting, setIsEvidenceSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;
  const [mounted, setMounted] = useState(false);

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";
  const isAssignedStaff = user?.role === "teacher" || user?.role === "technician";

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.data?.message) {
      return String(error.response.data.message);
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  };

  const getImageUrl = (src?: string | null) => {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) {
      return src;
    }
    return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
  };

  // Load data
  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  // Filter work orders based on search query and status
  useEffect(() => {
    let filtered = workOrders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.code.toLowerCase().includes(query) ||
          (wo.location ?? "").toLowerCase().includes(query) ||
          wo.content.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((wo) => {
        if (statusFilter === "approved") {
          return wo.status === "approved" || wo.status === "in_progress";
        }

        return wo.status === statusFilter;
      });
    }

    if (assigneeFilter !== "all") {
      filtered = filtered.filter((wo) => String(wo.assignedToUser?.id ?? wo.assignedTo ?? "") === assigneeFilter);
    }

    setFilteredWorkOrders(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, assigneeFilter, workOrders]);

  const assigneeOptions = Array.from(
    new Map(
      workOrders
        .map((wo) => {
          const id = wo.assignedToUser?.id ?? wo.assignedTo;
          const name = wo.assignedToUser?.fullName;
          if (!id) return null;
          return [String(id), name || `Nhân sự #${id}`] as const;
        })
        .filter((entry): entry is readonly [string, string] => entry !== null)
    )
  );

  const pagedWorkOrders = filteredWorkOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function loadData() {
    try {
      setIsLoading(true);
      const [data, staffResult] = await Promise.all([
        workOrderService.getAll(),
        personnelService.getAllForSelection().catch(() => [] as PersonnelRecord[]),
      ]);
      setWorkOrders(data);
      setFilteredWorkOrders(data);
      setPersonnel(staffResult);
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi tải dữ liệu");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data: CreateWorkOrderPayload) {
    try {
      setIsSubmitting(true);
      const newWO = await workOrderService.create(data);
      setWorkOrders(prev => [...prev, newWO]);
      toast.success("Tạo công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi tạo công lệnh");
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(data: UpdateWorkOrderPayload) {
    if (!editingWorkOrder) return;

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.update(editingWorkOrder.id, data);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Cập nhật công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi cập nhật công lệnh");
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa công lệnh này?")) {
      return;
    }

    try {
      await workOrderService.delete(id);
      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
      toast.success("Xóa công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi xóa công lệnh");
      toast.error(message);
    }
  }

  async function handlePrint(id: number) {
    try {
      const pdfBlob = await workOrderService.exportPdf(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `giay-di-duong-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi xuất PDF công lệnh");
      toast.error(message);
    }
  }

  async function handleApprove(id: number) {
    try {
      const updated = await workOrderService.approve(id);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Duyệt công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi duyệt công lệnh");
      toast.error(message);
    }
  }

  async function handleReject(id: number) {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;

    try {
      const updated = await workOrderService.reject(id);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Từ chối công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi từ chối công lệnh");
      toast.error(message);
    }
  }

  async function handleComplete(id: number) {
    const targetWorkOrder = workOrders.find(wo => wo.id === id);
    if (!targetWorkOrder) {
      toast.error("Không tìm thấy công lệnh");
      return;
    }

    setEvidenceWorkOrder(targetWorkOrder);
    setEvidenceFile(null);
    setEvidenceDialogOpen(true);
  }

  async function handleUploadEvidenceFromDialog() {
    if (!evidenceWorkOrder || !evidenceFile) return;

    try {
      setIsEvidenceSubmitting(true);
      const updated = await workOrderService.uploadEvidence(evidenceWorkOrder.id, evidenceFile);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      setEvidenceWorkOrder(updated);
      setEvidenceFile(null);
      toast.success("Upload ảnh minh chứng thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi upload ảnh minh chứng");
      toast.error(message);
    } finally {
      setIsEvidenceSubmitting(false);
    }
  }

  async function handleCompleteFromDialog() {
    if (!evidenceWorkOrder) return;
    if (!evidenceWorkOrder.attachments?.length) {
      toast.error("Vui lòng upload ảnh minh chứng trước khi hoàn thành công lệnh");
      return;
    }

    try {
      setIsEvidenceSubmitting(true);
      const updated = await workOrderService.submitCompletion(evidenceWorkOrder.id);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Cập nhật trạng thái công lệnh thành công");
      setEvidenceDialogOpen(false);
      setEvidenceWorkOrder(undefined);
      setEvidenceFile(null);
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi hoàn thành công lệnh");
      toast.error(message);
    } finally {
      setIsEvidenceSubmitting(false);
    }
  }

  async function handleConfirmCompletion(id: number) {
    try {
      const updated = await workOrderService.confirmCompletion(id);
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Xác nhận hoàn thành công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi xác nhận hoàn thành công lệnh");
      toast.error(message);
    }
  }

  async function handleRequestRework(id: number) {
    const reason = prompt("Lý do yêu cầu thực hiện lại:") || "";

    try {
      const updated = await workOrderService.requestRework(id, { reason });
      setWorkOrders(prev => prev.map(wo => (wo.id === updated.id ? updated : wo)));
      toast.success("Đã yêu cầu thực hiện lại công lệnh");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi yêu cầu thực hiện lại công lệnh");
      toast.error(message);
    }
  }

  const handleSubmit = async (data: CreateWorkOrderPayload | UpdateWorkOrderPayload) => {
    if (editingWorkOrder) {
      await handleUpdate(data);
    } else {
      await handleCreate(data as CreateWorkOrderPayload);
    }
    setEditingWorkOrder(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("workOrders")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tSidebar("workOrders")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{tWorkOrders("description")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vi/dashboard/work-orders/tao-moi">
            <Button className="gap-2">
              <Plus className="size-4" />
              {tWorkOrders("createWorkOrder")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tWorkOrders("searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {mounted ? (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder={tWorkOrders("filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tWorkOrders("allStatuses")}</SelectItem>
                <SelectItem value="pending">{tWorkOrders("pending")}</SelectItem>
                <SelectItem value="approved">{tWorkOrders("approved")}</SelectItem>
                <SelectItem value="completed">{tWorkOrders("completed")}</SelectItem>
                <SelectItem value="rejected">{tWorkOrders("rejected")}</SelectItem>
              </SelectContent>
            </Select>

            {isAdminOrManager && (
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tất cả người nhận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người nhận</SelectItem>
                  {assigneeOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
              <span>Tất cả trạng thái</span>
              <ChevronRight className="size-4 opacity-50 rotate-90" />
            </div>
            {isAdminOrManager && (
              <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
                <span>Tất cả người nhận</span>
                <ChevronRight className="size-4 opacity-50 rotate-90" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Work Orders Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-0">
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            <>
              <WorkOrderTable
                data={pagedWorkOrders}
                personnel={personnel}
                onEdit={isAdminOrManager ? ((id) => {
                  const workOrder = workOrders.find(wo => wo.id === id);
                  setEditingWorkOrder(workOrder);
                  setIsDialogOpen(true);
                }) : undefined}
                onDelete={isAdminOrManager ? handleDelete : undefined}
                onApprove={isAdminOrManager ? handleApprove : undefined}
                onReject={isAdminOrManager ? handleReject : undefined}
                onComplete={isAssignedStaff ? handleComplete : undefined}
                onConfirmCompletion={isAdminOrManager ? handleConfirmCompletion : undefined}
                onRequestRework={isAdminOrManager ? handleRequestRework : undefined}
                onPrint={handlePrint}
                isLoading={false}
                startIndex={(currentPage - 1) * PAGE_SIZE + 1}
              />
              <TablePagination
                total={filteredWorkOrders.length}
                page={currentPage}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                label="công lệnh"
              />
            </>
          )}
        </div>
      </div>

      {/* Work Order Dialog */}
      <WorkOrderDialog
        workOrder={editingWorkOrder}
        personnel={personnel}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập ảnh minh chứng</DialogTitle>
            <DialogDescription>
              {evidenceWorkOrder ? `Công lệnh ${evidenceWorkOrder.code}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {evidenceWorkOrder?.attachments?.length ? (
              <div className="grid grid-cols-2 gap-2">
                {evidenceWorkOrder.attachments.map((attachment) => (
                  <a key={attachment.id} href={getImageUrl(attachment.fileUrl)} target="_blank" rel="noreferrer">
                    <img
                      src={getImageUrl(attachment.fileUrl)}
                      alt={`Minh chứng ${attachment.id}`}
                      className="max-h-40 w-full rounded-md border bg-gray-50 object-contain p-1"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có ảnh minh chứng</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              />
              <Button
                variant="outline"
                disabled={!evidenceFile || isEvidenceSubmitting}
                onClick={handleUploadEvidenceFromDialog}
              >
                Upload ảnh
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCompleteFromDialog}
              disabled={isEvidenceSubmitting || !(evidenceWorkOrder?.attachments?.length)}
            >
              Hoàn thành công lệnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}