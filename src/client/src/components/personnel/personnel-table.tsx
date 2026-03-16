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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/env";
import type { PersonnelRecord } from "@/types/personnel.types";

interface PersonnelTableProps {
  data: PersonnelRecord[];
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  startIndex?: number;
}

export function PersonnelTable({
  data,
  onDelete,
  isLoading = false,
}: PersonnelTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarUrl = (src?: string | null) => {
    if (!src) return undefined;
    if (src.startsWith("blob:") || src.startsWith("http")) return src;
    return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
  };

  const getRoleBadgeClass = (role: string) => {
    const roleKey = role.toLowerCase();
    if (roleKey.includes("quản") || roleKey.includes("trưởng")) {
      return "bg-violet-100 text-violet-700 border-transparent";
    }
    if (roleKey.includes("giáo")) {
      return "bg-emerald-100 text-emerald-700 border-transparent";
    }
    if (roleKey.includes("kỹ thuật") || roleKey.includes("kĩ thuật")) {
      return "bg-amber-100 text-amber-700 border-transparent";
    }
    return "bg-slate-100 text-slate-700 border-transparent";
  };

  const getStatusConfig = (status: PersonnelRecord["staffStatus"]) => {
    const config: Record<
      NonNullable<PersonnelRecord["staffStatus"]>,
      { label: string; dotClass: string; textClass: string }
    > = {
      working: {
        label: "Hoạt động",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-600",
      },
      probation: {
        label: "Thử việc",
        dotClass: "bg-amber-500",
        textClass: "text-amber-600",
      },
      maternity_leave: {
        label: "Nghỉ thai sản",
        dotClass: "bg-slate-400",
        textClass: "text-slate-500",
      },
      retired: {
        label: "Đã nghỉ hưu",
        dotClass: "bg-slate-400",
        textClass: "text-slate-500",
      },
      resigned: {
        label: "Đã nghỉ việc",
        dotClass: "bg-red-500",
        textClass: "text-red-600",
      },
    };

    return config[status] ?? {
      label: "Không xác định",
      dotClass: "bg-slate-400",
      textClass: "text-slate-500",
    };
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Người dùng</TableHead>
            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Email</TableHead>
            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Vai trò</TableHead>
            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Trạng thái</TableHead>
            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((personnel) => {
            const roleLabel = personnel.positions?.[0]?.jobPosition || "Chưa phân vai trò";
            const status = getStatusConfig(personnel.staffStatus);

            return (
              <TableRow key={personnel.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={getAvatarUrl(personnel.avatar)} alt={personnel.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(personnel.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{personnel.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{personnel.code}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {personnel.email || "-"}
                </TableCell>

                <TableCell className="px-6 py-4">
                  <Badge className={getRoleBadgeClass(roleLabel)}>{roleLabel}</Badge>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.textClass}`}>
                    <span className={`size-1.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                  </span>
                </TableCell>

                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/dashboard/staff/${personnel.id}`}>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" title="Xem chi tiết">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    <Link href={`/vi/dashboard/staff/${personnel.id}/edit`}>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" title="Sửa">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(personnel.id)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                      title="Xóa"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
