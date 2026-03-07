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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PersonnelRecord, CreatePersonnelPayload } from "@/types/personnel.types";

const personnelFormSchema = z.object({
  // User info
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  role: z.enum(["admin", "manager", "teacher", "technician"]),
  status: z.enum(["active", "inactive", "locked"]).optional(),

  // Staff profile
  staffCode: z.string().min(1, "Mã nhân viên là bắt buộc"),
  gender: z.enum(["Nam", "Nữ", "Khác"]),
  dateOfBirth: z.string().optional(),
  cccdNumber: z.string().optional(),
  cccdIssueDate: z.string().optional(),
  cccdIssuePlace: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  staffStatus: z.enum(["working", "probation", "maternity_leave", "retired", "resigned"]).optional(),
  recruitmentDate: z.string().optional(),

  // Contact address
  contactProvince: z.string().optional(),
  contactWard: z.string().optional(),
  contactHamlet: z.string().optional(),
  contactDetailAddress: z.string().optional(),
  contactPhone: z.string().optional(),

  // Hometown address
  hometownProvince: z.string().optional(),
  hometownWard: z.string().optional(),
  hometownHamlet: z.string().optional(),
  hometownDetailAddress: z.string().optional(),

  // Organizations
  isUnionMember: z.boolean().optional(),
  unionJoinDate: z.string().optional(),
  isPartyMember: z.boolean().optional(),
  partyJoinDate: z.string().optional(),

  // Bank account (simplified - single account for now)
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountNumber: z.string().optional(),

  // Position (simplified - single position for now)
  jobPosition: z.string().optional(),
  positionGroup: z.string().optional(),
  recruitmentAgency: z.string().optional(),
  professionWhenRecruited: z.string().optional(),
  rankLevel: z.string().optional(),
  educationLevel: z.string().optional(),
  rankCode: z.string().optional(),
  subjectGroup: z.string().optional(),
  contractType: z.string().optional(),

  // Qualification (simplified - single qualification for now)
  generalEducationLevel: z.string().optional(),
  professionalLevel: z.string().optional(),
  major: z.string().optional(),
  trainingPlace: z.string().optional(),
  graduationYear: z.coerce.number().optional(),
  itLevel: z.string().optional(),
  foreignLanguageLevel: z.string().optional(),

  // Salary (simplified - single salary for now)
  salaryCoefficient: z.coerce.number().optional(),
  salaryLevel: z.coerce.number().optional(),
  baseSalary: z.coerce.number().optional(),
  salaryStartDate: z.string().optional(),
  unionAllowancePercent: z.coerce.number().optional(),
  seniorityAllowancePercent: z.coerce.number().optional(),
  incentiveAllowancePercent: z.coerce.number().optional(),
  positionAllowancePercent: z.coerce.number().optional(),
  salaryNote: z.string().optional(),
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
    resolver: zodResolver(personnelFormSchema) as any,
    defaultValues: {
      // User info
      email: initialData?.email || "",
      fullName: initialData?.fullName || "",
      role: initialData?.role || "teacher",
      status: initialData?.status || "active",

      // Staff profile
      staffCode: initialData?.code || "",
      gender: initialData?.gender || "Nam",
      dateOfBirth: initialData?.dateOfBirth || "",
      cccdNumber: initialData?.cccdNumber || "",
      cccdIssueDate: initialData?.cccdIssueDate || "",
      cccdIssuePlace: initialData?.cccdIssuePlace || "",
      ethnicity: initialData?.ethnicity || "",
      religion: initialData?.religion || "",
      staffStatus: initialData?.staffStatus || "working",
      recruitmentDate: initialData?.recruitmentDate || "",

      // Contact address
      contactProvince: initialData?.contactAddress?.province || "",
      contactWard: initialData?.contactAddress?.ward || "",
      contactHamlet: initialData?.contactAddress?.hamlet || "",
      contactDetailAddress: initialData?.contactAddress?.detailAddress || "",
      contactPhone: initialData?.contactAddress?.phone || "",

      // Hometown address
      hometownProvince: initialData?.hometownAddress?.province || "",
      hometownWard: initialData?.hometownAddress?.ward || "",
      hometownHamlet: initialData?.hometownAddress?.hamlet || "",
      hometownDetailAddress: initialData?.hometownAddress?.detailAddress || "",

      // Organizations
      isUnionMember: initialData?.organizations?.isUnionMember || false,
      unionJoinDate: initialData?.organizations?.unionJoinDate || "",
      isPartyMember: initialData?.organizations?.isPartyMember || false,
      partyJoinDate: initialData?.organizations?.partyJoinDate || "",

      // Bank account
      bankName: initialData?.bankAccounts?.[0]?.bankName || "",
      bankBranch: initialData?.bankAccounts?.[0]?.branch || "",
      accountNumber: initialData?.bankAccounts?.[0]?.accountNumber || "",

      // Position
      jobPosition: initialData?.positions?.[0]?.jobPosition || "",
      positionGroup: initialData?.positions?.[0]?.positionGroup || "",
      recruitmentAgency: initialData?.positions?.[0]?.recruitmentAgency || "",
      professionWhenRecruited: initialData?.positions?.[0]?.professionWhenRecruited || "",
      rankLevel: initialData?.positions?.[0]?.rankLevel || "",
      educationLevel: initialData?.positions?.[0]?.educationLevel || "",
      rankCode: initialData?.positions?.[0]?.rankCode || "",
      subjectGroup: initialData?.positions?.[0]?.subjectGroup || "",
      contractType: initialData?.positions?.[0]?.contractType || "",

      // Qualification
      generalEducationLevel: initialData?.qualifications?.[0]?.generalEducationLevel || "",
      professionalLevel: initialData?.qualifications?.[0]?.professionalLevel || "",
      major: initialData?.qualifications?.[0]?.major || "",
      trainingPlace: initialData?.qualifications?.[0]?.trainingPlace || "",
      graduationYear: initialData?.qualifications?.[0]?.graduationYear,
      itLevel: initialData?.qualifications?.[0]?.itLevel || "",
      foreignLanguageLevel: initialData?.qualifications?.[0]?.foreignLanguageLevel || "",

      // Salary
      salaryCoefficient: initialData?.salaries?.[0]?.salaryCoefficient,
      salaryLevel: initialData?.salaries?.[0]?.salaryLevel,
      baseSalary: initialData?.salaries?.[0]?.baseSalary,
      salaryStartDate: initialData?.salaries?.[0]?.salaryStartDate || "",
      unionAllowancePercent: initialData?.salaries?.[0]?.unionAllowancePercent,
      seniorityAllowancePercent: initialData?.salaries?.[0]?.seniorityAllowancePercent,
      incentiveAllowancePercent: initialData?.salaries?.[0]?.incentiveAllowancePercent,
      positionAllowancePercent: initialData?.salaries?.[0]?.positionAllowancePercent,
      salaryNote: initialData?.salaries?.[0]?.salaryNote || "",
    } as PersonnelFormValues
  });

  async function handleSubmit(data: PersonnelFormValues) {
    try {
      setError("");

      const payload: CreatePersonnelPayload = {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        status: data.status,
        staffCode: data.staffCode,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        cccdNumber: data.cccdNumber,
        cccdIssueDate: data.cccdIssueDate,
        cccdIssuePlace: data.cccdIssuePlace,
        ethnicity: data.ethnicity,
        religion: data.religion,
        staffStatus: data.staffStatus,
        recruitmentDate: data.recruitmentDate,

        contactAddress: {
          province: data.contactProvince,
          ward: data.contactWard,
          hamlet: data.contactHamlet,
          detailAddress: data.contactDetailAddress,
          phone: data.contactPhone,
        },

        hometownAddress: {
          province: data.hometownProvince,
          ward: data.hometownWard,
          hamlet: data.hometownHamlet,
          detailAddress: data.hometownDetailAddress,
        },

        organizations: {
          isUnionMember: data.isUnionMember,
          unionJoinDate: data.unionJoinDate,
          isPartyMember: data.isPartyMember,
          partyJoinDate: data.partyJoinDate,
        },

        bankAccounts: data.bankName || data.bankBranch || data.accountNumber ? [{
          bankName: data.bankName,
          branch: data.bankBranch,
          accountNumber: data.accountNumber,
        }] : undefined,

        positions: data.jobPosition || data.positionGroup ? [{
          jobPosition: data.jobPosition,
          positionGroup: data.positionGroup,
          recruitmentAgency: data.recruitmentAgency,
          professionWhenRecruited: data.professionWhenRecruited,
          rankLevel: data.rankLevel,
          educationLevel: data.educationLevel,
          rankCode: data.rankCode,
          subjectGroup: data.subjectGroup,
          contractType: data.contractType,
        }] : undefined,

        qualifications: data.generalEducationLevel || data.professionalLevel ? [{
          generalEducationLevel: data.generalEducationLevel,
          professionalLevel: data.professionalLevel,
          major: data.major,
          trainingPlace: data.trainingPlace,
          graduationYear: data.graduationYear,
          itLevel: data.itLevel,
          foreignLanguageLevel: data.foreignLanguageLevel,
        }] : undefined,

        salaries: data.salaryCoefficient || data.baseSalary ? [{
          salaryCoefficient: data.salaryCoefficient,
          salaryLevel: data.salaryLevel,
          baseSalary: data.baseSalary,
          salaryStartDate: data.salaryStartDate,
          unionAllowancePercent: data.unionAllowancePercent,
          seniorityAllowancePercent: data.seniorityAllowancePercent,
          incentiveAllowancePercent: data.incentiveAllowancePercent,
          positionAllowancePercent: data.positionAllowancePercent,
          salaryNote: data.salaryNote,
        }] : undefined,
      };

      await onSubmit(payload);
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
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="contact">Liên hệ</TabsTrigger>
              <TabsTrigger value="work">Công việc</TabsTrigger>
              <TabsTrigger value="qualification">Trình độ</TabsTrigger>
              <TabsTrigger value="organization">Tổ chức</TabsTrigger>
              <TabsTrigger value="salary">Lương</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email và Họ tên */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Nhập email" {...field} />
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
                          <FormLabel>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Vai trò và Trạng thái */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vai trò</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Quản trị viên</SelectItem>
                              <SelectItem value="manager">Quản lý</SelectItem>
                              <SelectItem value="teacher">Giáo viên</SelectItem>
                              <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái tài khoản</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Không hoạt động</SelectItem>
                              <SelectItem value="locked">Đã khóa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Mã nhân viên và Giới tính */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="staffCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã nhân viên *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã nhân viên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <SelectItem value="Khác">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ngày sinh và Trạng thái nhân viên */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày sinh</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="staffStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái nhân viên</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="working">Đang làm việc</SelectItem>
                              <SelectItem value="probation">Thử việc</SelectItem>
                              <SelectItem value="maternity_leave">Nghỉ thai sản</SelectItem>
                              <SelectItem value="retired">Đã nghỉ hưu</SelectItem>
                              <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ngày tuyển dụng */}
                  <FormField
                    control={form.control}
                    name="recruitmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày tuyển dụng</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CCCD */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cccdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số CCCD</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số CCCD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cccdIssueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày cấp</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cccdIssuePlace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nơi cấp</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập nơi cấp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dân tộc và Tôn giáo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ethnicity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dân tộc</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Kinh, Tày..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tôn giáo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Không, Phật giáo..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Địa chỉ liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactProvince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh/Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tỉnh/thành phố" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số điện thoại" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="contactWard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phường/Xã</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập phường/xã" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactHamlet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thôn/Xóm</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập thôn/xóm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactDetailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ chi tiết</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập địa chỉ chi tiết" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quê quán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hometownProvince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh/Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tỉnh/thành phố" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="hometownWard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phường/Xã</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập phường/xã" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hometownHamlet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thôn/Xóm</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập thôn/xóm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hometownDetailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ chi tiết</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập địa chỉ chi tiết" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vị trí công việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jobPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chức vụ</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Giáo viên, Hiệu trưởng..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="positionGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhóm chức vụ</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Giáo viên, Cán bộ quản lý..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recruitmentAgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cơ quan tuyển dụng</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập cơ quan tuyển dụng" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professionWhenRecruited"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nghề nghiệp khi tuyển dụng</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập nghề nghiệp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rankLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cấp bậc</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: I, II, III..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trình độ học vấn</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Đại học, Cao đẳng..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="rankCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã ngạch</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã ngạch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subjectGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhóm môn</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Toán, Lý, Hóa..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contractType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại hợp đồng</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Vô thời hạn, Có thời hạn..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tài khoản ngân hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên ngân hàng</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Vietcombank, BIDV..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chi nhánh</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập chi nhánh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tài khoản</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số tài khoản" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trình độ chuyên môn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="generalEducationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trình độ học vấn chung</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Đại học, Cao đẳng..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professionalLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trình độ chuyên môn</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Giáo viên THPT, Kỹ sư..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="major"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chuyên ngành</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Toán học, Vật lý..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trainingPlace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nơi đào tạo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Đại học Sư phạm Hà Nội..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm tốt nghiệp</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2020"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="itLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trình độ tin học</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: A, B, C..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="foreignLanguageLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trình độ ngoại ngữ</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: TOEIC 600, IELTS 6.0..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tham gia tổ chức</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isUnionMember"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={e => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tham gia Công đoàn</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unionJoinDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày tham gia Công đoàn</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isPartyMember"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={e => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tham gia Đảng</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="partyJoinDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày tham gia Đảng</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin lương</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salaryCoefficient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hệ số lương</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="2.34"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bậc lương</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="baseSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lương cơ bản (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày hưởng lương</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unionAllowancePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phụ cấp Công đoàn (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1.0"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seniorityAllowancePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phụ cấp thâm niên (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="5.0"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="incentiveAllowancePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phụ cấp khuyến khích (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="10.0"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="positionAllowancePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phụ cấp chức vụ (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="25.0"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="salaryNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú lương</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập ghi chú về lương" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
