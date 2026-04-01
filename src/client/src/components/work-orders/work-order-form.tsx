"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const workOrderSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề công lệnh"),
  content: z.string().min(1, "Vui lòng nhập nội dung công việc"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  note: z.string().optional(),
  assignedToIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 nhân viên"),
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonnelList, setShowPersonnelList] = useState(false);

  const activePersonnel = useMemo(() => {
    const active = personnel.filter((p) => p.staffStatus !== "resigned");
    const seen = new Set<number>();
    return active.filter((p) => {
      const key = p.userId ?? p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [personnel]);

  const filteredPersonnel = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return activePersonnel;

    const query = removeAccents(rawQuery);
    const rawLower = rawQuery.toLowerCase();

    return activePersonnel.filter((p) => {
      const nameNorm = removeAccents(p.fullName);
      const code = p.code?.toLowerCase() || "";
      return nameNorm.includes(query) || code.includes(rawLower);
    });
  }, [activePersonnel, searchQuery]);

  const initialAssignedIds = useMemo(() => {
    const ids = workOrder?.assignees?.map((a) => a.assigned_to_user_id) ?? [];
    if (ids.length > 0) return Array.from(new Set(ids));
    return workOrder?.assignedTo ? [workOrder.assignedTo] : [];
  }, [workOrder]);

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: workOrder?.title || "",
      content: workOrder?.content || "",
      location: workOrder?.location || "",
      startDate: workOrder?.startDate?.split('T')[0] || "",
      endDate: workOrder?.endDate?.split('T')[0] || "",
      note: workOrder?.note || "",
      assignedToIds: initialAssignedIds,
    },
  });

  useEffect(() => {
    form.reset({
      title: workOrder?.title || "",
      content: workOrder?.content || "",
      location: workOrder?.location || "",
      startDate: workOrder?.startDate?.split('T')[0] || "",
      endDate: workOrder?.endDate?.split('T')[0] || "",
      note: workOrder?.note || "",
      assignedToIds: initialAssignedIds,
    });
    setSearchQuery("");
    setShowPersonnelList(false);
  }, [form, initialAssignedIds, workOrder]);

  const handleSubmit = async (data: WorkOrderFormData) => {
    const submitData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
      assignedToIds: Array.from(new Set(data.assignedToIds)),
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
            name="assignedToIds"
            render={({ field }) => {
              const selectedIds = field.value ?? [];
              const selectedPersonnel = activePersonnel.filter((p) => selectedIds.includes(p.userId ?? p.id));

              return (
                <FormItem>
                  <FormLabel>Nhân viên được giao *</FormLabel>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Nhập tên hoặc mã nhân sự..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowPersonnelList(true);
                        }}
                        onFocus={() => setShowPersonnelList(true)}
                        className="h-10 border-gray-300 pl-10"
                      />
                    </div>

                    {selectedPersonnel.length > 0 && (
                      <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3">
                        {selectedPersonnel.map((person) => (
                          <span key={person.userId ?? person.id} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <UserRound className="h-3.5 w-3.5" />
                            {person.fullName}
                          </span>
                        ))}
                      </div>
                    )}

                    {showPersonnelList && (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
                        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                          {filteredPersonnel.length > 0 ? (
                            filteredPersonnel.map((person, index) => {
                              const personKey = person.userId ?? person.id;
                              const isSelected = selectedIds.includes(personKey);
                              return (
                                <button
                                  key={`${personKey}-${index}`}
                                  type="button"
                                  onClick={() => {
                                    const nextIds = isSelected
                                      ? selectedIds.filter((id) => id !== personKey)
                                      : Array.from(new Set([...selectedIds, personKey]));
                                    field.onChange(nextIds);
                                  }}
                                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                                    isSelected
                                      ? "border-blue-300 bg-blue-50"
                                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <p className="text-sm font-medium text-slate-900">{person.fullName}</p>
                                  <p className="text-xs text-slate-500">{person.code} • {person.role}</p>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3 py-4 text-sm text-slate-500">Không tìm thấy nhân sự phù hợp</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
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