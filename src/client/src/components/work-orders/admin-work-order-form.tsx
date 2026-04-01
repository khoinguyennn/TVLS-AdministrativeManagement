"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BriefcaseBusiness, CalendarClock, CircleAlert, MapPin, Search, UserRound } from "lucide-react";

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
import type { CreateWorkOrderPayload } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";
import type { User } from "@/types/auth.types";

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const adminWorkOrderSchema = z.object({
  assignedTo: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 nhân sự"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề công lệnh"),
  content: z.string().min(1, "Vui lòng nhập nội dung công tác"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  workDays: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((value, ctx) => {
  if (!value.startDate || !value.endDate) return;
  const start = new Date(value.startDate);
  const end = new Date(value.endDate);
  if (end < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
    });
  }
});

type AdminWorkOrderFormData = z.infer<typeof adminWorkOrderSchema>;

interface AdminWorkOrderFormProps {
  personnel: PersonnelRecord[];
  currentUser?: Pick<User, "id" | "fullName" | "role"> | null;
  onSubmit: (data: CreateWorkOrderPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdminWorkOrderForm({
  personnel,
  currentUser,
  onSubmit,
  onCancel,
  isLoading = false
}: AdminWorkOrderFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonnelList, setShowPersonnelList] = useState(false);

  const form = useForm<AdminWorkOrderFormData>({
    resolver: zodResolver(adminWorkOrderSchema),
    defaultValues: {
      assignedTo: [],
      title: "",
      content: "",
      location: "",
      startDate: "",
      endDate: "",
      workDays: "",
      notes: "",
    },
  });

  const isSelfAssignCreator = currentUser?.role === "teacher" || currentUser?.role === "technician";

  useEffect(() => {
    if (!isSelfAssignCreator || !currentUser) return;
    form.setValue("assignedTo", [currentUser.id]);
    setSearchQuery(currentUser.fullName);
    setShowPersonnelList(false);
  }, [isSelfAssignCreator, currentUser, form]);

  const activePersonnel = useMemo(() => {
    const active = personnel.filter((p) => p.staffStatus !== "resigned");
    // Loại bỏ trùng lặp theo userId
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

    // Tách thành 2 nhóm: khớp và không khớp
    const matched: PersonnelRecord[] = [];
    const unmatched: PersonnelRecord[] = [];

    for (const p of activePersonnel) {
      const nameNorm = removeAccents(p.fullName);
      const code = p.code?.toLowerCase() || "";
      if (nameNorm.includes(query) || code.includes(rawLower)) {
        matched.push(p);
      } else {
        unmatched.push(p);
      }
    }

    console.log("[Search Debug]", { rawQuery, query, matchedCount: matched.length, matchedNames: matched.map(m => m.fullName) });

    // Sắp xếp nhóm khớp theo mức độ liên quan
    matched.sort((a, b) => {
      const aN = removeAccents(a.fullName);
      const bN = removeAccents(b.fullName);

      // Khớp chính xác tên
      if (a.fullName.toLowerCase() === rawLower) return -1;
      if (b.fullName.toLowerCase() === rawLower) return 1;

      // Bắt đầu bằng từ khóa
      const aS = aN.startsWith(query);
      const bS = bN.startsWith(query);
      if (aS && !bS) return -1;
      if (!aS && bS) return 1;

      return a.fullName.localeCompare(b.fullName, "vi");
    });

    // Nối: khớp trước, không khớp sau
    return [...matched, ...unmatched];
  }, [activePersonnel, searchQuery]);

  const calculateWorkDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDateChange = () => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");
    if (startDate && endDate) {
      const days = calculateWorkDays(startDate, endDate);
      form.setValue("workDays", days > 0 ? days.toString() : "");
    }
  };

  const handlePersonnelSelect = (person: PersonnelRecord) => {
    const personId = person.userId ?? person.id;
    const selectedIds = form.getValues("assignedTo");
    const nextIds = selectedIds.includes(personId)
      ? selectedIds.filter((id) => id !== personId)
      : Array.from(new Set([...selectedIds, personId]));

    form.setValue("assignedTo", nextIds, { shouldValidate: true });
    setSearchQuery("");
    setShowPersonnelList(true);
  };

  const toIsoWithCurrentLocalTime = (dateInput: string) => {
    if (!dateInput) return undefined;

    if (dateInput.includes("T")) {
      return new Date(dateInput).toISOString();
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    // Avoid Date("YYYY-MM-DD") UTC parsing which shifts to 07:00 in +07 timezone.
    return new Date(`${dateInput}T${hh}:${mm}:${ss}`).toISOString();
  };

  const handleSubmit = async (data: AdminWorkOrderFormData) => {
    const startDateIso = toIsoWithCurrentLocalTime(data.startDate);
    const endDateIso = toIsoWithCurrentLocalTime(data.endDate);

    const finalAssigneeIds = isSelfAssignCreator
      ? (currentUser?.id ? [currentUser.id] : [])
      : Array.from(new Set(data.assignedTo));

    const submitData: CreateWorkOrderPayload = {
      title: data.title,
      content: data.content,
      location: data.location || undefined,
      startDate: startDateIso || new Date().toISOString(),
      endDate: endDateIso || new Date().toISOString(),
      note: data.notes,
      assignedToIds: finalAssigneeIds,
    };

    await onSubmit(submitData);
  };

  const selectedIds = form.watch("assignedTo");
  const selectedPersonnel = personnel.filter((p) => selectedIds.includes(p.userId ?? p.id));
  const selectedName = isSelfAssignCreator
    ? currentUser?.fullName
    : selectedPersonnel.length
      ? selectedPersonnel.map((p) => p.fullName).join(", ")
      : undefined;
  const selectedCount = isSelfAssignCreator ? 1 : selectedIds.length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-white p-2 text-blue-700 shadow-sm">
              <CircleAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Phiếu công lệnh công tác</p>
              <p className="text-sm text-blue-800">Điền thông tin bên dưới để tạo công lệnh theo đúng dữ liệu hệ thống work_orders.</p>
            </div>
          </div>
        </div>

        {isSelfAssignCreator && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <UserRound className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold">Người thực hiện</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="mb-1 text-xs text-slate-500">Họ và tên</p>
                <p className="text-sm font-semibold text-slate-900">{selectedName ?? "Chưa xác định"}</p>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="mb-1 text-xs text-slate-500">Vai trò</p>
                <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
              </div>
            </div>
          </div>
        )}

        {!isSelfAssignCreator && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <UserRound className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold">Nhân sự thực hiện</p>
            </div>
            <p className="text-xs text-slate-500">Nguồn dữ liệu từ hồ sơ nhân sự</p>
          </div>

          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-slate-700">Tìm và chọn nhân sự</FormLabel>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Nhập tên hoặc mã nhân sự..."
                value={searchQuery}
                onChange={(e) => {
                  if (isSelfAssignCreator) return;
                  setSearchQuery(e.target.value);
                  setShowPersonnelList(true);
                }}
                onFocus={() => {
                  if (!isSelfAssignCreator) setShowPersonnelList(true);
                }}
                readOnly={isSelfAssignCreator}
                className="h-10 border-gray-300 pl-10"
              />
            </div>
          </div>

          {showPersonnelList && !isSelfAssignCreator && (
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-2">
              <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                {filteredPersonnel.length > 0 ? (
                  filteredPersonnel.map((person, index) => {
                    const personKey = person.userId ?? person.id;
                    const isSelected = selectedIds.includes(personKey);
                    return (
                      <button
                        key={`${personKey}-${index}`}
                        type="button"
                        onClick={() => handlePersonnelSelect(person)}
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
                  <p className="px-2 py-5 text-center text-sm text-slate-500">Không tìm thấy nhân sự phù hợp.</p>
                )}
              </div>
            </div>
          )}

          {form.formState.errors.assignedTo?.message && (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.assignedTo.message}</p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <UserRound className="h-3.5 w-3.5" /> Họ và tên
              </p>
              <p className="text-sm font-semibold text-slate-900">{selectedName ?? "Chưa chọn"}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <BriefcaseBusiness className="h-3.5 w-3.5" /> Số nhân sự
              </p>
              <p className="text-sm font-semibold text-slate-900">{selectedCount}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 md:col-span-2">
              <p className="mb-1 text-xs text-slate-500">Nhân sự đã chọn</p>
              <p className="text-sm font-semibold text-slate-900">{selectedName ?? "Chưa chọn"}</p>
            </div>
          </div>
        </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <CalendarClock className="h-4 w-4 text-indigo-600" />
            <p className="text-sm font-semibold">Thông tin công lệnh</p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Tiêu đề công lệnh <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Cử viên chức tham dự hội nghị chuyên môn"
                      className="h-10 border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Nội dung công tác <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết nhiệm vụ, mục tiêu và yêu cầu thực hiện..."
                      className="min-h-[96px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Từ ngày <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-10 border-gray-300"
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
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Đến ngày <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-10 border-gray-300"
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
                  <FormLabel className="text-sm font-medium text-slate-700">Số ngày công tác</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Tự động tính"
                      className="h-10 border-gray-300 bg-gray-100"
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Nơi công tác
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Trường THSP - Cơ sở A2"
                      className="h-10 border-gray-300"
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
                  <FormLabel className="text-sm font-medium text-slate-700">Ghi chú thêm</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thông tin bổ sung (nếu có)..."
                      className="min-h-[88px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 border-gray-300 px-6"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 bg-blue-600 px-6 hover:bg-blue-700"
          >
            {isLoading ? "Đang gửi..." : "Gửi công lệnh"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
