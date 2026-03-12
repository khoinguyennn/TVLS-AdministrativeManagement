"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { DetailPageSkeleton } from "@/components/skeletons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { personnelService } from "@/services/personnel.service";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ViewPersonnelPage({ params }: PageProps) {
  const id = parseInt(params.id);
  const [personnel, setPersonnel] = useState<PersonnelRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonnel();
  }, [id]);

  async function loadPersonnel() {
    try {
      setIsLoading(true);
      // await personnelService.getById(id);
      // Mock data for now
      const mockData: PersonnelRecord = {
        id,
        userId: 1,
        code: "8401555613",
        fullName: "Bùi Hữu Khánh",
        email: "bhkhanh@tvu.edu.vn",
        role: "teacher",
        status: "active",
        gender: "Nam",
        dateOfBirth: "1987-05-12",
        cccdNumber: "084087001648",
        cccdIssueDate: "2017-06-15",
        cccdIssuePlace: "Công an TP.Hồ Chí Minh",
        ethnicity: "Kinh",
        religion: "Không",
        staffStatus: "working",
        recruitmentDate: "2020-01-15",
        contactAddress: {
          province: "TP.Hồ Chí Minh",
          ward: "Phường 1",
          hamlet: "Thôn 1",
          detailAddress: "123 Đường Nguyễn Huệ",
          phone: "0904789498"
        },
        createdAt: "2020-01-15T00:00:00Z",
        updatedAt: "2020-01-15T00:00:00Z"
      };
      setPersonnel(mockData);
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
        <p className="text-gray-500">Không tìm thấy nhân sự</p>
        <Link href="/dashboard/records" className="mt-4 inline-block">
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
          <Link href="/dashboard/records">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{personnel.fullName}</h1>
            <p className="text-gray-500 mt-1">Mã: {personnel.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={personnel.status === "active" ? "default" : "secondary"}>
            {personnel.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </Badge>
          <Link href={`/dashboard/records/${id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">Sửa</Button>
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
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="text-lg font-semibold">{personnel.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mã định danh</p>
              <p className="text-lg font-semibold">{personnel.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Giới tính</p>
              <p className="text-lg font-semibold">{personnel.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày sinh</p>
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
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{personnel.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Điện thoại</p>
              <p className="font-semibold">{personnel.contactAddress?.phone || "N/A"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-semibold">
                {personnel.contactAddress?.detailAddress || "-"}
              </p>
              {/* No wardCommune, district, province in PersonnelRecord. If needed, use contactAddress fields. */}
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
              <p className="text-sm text-gray-500">Số CMT/CCCD</p>
              <p className="text-lg font-semibold">{personnel.cccdNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nơi cấp</p>
              <p className="text-lg font-semibold">{personnel.cccdIssuePlace || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày cấp</p>
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
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Ngày bắt đầu</p>
              <p className="font-semibold">{formatDate(personnel.recruitmentDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
