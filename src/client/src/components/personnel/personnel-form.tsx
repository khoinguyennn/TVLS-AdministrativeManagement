"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonnelRecord, CreatePersonnelPayload } from "@/types/personnel.types";

const personnelFormSchema = z.object({
  code: z.string().min(1, "Mã định danh là bắt buộc"),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  gender: z.enum(["Nam", "Nữ"]),
  dateOfBirth: z.string().min(1, "Ngày sinh là bắt buộc"),
  idNumber: z.string().min(1, "Số CMT/CCCD là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(1, "Điện thoại là bắt buộc"),
  address: z.string().optional(),
  wardCommune: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  dateIssued: z.string().optional(),
  placeIssued: z.string().optional(),
  startDate: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional()
});

type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

interface PersonnelFormProps {
  initialData?: PersonnelRecord;
  onSubmit: (data: CreatePersonnelPayload) => Promise<void>;
  isLoading?: boolean;
}

export function PersonnelForm({
  initialData,
  onSubmit,
  isLoading = false
}: PersonnelFormProps) {
  const [error, setError] = useState<string>("");

  const form = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: initialData || {
      code: "",
      fullName: "",
      gender: "Nam",
      dateOfBirth: "",
      idNumber: "",
      email: "",
      phoneNumber: "",
      address: "",
      wardCommune: "",
      district: "",
      province: "",
      dateIssued: "",
      placeIssued: "",
      startDate: "",
      status: "active"
    }
  });

  async function handleSubmit(data: PersonnelFormValues) {
    try {
      setError("");
      await onSubmit(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Mã định danh và Họ tên */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã định danh</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập mã định danh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Giới tính và Ngày sinh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh (mm/dd/yyyy)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* CMT/CCCD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số CMT/CCCD</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số CMT/CCCD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateIssued"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày cấp CMT/CCCD (mm/dd/yyyy)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nơi cấp */}
          <FormField
            control={form.control}
            name="placeIssued"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nơi cấp CMT/CCCD</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập nơi cấp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Địa chỉ */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập địa chỉ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tổ/Thôn/Xóm, Huyện, Tỉnh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="wardCommune"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổ/Thôn/Xóm</FormLabel>
                  <FormControl>
                    <Input placeholder="Tổ/Thôn/Xóm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Huyện</FormLabel>
                  <FormControl>
                    <Input placeholder="Huyện" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tỉnh</FormLabel>
                  <FormControl>
                    <Input placeholder="Tỉnh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email và Điện thoại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ngày bắt đầu và Trạng thái */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu (mm/dd/yyyy)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select value={field.value || "active"} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
