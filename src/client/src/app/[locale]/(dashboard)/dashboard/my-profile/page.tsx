"use client";

import { useState } from "react";
import Image from "next/image";
import { IdCard, Info, Phone, MapPin, Home } from "lucide-react";

import gradientLight from "@/assets/images/gradient1.jpg";
import gradientDark from "@/assets/images/gradient2.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "react-toastify";

export default function MyProfilePage() {
  const { user, getInitials } = useAuth();

  // Mock profile data — replace with API call later
  const [profile, setProfile] = useState({
    code: "NS12345",
    gender: "Nam",
    dateOfBirth: "1990-01-01",
    cccdNumber: "001234567890",
    cccdIssueDate: "2020-05-15",
    cccdIssuePlace: "Cục CS QLHC về TTXH",
    ethnicity: "Kinh",
    religion: "Không",
    staffStatus: "working",
    recruitmentDate: "2018-09-01",
    phone: "0987654321",
    contactProvince: "Thành phố Hà Nội",
    contactDistrict: "Quận Cầu Giấy",
    contactWard: "Dịch Vọng",
    contactDetail: "Số 12, Ngõ 45, Đường Xuân Thủy",
    hometownProvince: "Hà Nội",
    hometownDistrict: "Ba Đình",
    hometownWard: "Quán Thánh",
    hometownHamlet: "Số 10",
  });

  const handleSave = () => {
    toast.success("Đã lưu thay đổi thành công!");
  };

  const handleExport = () => {
    toast.info("Tính năng xuất hồ sơ đang được phát triển.");
  };

  return (
    <div className="space-y-6">
      {/* ── Profile Header Card ── */}
      <div className="bg-card rounded-xl border shadow-sm">
        {/* Banner Images */}
        <div className="h-32 relative z-0 rounded-t-xl overflow-hidden">
          <Image
            src={gradientLight}
            alt="Profile Banner Light"
            fill
            className="object-cover dark:hidden"
            priority
          />
          <Image
            src={gradientDark}
            alt="Profile Banner Dark"
            fill
            className="object-cover hidden dark:block"
            priority
          />
        </div>
        <div className="px-8 pb-8">
          {/* Avatar + Name + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-6">
            {/* Avatar */}
            <div className="relative z-10">
              <Avatar className="size-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={
                    user?.avatar
                      ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`
                      : undefined
                  }
                  alt={user?.fullName}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name + Code */}
            <div className="flex-1 pb-2">
              <h3 className="text-2xl font-black">{user?.fullName || "Người dùng"}</h3>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <IdCard className="size-4" />
                Mã định danh: {profile.code}
              </p>
            </div>

            {/* Actions */}
            <div className="pb-2 flex gap-3">
              <Button variant="outline" onClick={handleExport}>
                Xuất hồ sơ
              </Button>
              <Button onClick={handleSave}>Lưu thay đổi</Button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="personal" className="w-full">
            <div className="border-b overflow-x-auto">
              <TabsList className="inline-flex h-auto w-auto bg-transparent p-0 gap-0">
                {[
                  { value: "personal", label: "Thông tin cá nhân" },
                  { value: "organization", label: "Tổ chức" },
                  { value: "work", label: "Công tác" },
                  { value: "salary", label: "Phụ cấp lương" },
                  { value: "qualification", label: "Trình độ" },
                  { value: "evaluation", label: "Đánh giá" },
                  { value: "bank", label: "Ngân hàng" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative px-4 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-sm font-bold text-muted-foreground bg-transparent hover:text-foreground whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ═══════════ Tab 1: Thông tin cá nhân ═══════════ */}
            <TabsContent value="personal" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* ── Column 1: Thông tin cơ bản ── */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Thông tin cơ bản
                  </h4>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Mã định danh
                    </Label>
                    <Input
                      value={profile.code}
                      onChange={(e) =>
                        setProfile({ ...profile, code: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Giới tính
                      </Label>
                      <Select
                        value={profile.gender}
                        onValueChange={(v) =>
                          setProfile({ ...profile, gender: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Nữ">Nữ</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Ngày sinh
                      </Label>
                      <Input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) =>
                          setProfile({ ...profile, dateOfBirth: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Số CMT/CCCD
                    </Label>
                    <Input
                      value={profile.cccdNumber}
                      onChange={(e) =>
                        setProfile({ ...profile, cccdNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Ngày cấp
                      </Label>
                      <Input
                        type="date"
                        value={profile.cccdIssueDate}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            cccdIssueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nơi cấp
                      </Label>
                      <Input
                        value={profile.cccdIssuePlace}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            cccdIssuePlace: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ── Column 2: Đặc điểm & Trạng thái ── */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Đặc điểm & Trạng thái
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Dân tộc
                      </Label>
                      <Input
                        value={profile.ethnicity}
                        onChange={(e) =>
                          setProfile({ ...profile, ethnicity: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Tôn giáo
                      </Label>
                      <Input
                        value={profile.religion}
                        onChange={(e) =>
                          setProfile({ ...profile, religion: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Trạng thái CB
                    </Label>
                    <Select
                      value={profile.staffStatus}
                      onValueChange={(v) =>
                        setProfile({ ...profile, staffStatus: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Đang làm việc</SelectItem>
                        <SelectItem value="probation">Thử việc</SelectItem>
                        <SelectItem value="maternity_leave">
                          Nghỉ thai sản
                        </SelectItem>
                        <SelectItem value="retired">Đã nghỉ hưu</SelectItem>
                        <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Ngày tuyển dụng
                    </Label>
                    <Input
                      type="date"
                      value={profile.recruitmentDate}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          recruitmentDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Quê quán */}
                  <div className="space-y-4">
                    <Label className="text-[13px] font-bold flex items-center gap-2">
                      <Home className="size-4" />
                      Quê quán
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Tỉnh/Thành phố"
                        value={profile.hometownProvince}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hometownProvince: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Quận/Huyện"
                        value={profile.hometownDistrict}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hometownDistrict: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Xã/Phường"
                        value={profile.hometownWard}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hometownWard: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Tổ/Thôn"
                        value={profile.hometownHamlet}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hometownHamlet: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ── Column 3: Liên hệ & Địa chỉ ── */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Liên hệ & Địa chỉ
                  </h4>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Địa chỉ thường trú */}
                  <div className="space-y-4">
                    <Label className="text-[13px] font-bold flex items-center gap-2">
                      <MapPin className="size-4" />
                      Địa chỉ thường trú
                    </Label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Tỉnh/Thành phố"
                          value={profile.contactProvince}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              contactProvince: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Quận/Huyện"
                          value={profile.contactDistrict}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              contactDistrict: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Input
                        placeholder="Phường/Xã"
                        value={profile.contactWard}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            contactWard: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Số nhà, Tên đường, Tổ/Thôn"
                        value={profile.contactDetail}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            contactDetail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-3">
                    <Info className="size-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 font-medium leading-relaxed">
                      Vui lòng kiểm tra kỹ các thông tin định danh (CCCD, Ngày
                      sinh) trước khi lưu. Các thay đổi quan trọng sẽ cần được
                      phê duyệt bởi quản trị viên.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 2: Tổ chức ═══════════ */}
            <TabsContent value="organization" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Đoàn thể
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Đoàn viên
                      </Label>
                      <Select defaultValue="yes">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Có</SelectItem>
                          <SelectItem value="no">Không</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Ngày vào Đoàn
                      </Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Đảng viên
                      </Label>
                      <Select defaultValue="no">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Có</SelectItem>
                          <SelectItem value="no">Không</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Ngày vào Đảng
                      </Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 3: Công tác ═══════════ */}
            <TabsContent value="work" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Vị trí công tác
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Chức vụ
                      </Label>
                      <Input placeholder="Ví dụ: Giáo viên" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nhóm chức vụ
                      </Label>
                      <Input placeholder="Ví dụ: Giáo viên" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Cơ quan tuyển dụng
                      </Label>
                      <Input />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nghề nghiệp khi tuyển dụng
                      </Label>
                      <Input />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Cấp bậc
                      </Label>
                      <Input />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Mã ngạch
                      </Label>
                      <Input />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Loại hợp đồng
                      </Label>
                      <Input />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 4: Phụ cấp lương ═══════════ */}
            <TabsContent value="salary" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Thông tin lương
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Hệ số lương
                      </Label>
                      <Input type="number" step="0.01" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Bậc lương
                      </Label>
                      <Input type="number" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Lương cơ bản
                      </Label>
                      <Input type="number" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Ngày hưởng lương
                    </Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Phụ cấp
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Công đoàn (%)
                      </Label>
                      <Input type="number" step="0.1" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Thâm niên (%)
                      </Label>
                      <Input type="number" step="0.1" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Ưu đãi (%)
                      </Label>
                      <Input type="number" step="0.1" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Chức vụ (%)
                      </Label>
                      <Input type="number" step="0.1" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 5: Trình độ ═══════════ */}
            <TabsContent value="qualification" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Trình độ đào tạo
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Trình độ GDPT
                      </Label>
                      <Input placeholder="12/12" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Trình độ chuyên môn
                      </Label>
                      <Input placeholder="Thạc sĩ, Tiến sĩ..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Chuyên ngành
                      </Label>
                      <Input />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nơi đào tạo
                      </Label>
                      <Input />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Năm tốt nghiệp
                    </Label>
                    <Input type="number" placeholder="2015" />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                    Ngoại ngữ & Tin học
                  </h4>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Trình độ Tin học
                    </Label>
                    <Input placeholder="Ví dụ: IC3, MOS..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Trình độ Ngoại ngữ
                    </Label>
                    <Input placeholder="Ví dụ: IELTS 6.5, B2..." />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 6: Đánh giá ═══════════ */}
            <TabsContent value="evaluation" className="mt-8">
              <div className="space-y-6 max-w-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                  Đánh giá viên chức
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Xếp loại viên chức
                    </Label>
                    <Input placeholder="Hoàn thành tốt nhiệm vụ" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Năm đánh giá
                    </Label>
                    <Input type="number" placeholder="2024" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Giáo viên giỏi
                    </Label>
                    <Select defaultValue="no">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Có</SelectItem>
                        <SelectItem value="no">Không</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Ghi chú
                    </Label>
                    <Input placeholder="Nhập ghi chú..." />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ Tab 7: Ngân hàng ═══════════ */}
            <TabsContent value="bank" className="mt-8">
              <div className="space-y-6 max-w-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-l-4 border-primary pl-3">
                  Tài khoản ngân hàng
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Tên ngân hàng
                    </Label>
                    <Input placeholder="Ví dụ: Vietcombank" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Chi nhánh
                    </Label>
                    <Input placeholder="Ví dụ: Chi nhánh Hà Nội" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-muted-foreground">
                    Số tài khoản
                  </Label>
                  <Input placeholder="Nhập số tài khoản..." />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
