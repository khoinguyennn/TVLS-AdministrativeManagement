"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/env";
import { workOrderService } from "@/services/work-order.service";
import type { WorkOrder } from "@/types/work-order.types";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File | null>(null);
  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);
  const [reworkReason, setReworkReason] = useState("");

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";
  const assigneeUsers = workOrder?.assignees?.map((assignee) => assignee.assignedUser).filter(Boolean) ?? [];
  const fallbackAssignee = !assigneeUsers.length && workOrder?.assignedToUser ? [workOrder.assignedToUser] : [];
  const allAssignees = assigneeUsers.length ? assigneeUsers : fallbackAssignee;
  const isAssignedStaff = (user?.role === "teacher" || user?.role === "technician")
    && allAssignees.some((assignee) => assignee?.id === user?.id);

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

  useEffect(() => {
    loadWorkOrder();
  }, [id]);

  async function loadWorkOrder() {
    try {
      setIsLoading(true);
      const data = await workOrderService.getById(parseInt(id));
      setWorkOrder(data);
    } catch (error) {
      toast.error("Không tìm thấy công lệnh");
      router.push("/vi/dashboard/work-orders");
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateValue: string | undefined) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const, icon: Clock },
      approved: { label: "Đã duyệt", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "Đang thực hiện", variant: "default" as const, icon: CheckCircle },
      submitted_for_review: { label: "Chờ xét duyệt", variant: "secondary" as const, icon: Clock },
      completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
      rework_requested: { label: "Yêu cầu thực hiện lại", variant: "destructive" as const, icon: XCircle },
      rejected: { label: "Từ chối", variant: "destructive" as const, icon: XCircle },
      cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle },
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  async function handleUploadEvidence() {
    if (!workOrder || !selectedEvidence) return;

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.uploadEvidence(workOrder.id, selectedEvidence);
      setWorkOrder(updated);
      setSelectedEvidence(null);
      toast.success("Upload ảnh minh chứng thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi upload ảnh minh chứng");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitCompletion() {
    if (!workOrder) return;

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.submitCompletion(workOrder.id);
      setWorkOrder(updated);
      toast.success("Cập nhật trạng thái công lệnh thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi gửi yêu cầu hoàn thành");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmCompletion() {
    if (!workOrder) return;

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.confirmCompletion(workOrder.id);
      setWorkOrder(updated);
      toast.success("Xác nhận hoàn thành thành công");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi xác nhận hoàn thành");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestRework() {
    if (!workOrder) return;
    setReworkReason("");
    setReworkDialogOpen(true);
  }

  async function submitReworkRequest() {
    if (!workOrder) return;

    const reason = reworkReason.trim();
    if (!reason) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.requestRework(workOrder.id, { reason });
      setWorkOrder(updated);
      toast.success("Đã yêu cầu thực hiện lại công lệnh");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi yêu cầu thực hiện lại");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setReworkDialogOpen(false);
    }
  }

  async function handleResubmitForRework() {
    if (!workOrder) return;

    try {
      setIsSubmitting(true);
      const updated = await workOrderService.resubmitForRework(workOrder.id);
      setWorkOrder(updated);
      toast.success("Đã tái gửi công lệnh để xét duyệt");
    } catch (error) {
      const message = getApiErrorMessage(error, "Lỗi tái gửi công lệnh");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không tìm thấy công lệnh</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vi/dashboard/work-orders">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Công lệnh {workOrder.code}
          </h1>
          <p className="text-gray-600 mt-1">Chi tiết công việc được giao</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin công việc</span>
                {getStatusBadge(workOrder.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Nơi công tác</p>
                    <p className="text-gray-600">{workOrder.location || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Thời gian</p>
                    <p className="text-gray-600">
                      {formatDate(workOrder.startDate)} — {formatDate(workOrder.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Người thực hiện</p>
                    {allAssignees.length > 0 ? (
                      <div className="mt-2 flex items-center gap-3">
                        <AvatarGroup>
                          {allAssignees.slice(0, 3).map((assignee, index) => (
                            <Avatar key={`${assignee?.id ?? index}`} className="size-8" title={assignee?.fullName}>
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(assignee?.fullName || "N/A")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {allAssignees.length > 3 && (
                            <AvatarGroupCount>+{allAssignees.length - 3}</AvatarGroupCount>
                          )}
                        </AvatarGroup>
                        <div className="text-gray-600">
                          <p className="font-medium text-gray-900">
                            {allAssignees.map((assignee) => assignee?.fullName).filter(Boolean).join(", ")}
                          </p>
                          {allAssignees.length > 1 && (
                            <p className="text-xs text-gray-500">{allAssignees.length} người được giao</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">-</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Người giao việc</p>
                    <p className="text-gray-600">
                      {workOrder.createdByUser?.fullName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Tiêu đề</p>
                  <p className="text-gray-600 mt-1">{workOrder.title}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nội dung công việc</p>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{workOrder.content}</p>
                </div>
              </div>

              {workOrder.note && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Ghi chú</p>
                      <p className="text-gray-600 mt-1">{workOrder.note}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Ảnh minh chứng</p>
                {workOrder.attachments && workOrder.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {workOrder.attachments.map((attachment) => (
                      <a key={attachment.id} href={getImageUrl(attachment.fileUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={getImageUrl(attachment.fileUrl)}
                          alt={`Minh chứng ${attachment.id}`}
                          className="max-h-72 w-full rounded-md border bg-gray-50 object-contain p-1"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có ảnh minh chứng</p>
                )}

                {isAssignedStaff && workOrder.status === "approved" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedEvidence(e.target.files?.[0] || null)}
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        disabled={!selectedEvidence || isSubmitting}
                        onClick={handleUploadEvidence}
                      >
                        Upload minh chứng
                      </Button>
                    </div>

                    <Button
                      disabled={isSubmitting || !(workOrder.attachments && workOrder.attachments.length > 0)}
                      onClick={handleSubmitCompletion}
                      className="w-full sm:w-auto"
                    >
                      Gửi yêu cầu hoàn thành
                    </Button>

                    {(!workOrder.attachments || workOrder.attachments.length === 0) && (
                      <p className="text-xs text-gray-500">Vui lòng upload ít nhất 1 ảnh minh chứng trước khi hoàn thành.</p>
                    )}
                  </div>
                )}

                {isAssignedStaff && workOrder.status === "rework_requested" && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-amber-600 font-medium">Công lệnh yêu cầu thực hiện lại.</p>
                    <Button
                      disabled={isSubmitting}
                      onClick={handleResubmitForRework}
                      className="w-full sm:w-auto"
                    >
                      Tái gửi công lệnh
                    </Button>
                  </div>
                )}

                {isAdminOrManager && workOrder.status === "submitted_for_review" && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-blue-600 font-medium">Công lệnh chờ xét duyệt hoàn thành.</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        disabled={isSubmitting}
                        onClick={handleConfirmCompletion}
                        className="sm:flex-1"
                      >
                        ✓ Đạt yêu cầu
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={isSubmitting}
                        onClick={handleRequestRework}
                        className="sm:flex-1"
                      >
                        ✗ Yêu cầu thực hiện lại
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái công lệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tạo công lệnh</p>
                    <p className="text-xs text-gray-500">{formatDate(workOrder.createdAt)}</p>
                  </div>
                </div>
                {workOrder.status !== "pending" && workOrder.status !== "rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">Đã duyệt</p>
                        <p className="text-xs text-gray-500">{formatDate(workOrder.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {workOrder.status === "rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">Từ chối</p>
                      {workOrder.note && workOrder.status === "rejected" && (
                        <p className="text-xs text-gray-500 whitespace-pre-wrap">{workOrder.note}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tạo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã công lệnh</span>
                <span className="font-mono font-medium">{workOrder.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày tạo</span>
                <span>{formatDate(workOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cập nhật</span>
                <span>{formatDate(workOrder.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={reworkDialogOpen} onOpenChange={setReworkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do yêu cầu thực hiện lại</DialogTitle>
            <DialogDescription>
              Nhập nội dung ngắn gọn để phản hồi cho người thực hiện.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reworkReason}
            onChange={(e) => setReworkReason(e.target.value)}
            placeholder="Ví dụ: Cần bổ sung ảnh minh chứng rõ hơn..."
            className="min-h-28"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setReworkDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitReworkRequest} disabled={isSubmitting}>
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
