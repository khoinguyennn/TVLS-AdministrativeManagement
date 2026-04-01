"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { AdminWorkOrderForm } from "@/components/work-orders/admin-work-order-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { PersonnelRecord } from "@/types/personnel.types";
import type { CreateWorkOrderPayload } from "@/types/work-order.types";
import { workOrderService } from "@/services/work-order.service";
import { personnelService } from "@/services/personnel.service";

export default function CreateWorkOrderAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPersonnel();
  }, [user?.id, user?.role]);

  const loadPersonnel = async () => {
    try {
      if (!user) return;

      if (user.role === "teacher" || user.role === "technician") {
        setPersonnel([]);
        return;
      }

      const allPersonnel = await personnelService.getAllForSelection();
      setPersonnel(allPersonnel);
    } catch (error) {
      toast.error("Lỗi tải danh sách nhân sự");
    }
  };

  const handleSubmit = async (data: CreateWorkOrderPayload) => {
    setIsLoading(true);
    try {
      await workOrderService.create(data);
      const successMsg =
        (data.assignedToIds?.length ?? 1) > 1
          ? `Tạo công lệnh công tác thành công cho ${data.assignedToIds?.length} nhân sự`
          : "Tạo công lệnh thành công";
      toast.success(successMsg);
      router.refresh();
      router.push("/vi/dashboard/work-orders");
    } catch (error) {
      const message =
        error instanceof AxiosError && error.response?.data?.message
          ? String(error.response.data.message)
          : error instanceof Error
            ? error.message
            : "Lỗi tạo công lệnh";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Tạo Phiếu Công Lệnh Đi Công Tác
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Thông tin sẽ được lưu vào bảng work_orders theo cấu trúc dữ liệu hiện tại.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <AdminWorkOrderForm
          personnel={personnel}
          currentUser={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
