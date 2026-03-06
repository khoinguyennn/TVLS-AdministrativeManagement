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
            <TableHead>Mã định danh</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Giới tính</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>CCCD</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Điện thoại</TableHead>
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
              <TableCell>{personnel.idNumber}</TableCell>
              <TableCell className="text-sm">{personnel.email}</TableCell>
              <TableCell>{personnel.phoneNumber}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    personnel.status === "active" ? "default" : "secondary"
                  }
                >
                  {personnel.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/vi/dashboard/staff/${personnel.id}`}>
                    <Button variant="ghost" size="sm" title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(personnel.id)}
                    title="Sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(personnel.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
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
