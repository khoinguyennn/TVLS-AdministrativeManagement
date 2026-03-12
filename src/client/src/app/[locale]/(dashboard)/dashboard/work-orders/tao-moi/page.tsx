"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminWorkOrderForm } from "@/components/work-orders/admin-work-order-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { PersonnelRecord } from "@/types/personnel.types";
import type { CreateWorkOrderPayload } from "@/types/work-order.types";
import { workOrderService } from "@/services/work-order.service";
import { personnelService } from "@/services/personnel.service";

export default function CreateWorkOrderAdminPage() {
  const router = useRouter();
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = async () => {
    try {
      const data = await personnelService.getAll();
      setPersonnel(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách nhân sự");
    }
  };

  const handleSubmit = async (data: CreateWorkOrderPayload) => {
    setIsLoading(true);
    try {
      await workOrderService.create(data);
      toast.success("Tạo công lệnh thành công");
      router.refresh();
      router.push("/vi/dashboard/work-orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tạo công lệnh";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>

          {/* Title with Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo Phiếu Công Lệnh Đi Công Tác
            </h1>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <AdminWorkOrderForm
            personnel={personnel}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
