"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonnelForm } from "@/components/personnel/personnel-form";
import { personnelService } from "@/services/personnel.service";
import type { CreatePersonnelPayload } from "@/types/personnel.types";
import { toast } from "react-toastify";

export default function AddStaffPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreatePersonnelPayload) {
    setIsLoading(true);
    try {
      // await personnelService.create(data);
      // For now, just simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Thêm nhân sự thành công");
      router.push("/dashboard/staff");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Thêm nhân sự</h1>
          <p className="text-muted-foreground mt-1">Điền thông tin chi tiết của nhân sự mới</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhân sự</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonnelForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
