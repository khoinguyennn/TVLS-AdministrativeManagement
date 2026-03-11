"use client";

import { Edit, Trash2, Eye } from "lucide-react";
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
import type { PersonnelRecord } from "@/types/personnel.types";

interface PersonnelTableProps {
  data: PersonnelRecord[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export function PersonnelTable({
  data,
  onEdit,
  onDelete,
  isLoading = false
}: PersonnelTableProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#</TableHead>
            <TableHead>Mã NV</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Giới tính</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>CCCD</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Điện thoại</TableHead>
            <TableHead>Chức vụ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((personnel, index) => (
            <TableRow key={personnel.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{personnel.code}</TableCell>
              <TableCell className="font-medium">{personnel.fullName}</TableCell>
              <TableCell>{personnel.gender}</TableCell>
              <TableCell>{formatDate(personnel.dateOfBirth)}</TableCell>
              <TableCell>{personnel.cccdNumber}</TableCell>
              <TableCell className="text-sm">{personnel.email}</TableCell>
              <TableCell>{personnel.contactAddress?.phone}</TableCell>
              <TableCell>{personnel.positions?.[0]?.jobPosition || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    personnel.staffStatus === "working" ? "default" :
                    personnel.staffStatus === "probation" ? "secondary" :
                    personnel.staffStatus === "maternity_leave" ? "outline" : "destructive"
                  }
                >
                  {personnel.staffStatus === "working" ? "Đang làm việc" :
                   personnel.staffStatus === "probation" ? "Thử việc" :
                   personnel.staffStatus === "maternity_leave" ? "Nghỉ thai sản" :
                   personnel.staffStatus === "retired" ? "Đã nghỉ hưu" :
                   personnel.staffStatus === "resigned" ? "Đã nghỉ việc" : "Không xác định"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/staff/${personnel.id}`}>
                    <Button variant="ghost" size="sm" title="Xem chi tiết">
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(personnel.id)}
                    title="Sửa"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(personnel.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Xóa"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
