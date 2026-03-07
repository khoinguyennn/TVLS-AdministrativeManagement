"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { CreateWorkOrderPayload } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

const adminWorkOrderSchema = z.object({
  assignedTo: z.number().min(1, "Vui lòng chọn nhân sự"),
  workContent: z.string().min(1, "Vui lòng nhập nội dung công lệnh"),
  workUsage: z.string().min(1, "Vui lòng nhập nội dùng công tác"),
  startTime: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  workDays: z.string().optional(),
  notes: z.string().optional(),
});

type AdminWorkOrderFormData = z.infer<typeof adminWorkOrderSchema>;

interface AdminWorkOrderFormProps {
  personnel: PersonnelRecord[];
  onSubmit: (data: CreateWorkOrderPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdminWorkOrderForm({
  personnel,
  onSubmit,
  onCancel,
  isLoading = false
}: AdminWorkOrderFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonnelList, setShowPersonnelList] = useState(false);

  const form = useForm<AdminWorkOrderFormData>({
    resolver: zodResolver(adminWorkOrderSchema),
    defaultValues: {
      assignedTo: 0,
      workContent: "",
      workUsage: "",
      startTime: "",
      endTime: "",
      workDays: "",
      notes: "",
    },
  });

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [personnel, searchQuery]);

  const calculateWorkDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDateChange = () => {
    const startDate = form.getValues("startTime");
    const endDate = form.getValues("endTime");
    if (startDate && endDate) {
      const days = calculateWorkDays(startDate, endDate);
      form.setValue("workDays", days.toString());
    }
  };

  const handlePersonnelSelect = (personId: number, personName: string) => {
    form.setValue("assignedTo", personId);
    setSearchQuery(personName);
    setShowPersonnelList(false);
  };

  const handleSubmit = async (data: AdminWorkOrderFormData) => {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    const submitData: CreateWorkOrderPayload = {
      workLocation: "",
      workContent: data.workContent,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      notes: data.notes,
      assignedTo: data.assignedTo,
    };

    await onSubmit(submitData);
  };

  const selectedPerson = personnel.find(p => p.id === form.watch("assignedTo"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            Vui lòng điền thông tin vào phiếu bên dưới rồi nhấn <strong>Gửi công lệnh</strong>.
          </div>
        </div>

        {/* Personnel Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 mb-1">👤 Họ và tên:</p>
              <p className="font-medium text-gray-900">
                {selectedPerson ? selectedPerson.fullName : "Không xác định"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 mb-1">💼 Chức vụ:</p>
              <p className="font-medium text-gray-900">Không xác định</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 mb-1">📋 Tổ chuyên môn:</p>
              <p className="font-medium text-gray-900">Không xác định</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 mb-1">📍 Vị trí việc làm:</p>
              <p className="font-medium text-gray-900">Không xác định</p>
            </div>
          </div>
        </div>

        {/* Personnel Search */}
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium text-gray-700">
            🔍 Tìm nhân sự
          </FormLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Nhập tên để tìm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowPersonnelList(true);
              }}
              onFocus={() => setShowPersonnelList(true)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>

          {showPersonnelList && filteredPersonnel.length > 0 && (
            <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-50 w-full mt-1 max-h-64 overflow-y-auto">
              {filteredPersonnel.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handlePersonnelSelect(person.id, person.fullName)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <p className="text-sm font-medium text-gray-900">{person.fullName}</p>
                  <p className="text-xs text-gray-500">{person.code}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Personnel List */}
        {personnel.length > 0 && (
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              👥 Chọn viên chức đi công tác
            </FormLabel>
            <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              {personnel.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handlePersonnelSelect(person.id, person.fullName)}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition-colors ${
                    form.watch("assignedTo") === person.id ? "bg-blue-100" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{person.fullName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <FormField
            control={form.control}
            name="workContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nội dung <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập nội dung công tác"
                    className="min-h-[80px] bg-white border-gray-300 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workUsage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nội dung công tác <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Vì đây dự hội nghị chuyên môn..."
                    className="min-h-[80px] bg-white border-gray-300 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Từ ngày <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-white border-gray-300"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setTimeout(handleDateChange, 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Đến ngày <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-white border-gray-300"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setTimeout(handleDateChange, 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="workDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Số ngày công tác
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Tự động tính"
                    className="bg-gray-100 border-gray-300"
                    readOnly
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Ghi chú (nếu có)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ghi chú thêm..."
                    className="min-h-[80px] bg-white border-gray-300 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Đang gửi..." : "Gửi công lệnh"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
