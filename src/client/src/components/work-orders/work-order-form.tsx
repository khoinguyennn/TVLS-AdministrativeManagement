"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import type { CreateWorkOrderPayload, UpdateWorkOrderPayload, WorkOrder } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

const workOrderSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề công lệnh"),
  content: z.string().min(1, "Vui lòng nhập nội dung công việc"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  note: z.string().optional(),
  assignedTo: z.number().min(1, "Vui lòng chọn nhân viên được giao"),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  personnel: PersonnelRecord[];
  onSubmit: (data: CreateWorkOrderPayload | UpdateWorkOrderPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkOrderForm({
  workOrder,
  personnel,
  onSubmit,
  onCancel,
  isLoading = false
}: WorkOrderFormProps) {
  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: workOrder?.title || "",
      content: workOrder?.content || "",
      location: workOrder?.location || "",
      startDate: workOrder?.startDate?.split('T')[0] || "",
      endDate: workOrder?.endDate?.split('T')[0] || "",
      note: workOrder?.note || "",
      assignedTo: workOrder?.assignedTo || 0,
    },
  });

  const handleSubmit = async (data: WorkOrderFormData) => {
    const submitData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề công lệnh *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: Bảo trì máy chiếu phòng 101"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhân viên được giao *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {personnel.map((person) => (
                    <SelectItem key={person.id} value={(person.userId ?? person.id).toString()}>
                        {person.fullName} ({person.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung công việc *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết công việc cần thực hiện"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa điểm thực hiện</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: Phòng 101, Tòa nhà A"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ghi chú bổ sung"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày bắt đầu *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày kết thúc *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Thông tin bổ sung (tùy chọn)"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : workOrder ? "Cập nhật" : "Tạo công lệnh"}
          </Button>
        </div>
      </form>
    </Form>
  );
}