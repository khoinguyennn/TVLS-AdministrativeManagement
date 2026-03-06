"use client";

import { Edit, Trash2, Eye, CheckCircle, XCircle, Clock, PlayCircle, FileText } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkOrder } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

interface WorkOrderTableProps {
  data: WorkOrder[];
  personnel?: PersonnelRecord[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onComplete?: (id: number) => void;
  onPrint?: (id: number) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export function WorkOrderTable({
  data,
  personnel = [],
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onComplete,
  onPrint,
  isLoading = false,
  showActions = true
}: WorkOrderTableProps) {
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

  const formatDate = (dateTime: string | undefined) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const getPersonnelName = (id: number | undefined): string => {
    if (!id) return "N/A";
    const person = personnel.find(p => p.id === id);
    return person ? person.fullName : "N/A";
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const, icon: Clock },
      approved: { label: "Đã duyệt", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "Đang thực hiện", variant: "outline" as const, icon: PlayCircle },
      completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Từ chối", variant: "destructive" as const, icon: XCircle }
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
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Không có công lệnh nào</div>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#</TableHead>
            <TableHead>Mã công lệnh</TableHead>
            <TableHead>Nơi công tác</TableHead>
            <TableHead>Nội dung công việc</TableHead>
            <TableHead>Thời gian bắt đầu</TableHead>
            <TableHead>Thời gian kết thúc</TableHead>
            <TableHead>Người gửi</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Trạng thái</TableHead>
            {showActions && <TableHead className="text-right">Hành động</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((workOrder, index) => (
            <TableRow key={workOrder.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-mono text-sm">{workOrder.code}</TableCell>
              <TableCell className="max-w-xs truncate" title={workOrder.workLocation}>
                {workOrder.workLocation}
              </TableCell>
              <TableCell className="max-w-xs truncate" title={workOrder.workContent}>
                {workOrder.workContent}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(workOrder.startTime)}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(workOrder.endTime)}
              </TableCell>
              <TableCell className="text-sm">
                {getPersonnelName(workOrder.assignedBy)}
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(workOrder.createdAt)}
              </TableCell>
              <TableCell>
                {getStatusBadge(workOrder.status)}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/vi/dashboard/work-orders/${workOrder.id}`}>
                      <Button variant="ghost" size="sm" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {onPrint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPrint(workOrder.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="In PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    {workOrder.status === "pending" && onApprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(workOrder.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Duyệt"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {workOrder.status === "pending" && onReject && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(workOrder.id)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Từ chối"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {workOrder.status === "approved" && onComplete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComplete(workOrder.id)}
                        className="text-purple-600 hover:text-purple-700"
                        title="Hoàn thành"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(workOrder.id)}
                      title="Sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(workOrder.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}