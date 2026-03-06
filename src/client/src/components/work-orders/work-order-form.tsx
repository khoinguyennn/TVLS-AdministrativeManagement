"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { CreateWorkOrderPayload, UpdateWorkOrderPayload, WorkOrder } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

const workOrderSchema = z.object({
  workLocation: z.string().min(1, "Vui lòng nhập nơi công tác"),
  workContent: z.string().min(1, "Vui lòng nhập nội dung công việc"),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  notes: z.string().optional(),
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
      workLocation: workOrder?.workLocation || "",
      workContent: workOrder?.workContent || "",
      startTime: workOrder?.startTime || "",
      endTime: workOrder?.endTime || "",
      notes: workOrder?.notes || "",
      assignedTo: workOrder?.assignedTo || 0,
    },
  });

  const handleSubmit = async (data: WorkOrderFormData) => {
    // Parse the date-time strings and create proper ISO strings
    const startDateTimeStr = data.startTime;
    const endDateTimeStr = data.endTime;

    // If the strings don't contain 'T', they might be just dates, so add default times
    const startTime = startDateTimeStr.includes('T') ? startDateTimeStr : `${startDateTimeStr}T08:00`;
    const endTime = endDateTimeStr.includes('T') ? endDateTimeStr : `${endDateTimeStr}T17:00`;

    const submitData = {
      ...data,
      startTime,
      endTime,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="workLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nơi công tác *</FormLabel>
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
                      <SelectItem key={person.id} value={person.id.toString()}>
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
          name="workContent"
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
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời gian bắt đầu *</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={field.value?.split('T')[0] || ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = field.value?.split('T')[1] || '08:00';
                        field.onChange(`${date}T${time}`);
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={field.value?.split('T')[1] || '08:00'}
                      onChange={(e) => {
                        const time = e.target.value;
                        const date = field.value?.split('T')[0] || '';
                        field.onChange(`${date}T${time}`);
                      }}
                      className="w-32"
                    />
                  </div>
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
                <FormLabel>Thời gian kết thúc *</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={field.value?.split('T')[0] || ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = field.value?.split('T')[1] || '17:00';
                        field.onChange(`${date}T${time}`);
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={field.value?.split('T')[1] || '17:00'}
                      onChange={(e) => {
                        const time = e.target.value;
                        const date = field.value?.split('T')[0] || '';
                        field.onChange(`${date}T${time}`);
                      }}
                      className="w-32"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
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