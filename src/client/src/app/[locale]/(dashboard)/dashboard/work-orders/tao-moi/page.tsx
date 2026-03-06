"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminWorkOrderForm } from "@/components/work-orders/admin-work-order-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { PersonnelRecord } from "@/types/personnel.types";
import type { CreateWorkOrderPayload } from "@/types/work-order.types";

export default function CreateWorkOrderAdminPage() {
  const router = useRouter();
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = () => {
    try {
      const mockPersonnel: PersonnelRecord[] = [
        { id: 1, code: "NV001", fullName: "Bùi Hữu Khánh", gender: "Nam", dateOfBirth: "1990-01-15", idNumber: "123456789", email: "bui.khanh@example.com", phoneNumber: "0123456789" },
        { id: 2, code: "NV002", fullName: "Bùi Quốc Tân", gender: "Nam", dateOfBirth: "1992-03-20", idNumber: "123456790", email: "bui.tan@example.com", phoneNumber: "0123456789" },
        { id: 3, code: "NV003", fullName: "Bùi Quốc Toàn", gender: "Nam", dateOfBirth: "1988-05-10", idNumber: "123456791", email: "bui.toan@example.com", phoneNumber: "0123456789" },
        { id: 4, code: "NV004", fullName: "Bùi Tú Cảm Loan", gender: "Nữ", dateOfBirth: "1995-07-25", idNumber: "123456792", email: "bui.loan@example.com", phoneNumber: "0123456789" },
        { id: 5, code: "NV005", fullName: "Bùi Văn Cảm", gender: "Nam", dateOfBirth: "1991-09-30", idNumber: "123456793", email: "bui.cam@example.com", phoneNumber: "0123456789" },
      ];
      setPersonnel(mockPersonnel);
    } catch (error) {
      toast.error("Lỗi tải danh sách nhân sự");
    }
  };

  const handleSubmit = async (data: CreateWorkOrderPayload) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Tạo công lệnh thành công");
      router.push("/vi/dashboard/work-orders");
    } catch (error) {
      toast.error("Lỗi tạo công lệnh");
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
