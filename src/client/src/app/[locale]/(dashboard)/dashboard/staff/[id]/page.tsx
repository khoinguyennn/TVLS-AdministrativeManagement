"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { DetailPageSkeleton } from "@/components/skeletons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { personnelService } from "@/services/personnel.service";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "react-toastify";

export default function ViewStaffPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [personnel, setPersonnel] = useState<PersonnelRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonnel();
  }, [id]);

  async function loadPersonnel() {
    try {
      setIsLoading(true);
      const data = await personnelService.getById(id);
      setPersonnel(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!personnel) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy nhân sự</p>
        <Link href="/dashboard/staff" className="mt-4 inline-block">
          <Button>Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/staff">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="size-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{personnel.fullName}</h1>
            <p className="text-muted-foreground mt-1">Mã: {personnel.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={personnel.status === "active" ? "default" : "secondary"}>
            {personnel.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </Badge>
          <Link href={`/dashboard/staff/${id}/edit`}>
            <Button>Sửa</Button>
          </Link>
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Họ và tên</p>
              <p className="text-lg font-semibold">{personnel.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mã định danh</p>
              <p className="text-lg font-semibold">{personnel.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giới tính</p>
              <p className="text-lg font-semibold">{personnel.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày sinh</p>
              <p className="text-lg font-semibold">{formatDate(personnel.dateOfBirth)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{personnel.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Phone className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Điện thoại</p>
              <p className="font-semibold">{personnel.contactAddress?.phone || "-"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
              <p className="font-semibold">
                {personnel.contactAddress?.detailAddress || "-"}
              </p>
              {/* Additional address info not available in PersonnelRecord */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin CMT/CCCD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Số CMT/CCCD</p>
              <p className="text-lg font-semibold">{personnel.cccdNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nơi cấp</p>
              <p className="text-lg font-semibold">{personnel.cccdIssuePlace || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày cấp</p>
              <p className="text-lg font-semibold">{formatDate(personnel.cccdIssueDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin công việc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
              <p className="font-semibold">{formatDate(personnel.recruitmentDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
