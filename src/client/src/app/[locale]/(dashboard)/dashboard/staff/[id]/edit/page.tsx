"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonnelForm } from "@/components/personnel/personnel-form";
import { personnelService } from "@/services/personnel.service";
import type { CreatePersonnelPayload, PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

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
      const data = await personnelService.getById(id);
      setPersonnel(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
      router.push("/vi/dashboard/staff");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: CreatePersonnelPayload) {
    setIsSaving(true);
    try {
      await personnelService.update(id, data);
      toast.success("Cập nhật nhân sự thành công");
      router.push("/vi/dashboard/staff");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy nhân sự</p>
        <Link href="/vi/dashboard/staff" className="mt-4 inline-block">
          <Button>Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vi/dashboard/staff">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sửa thông tin nhân sự</h1>
          <p className="text-gray-500 mt-1">Cập nhật thông tin của {personnel.fullName}</p>
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
