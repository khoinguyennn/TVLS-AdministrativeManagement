"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { workOrderService } from "@/services/work-order.service";
import type { WorkOrder } from "@/types/work-order.types";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const, icon: Clock },
      approved: { label: "Đã duyệt", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "Đang thực hiện", variant: "outline" as const, icon: Clock },
      completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
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
                      {formatDateTime(workOrder.startDate)} — {formatDateTime(workOrder.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Người thực hiện</p>
                    <p className="text-gray-600">
                      {workOrder.assignedToUser?.fullName || "-"}
                    </p>
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
                    <p className="text-xs text-gray-500">{formatDateTime(workOrder.createdAt)}</p>
                  </div>
                </div>
                {workOrder.status !== "pending" && workOrder.status !== "rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">Đã duyệt</p>
                      <p className="text-xs text-gray-500">{formatDateTime(workOrder.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {workOrder.status === "rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">Từ chối</p>
                      {workOrder.rejectionReason && (
                        <p className="text-xs text-gray-500">{workOrder.rejectionReason}</p>
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
                <span>{formatDateTime(workOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cập nhật</span>
                <span>{formatDateTime(workOrder.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
