"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonnelForm } from "@/components/personnel/personnel-form";
import { personnelService } from "@/services/personnel.service";
import type { CreatePersonnelPayload, PersonnelRecord } from "@/types/personnel.types";
import { toast } from "react-toastify";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [personnel, setPersonnel] = useState<PersonnelRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        userId: id,
        code: "8401555613",
        fullName: "Bùi Hữu Khánh",
        email: "bhkhanh@tvu.edu.vn",
        role: "teacher",
        status: "active",
        gender: "Nam",
        dateOfBirth: "1987-05-12",
        cccdNumber: "084087001648",
        staffStatus: "working",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        contactAddress: {
          phone: "0904789498"
        }
      };
      setPersonnel(mockData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
      router.push("/dashboard/staff");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: CreatePersonnelPayload) {
    setIsSaving(true);
    try {
      // await personnelService.update(id, data);
      // For now, just simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Cập nhật nhân sự thành công");
      router.push("/dashboard/staff");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <FormSkeleton fields={10} columns={2} />;
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="size-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sửa thông tin nhân sự</h1>
          <p className="text-muted-foreground mt-1">Cập nhật thông tin của {personnel.fullName}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhân sự</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonnelForm 
            initialData={personnel} 
            onSubmit={handleSubmit} 
            isLoading={isSaving} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
