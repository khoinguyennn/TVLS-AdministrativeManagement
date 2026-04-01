"use client";

import { Edit, Trash2, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
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
  onConfirmCompletion?: (id: number) => void;
  onRequestRework?: (id: number) => void;
  onPrint?: (id: number) => void;
  isLoading?: boolean;
  showActions?: boolean;
  startIndex?: number;
}

export function WorkOrderTable({
  data,
  personnel = [],
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onComplete,
  onConfirmCompletion,
  onRequestRework,
  onPrint,
  isLoading = false,
  showActions = true,
  startIndex = 1,
}: WorkOrderTableProps) {
  const formatDate = (dateValue: string | undefined) => {
    if (!dateValue) return "Chưa cập nhật";

    return new Date(dateValue).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPersonnelName = (id: number | undefined): string => {
    if (!id) return "N/A";
    // Chỉ tìm theo userId (users.id) - không fallback theo profile.id vì gây nhầm lẫn
    const person = personnel.find(p => p.userId === id);
    return person ? person.fullName : "N/A";
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700 border-transparent", dotClass: "bg-amber-500" },
      approved: { label: "Đã duyệt", className: "bg-cyan-100 text-cyan-700 border-transparent", dotClass: "bg-cyan-500" },
      in_progress: { label: "Đang thực hiện", className: "bg-blue-100 text-blue-700 border-transparent", dotClass: "bg-blue-500" },
      submitted_for_review: { label: "Chờ xét duyệt", className: "bg-purple-100 text-purple-700 border-transparent", dotClass: "bg-purple-500" },
      completed: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-700 border-transparent", dotClass: "bg-emerald-500" },
      rework_requested: { label: "Yêu cầu làm lại", className: "bg-red-100 text-red-700 border-transparent", dotClass: "bg-red-500" },
      rejected: { label: "Từ chối", className: "bg-red-100 text-red-700 border-transparent", dotClass: "bg-red-500" },
      cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-700 border-transparent", dotClass: "bg-slate-500" }
    };

    const config = statusConfig[status];

    return (
      <Badge className={`gap-1.5 ${config.className}`}>
        <span className={`size-1.5 rounded-full ${config.dotClass}`} />
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Công lệnh</TableHead>
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Người giao</TableHead>
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Người nhận</TableHead>
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Thời gian</TableHead>
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Trạng thái</TableHead>
            {showActions && <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-right whitespace-nowrap">Hành động</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((workOrder, index) => {
            // Get list of assignees from junction table or fallback to single assignedToUser
            const assigneeList = workOrder.assignees?.map((a) => a.assignedUser).filter(Boolean) || [];
            const primaryAssignee = assigneeList.length === 0 ? workOrder.assignedToUser : null;
            const allAssignees = assigneeList.length > 0 ? assigneeList : (primaryAssignee ? [primaryAssignee] : []);

            const startDate = formatDate(workOrder.startDate);
            const endDate = formatDate(workOrder.endDate);

            return (
              <TableRow key={workOrder.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="px-4 py-4 min-w-0 max-w-[26rem]">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm truncate">{workOrder.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      #{startIndex + index} • {workOrder.code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{workOrder.location || "Chưa có địa điểm"}</p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                  {workOrder.createdByUser?.fullName || "N/A"}
                </TableCell>

                <TableCell className="px-4 py-4">
                  {allAssignees.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <AvatarGroup>
                        {allAssignees.slice(0, 3).map((assignee, idx) => (
                          <Avatar key={`${assignee?.id}-${idx}`} className="size-8" title={assignee?.fullName}>
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(assignee?.fullName || "N/A")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {allAssignees.length > 3 && (
                          <AvatarGroupCount>+{allAssignees.length - 3}</AvatarGroupCount>
                        )}
                      </AvatarGroup>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Chưa phân công</span>
                  )}
                </TableCell>

                <TableCell className="px-4 py-4 min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <span className="inline-flex min-w-16 justify-center rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Bắt đầu
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-medium text-foreground">{startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <span className="inline-flex min-w-16 justify-center rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                        Kết thúc
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-medium text-foreground">{endDate}</p>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(workOrder.status)}
                </TableCell>

              {showActions && (
                <TableCell className="px-4 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <Link href={`/vi/dashboard/work-orders/${workOrder.id}`}>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" title="Xem chi tiết">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    {onPrint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-primary"
                        title="In PDF"
                      >
                        <FileText className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "pending" && onApprove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-emerald-600"
                        title="Duyệt"
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "pending" && onReject && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReject(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-amber-600"
                        title="Từ chối"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "approved" && onComplete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onComplete(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-cyan-600"
                        title="Hoàn thành công lệnh"
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "in_progress" && onConfirmCompletion && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onConfirmCompletion(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-emerald-600"
                        title="Xác nhận hoàn thành"
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "in_progress" && onRequestRework && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRequestRework(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-amber-600"
                        title="Yêu cầu làm lại"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "submitted_for_review" && onConfirmCompletion && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onConfirmCompletion(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-emerald-600"
                        title="Đạt yêu cầu"
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    )}
                    {workOrder.status === "submitted_for_review" && onRequestRework && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRequestRework(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-amber-600"
                        title="Yêu cầu làm lại"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-primary"
                        title="Sửa"
                      >
                        <Edit className="size-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(workOrder.id)}
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}