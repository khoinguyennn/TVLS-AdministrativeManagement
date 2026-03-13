"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { IdCard, Info, Loader2, Phone, MapPin, Home } from "lucide-react";
import { ProfileSkeleton } from "@/components/skeletons";

import gradientLight from "@/assets/images/gradient1.jpg";
import gradientDark from "@/assets/images/gradient2.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "react-toastify";
import {
  staffProfileService,
  type StaffProfileData,
} from "@/services/staff-profile.service";
import { env } from "@/env";

// ── Default empty profile state ──
const EMPTY_PROFILE = {
  code: "",
  gender: "",
  dateOfBirth: "",
  cccdNumber: "",
  cccdIssueDate: "",
  cccdIssuePlace: "",
  ethnicity: "",
  religion: "",
  staffStatus: "working",
  recruitmentDate: "",
  phone: "",
  contactProvince: "",
  contactWard: "",
  contactHamlet: "",
  contactDetail: "",
  hometownProvince: "",
  hometownWard: "",
  hometownHamlet: "",
  hometownDetail: "",
  isUnionMember: false,
  unionJoinDate: "",
  isPartyMember: false,
  partyJoinDate: "",
  bankAccounts: [{ bankName: "", branch: "", accountNumber: "" }],
  positions: [{ jobPosition: "", positionGroup: "", recruitmentAgency: "", professionWhenRecruited: "", rankLevel: "", educationLevel: "", rankCode: "", subjectGroup: "", contractType: "" }],
  qualifications: [{ generalEducationLevel: "", professionalLevel: "", major: "", trainingPlace: "", graduationYear: "" as number | string, itLevel: "", foreignLanguageLevel: "" }],
  salaries: [{ salaryCoefficient: "" as number | string, salaryLevel: "" as number | string, baseSalary: "" as number | string, salaryStartDate: "", unionAllowancePercent: "" as number | string, seniorityAllowancePercent: "" as number | string, incentiveAllowancePercent: "" as number | string, positionAllowancePercent: "" as number | string, salaryNote: "" }],
  evaluations: [{ civilServantRating: "", excellentTeacher: false, evaluationYear: "" as number | string, note: "" }]
};

function mapApiToState(data: StaffProfileData) {
  return {
    code: data.staffCode || "",
    gender: data.gender === "male" ? "Nam" : data.gender === "female" ? "Nữ" : data.gender === "other" ? "Khác" : "",
    dateOfBirth: data.dateOfBirth || "",
    cccdNumber: data.cccdNumber || "",
    cccdIssueDate: data.cccdIssueDate || "",
    cccdIssuePlace: data.cccdIssuePlace || "",
    ethnicity: data.ethnicity || "",
    religion: data.religion || "",
    staffStatus: data.staffStatus || "working",
    recruitmentDate: data.recruitmentDate || "",
    phone: data.contactAddress?.phone || "",
    contactProvince: data.contactAddress?.province || "",
    contactWard: data.contactAddress?.ward || "",
    contactHamlet: data.contactAddress?.hamlet || "",
    contactDetail: data.contactAddress?.detailAddress || "",
    hometownProvince: data.hometownAddress?.province || "",
    hometownWard: data.hometownAddress?.ward || "",
    hometownHamlet: data.hometownAddress?.hamlet || "",
    hometownDetail: data.hometownAddress?.detailAddress || "",
    isUnionMember: data.organizations?.isUnionMember || false,
    unionJoinDate: data.organizations?.unionJoinDate || "",
    isPartyMember: data.organizations?.isPartyMember || false,
    partyJoinDate: data.organizations?.partyJoinDate || "",
    bankAccounts: data.bankAccounts?.length ? data.bankAccounts.map(b => ({
      bankName: b.bankName || "", branch: b.branch || "", accountNumber: b.accountNumber || ""
    })) : EMPTY_PROFILE.bankAccounts,
    positions: data.positions?.length ? data.positions.map(p => ({
      jobPosition: p.jobPosition || "", positionGroup: p.positionGroup || "", recruitmentAgency: p.recruitmentAgency || "", professionWhenRecruited: p.professionWhenRecruited || "", rankLevel: p.rankLevel || "", educationLevel: p.educationLevel || "", rankCode: p.rankCode || "", subjectGroup: p.subjectGroup || "", contractType: p.contractType || ""
    })) : EMPTY_PROFILE.positions,
    qualifications: data.qualifications?.length ? data.qualifications.map(q => ({
      generalEducationLevel: q.generalEducationLevel || "", professionalLevel: q.professionalLevel || "", major: q.major || "", trainingPlace: q.trainingPlace || "", graduationYear: q.graduationYear ? String(q.graduationYear) : "", itLevel: q.itLevel || "", foreignLanguageLevel: q.foreignLanguageLevel || ""
    })) : EMPTY_PROFILE.qualifications,
    salaries: data.salaries?.length ? data.salaries.map(s => ({
      salaryCoefficient: s.salaryCoefficient ? String(s.salaryCoefficient) : "", salaryLevel: s.salaryLevel ? String(s.salaryLevel) : "", baseSalary: s.baseSalary ? String(s.baseSalary) : "", salaryStartDate: s.salaryStartDate || "", unionAllowancePercent: s.unionAllowancePercent ? String(s.unionAllowancePercent) : "", seniorityAllowancePercent: s.seniorityAllowancePercent ? String(s.seniorityAllowancePercent) : "", incentiveAllowancePercent: s.incentiveAllowancePercent ? String(s.incentiveAllowancePercent) : "", positionAllowancePercent: s.positionAllowancePercent ? String(s.positionAllowancePercent) : "", salaryNote: s.salaryNote || ""
    })) : EMPTY_PROFILE.salaries,
    evaluations: data.evaluations?.length ? data.evaluations.map(e => ({
      civilServantRating: e.civilServantRating || "", excellentTeacher: e.excellentTeacher || false, evaluationYear: e.evaluationYear ? String(e.evaluationYear) : "", note: e.note || ""
    })) : EMPTY_PROFILE.evaluations,
  };
}

function mapGenderToApi(gender: string): "male" | "female" | "other" | undefined {
  if (gender === "Nam") return "male";
  if (gender === "Nữ") return "female";
  if (gender === "Khác") return "other";
  return undefined;
}

export default function MyProfilePage() {
  const { user, getInitials } = useAuth();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pos = profile.positions[0];
  const updatePos = (updates: Partial<typeof pos>) => setProfile({ ...profile, positions: [{ ...pos, ...updates }] });

  const qual = profile.qualifications[0];
  const updateQual = (updates: Partial<typeof qual>) => setProfile({ ...profile, qualifications: [{ ...qual, ...updates }] });

  const sal = profile.salaries[0];
  const updateSal = (updates: Partial<typeof sal>) => setProfile({ ...profile, salaries: [{ ...sal, ...updates }] });

  const eval_ = profile.evaluations[0];
  const updateEval = (updates: Partial<typeof eval_>) => setProfile({ ...profile, evaluations: [{ ...eval_, ...updates }] });

  const bank = profile.bankAccounts[0];
  const updateBank = (updates: Partial<typeof bank>) => setProfile({ ...profile, bankAccounts: [{ ...bank, ...updates }] });

  // Build full avatar URL from server path
  const getAvatarUrl = useCallback((src: string | null | undefined) => {
    if (!src) return undefined;
    if (src.startsWith("blob:") || src.startsWith("http")) return src;
    return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
  }, []);

  // ── Fetch profile from API ──
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await staffProfileService.getMyProfile();
        if (res.data) {
          setProfile(mapApiToState(res.data));
        }
      } catch {
        // No profile yet — keep defaults
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ── Save profile to API ──
  const handleSave = async () => {
    if (!profile.code.trim()) {
      toast.error("Mã định danh là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      await staffProfileService.updateMyProfile({
        staffCode: profile.code,
        gender: mapGenderToApi(profile.gender),
        dateOfBirth: profile.dateOfBirth || undefined,
        cccdNumber: profile.cccdNumber || undefined,
        cccdIssueDate: profile.cccdIssueDate || undefined,
        cccdIssuePlace: profile.cccdIssuePlace || undefined,
        ethnicity: profile.ethnicity || undefined,
        religion: profile.religion || undefined,
        staffStatus: profile.staffStatus || undefined,
        recruitmentDate: profile.recruitmentDate || undefined,
        contactAddress: {
          province: profile.contactProvince || undefined,
          ward: profile.contactWard || undefined,
          hamlet: profile.contactHamlet || undefined,
          detailAddress: profile.contactDetail || undefined,
          phone: profile.phone || undefined,
        },
        hometownAddress: {
          province: profile.hometownProvince || undefined,
          ward: profile.hometownWard || undefined,
          hamlet: profile.hometownHamlet || undefined,
          detailAddress: profile.hometownDetail || undefined,
        },
        organizations: {
          isUnionMember: profile.isUnionMember,
          unionJoinDate: profile.unionJoinDate || undefined,
          isPartyMember: profile.isPartyMember,
          partyJoinDate: profile.partyJoinDate || undefined,
        },
        bankAccounts: profile.bankAccounts.map(b => ({
          bankName: b.bankName || undefined,
          branch: b.branch || undefined,
          accountNumber: b.accountNumber || undefined,
        })),
        positions: profile.positions.map(p => ({
          jobPosition: p.jobPosition || undefined,
          positionGroup: p.positionGroup || undefined,
          recruitmentAgency: p.recruitmentAgency || undefined,
          professionWhenRecruited: p.professionWhenRecruited || undefined,
          rankLevel: p.rankLevel || undefined,
          educationLevel: p.educationLevel || undefined,
          rankCode: p.rankCode || undefined,
          subjectGroup: p.subjectGroup || undefined,
          contractType: p.contractType || undefined,
        })),
        qualifications: profile.qualifications.map(q => ({
          generalEducationLevel: q.generalEducationLevel || undefined,
          professionalLevel: q.professionalLevel || undefined,
          major: q.major || undefined,
          trainingPlace: q.trainingPlace || undefined,
          graduationYear: q.graduationYear ? Number(q.graduationYear) : undefined,
          itLevel: q.itLevel || undefined,
          foreignLanguageLevel: q.foreignLanguageLevel || undefined,
        })),
        salaries: profile.salaries.map(s => ({
          salaryCoefficient: s.salaryCoefficient ? Number(s.salaryCoefficient) : undefined,
          salaryLevel: s.salaryLevel ? Number(s.salaryLevel) : undefined,
          baseSalary: s.baseSalary ? Number(s.baseSalary) : undefined,
          salaryStartDate: s.salaryStartDate || undefined,
          unionAllowancePercent: s.unionAllowancePercent ? Number(s.unionAllowancePercent) : undefined,
          seniorityAllowancePercent: s.seniorityAllowancePercent ? Number(s.seniorityAllowancePercent) : undefined,
          incentiveAllowancePercent: s.incentiveAllowancePercent ? Number(s.incentiveAllowancePercent) : undefined,
          positionAllowancePercent: s.positionAllowancePercent ? Number(s.positionAllowancePercent) : undefined,
          salaryNote: s.salaryNote || undefined,
        })),
        evaluations: profile.evaluations.map(e => ({
          civilServantRating: e.civilServantRating || undefined,
          excellentTeacher: e.excellentTeacher,
          evaluationYear: e.evaluationYear ? Number(e.evaluationYear) : undefined,
          note: e.note || undefined,
        })),
      });
      toast.success("Đã lưu thay đổi thành công!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    toast.info("Tính năng xuất hồ sơ đang được phát triển.");
  };

  if (!user || loading) {
    return <ProfileSkeleton />;
  }

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
                  src={getAvatarUrl(user?.avatar)}
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
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin mr-2" />}
                Lưu thay đổi
              </Button>
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
                      <Select
                        value={profile.ethnicity}
                        onValueChange={(v) =>
                          setProfile({ ...profile, ethnicity: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dân tộc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kinh">Kinh</SelectItem>
                          <SelectItem value="Hoa">Hoa</SelectItem>
                          <SelectItem value="Khmer">Khmer</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <SelectItem value="working">Đang công tác</SelectItem>
                        <SelectItem value="resigned">Nghỉ việc</SelectItem>
                        <SelectItem value="transferred">Chuyển công tác</SelectItem>
                        <SelectItem value="maternity_leave">
                          Nghỉ hậu sản
                        </SelectItem>
                        <SelectItem value="unpaid_leave">Nghỉ không lương</SelectItem>
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
                      <Input
                        placeholder="Địa chỉ chi tiết"
                        value={profile.hometownDetail}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hometownDetail: e.target.value,
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
                          placeholder="Phường/Xã"
                          value={profile.contactWard}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              contactWard: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Input
                        placeholder="Tổ/Thôn"
                        value={profile.contactHamlet}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            contactHamlet: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Số nhà, Tên đường (địa chỉ chi tiết)"
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
                      <Select 
                        value={profile.isUnionMember ? "yes" : "no"}
                        onValueChange={(val) => setProfile({...profile, isUnionMember: val === "yes"})}
                      >
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
                      <Input 
                        type="date" 
                        value={profile.unionJoinDate}
                        onChange={(e) => setProfile({...profile, unionJoinDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Đảng viên
                      </Label>
                      <Select 
                        value={profile.isPartyMember ? "yes" : "no"}
                        onValueChange={(val) => setProfile({...profile, isPartyMember: val === "yes"})}
                      >
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
                      <Input 
                        type="date" 
                        value={profile.partyJoinDate}
                        onChange={(e) => setProfile({...profile, partyJoinDate: e.target.value})}
                      />
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
                      <Input placeholder="Ví dụ: Giáo viên" value={pos.jobPosition} onChange={(e) => updatePos({ jobPosition: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nhóm chức vụ
                      </Label>
                      <Input placeholder="Ví dụ: Giáo viên" value={pos.positionGroup} onChange={(e) => updatePos({ positionGroup: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Cơ quan tuyển dụng
                      </Label>
                      <Input value={pos.recruitmentAgency} onChange={(e) => updatePos({ recruitmentAgency: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nghề nghiệp khi tuyển dụng
                      </Label>
                      <Input value={pos.professionWhenRecruited} onChange={(e) => updatePos({ professionWhenRecruited: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Cấp bậc
                      </Label>
                      <Input value={pos.rankLevel} onChange={(e) => updatePos({ rankLevel: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Mã ngạch
                      </Label>
                      <Input value={pos.rankCode} onChange={(e) => updatePos({ rankCode: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Loại hợp đồng
                      </Label>
                      <Input value={pos.contractType} onChange={(e) => updatePos({ contractType: e.target.value })} />
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
                      <Input type="number" step="0.01" value={sal.salaryCoefficient} onChange={(e) => updateSal({ salaryCoefficient: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Bậc lương
                      </Label>
                      <Input type="number" value={sal.salaryLevel} onChange={(e) => updateSal({ salaryLevel: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Lương cơ bản
                      </Label>
                      <Input type="number" value={sal.baseSalary} onChange={(e) => updateSal({ baseSalary: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Ngày hưởng lương
                    </Label>
                    <Input type="date" value={sal.salaryStartDate} onChange={(e) => updateSal({ salaryStartDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Ghi chú lương
                    </Label>
                    <Input placeholder="Nhập ghi chú về lương" value={sal.salaryNote} onChange={(e) => updateSal({ salaryNote: e.target.value })} />
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
                      <Input type="number" step="0.1" value={sal.unionAllowancePercent} onChange={(e) => updateSal({ unionAllowancePercent: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Thâm niên (%)
                      </Label>
                      <Input type="number" step="0.1" value={sal.seniorityAllowancePercent} onChange={(e) => updateSal({ seniorityAllowancePercent: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Ưu đãi (%)
                      </Label>
                      <Input type="number" step="0.1" value={sal.incentiveAllowancePercent} onChange={(e) => updateSal({ incentiveAllowancePercent: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        PC Chức vụ (%)
                      </Label>
                      <Input type="number" step="0.1" value={sal.positionAllowancePercent} onChange={(e) => updateSal({ positionAllowancePercent: e.target.value })} />
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
                      <Input placeholder="12/12" value={qual.generalEducationLevel} onChange={(e) => updateQual({ generalEducationLevel: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Trình độ chuyên môn
                      </Label>
                      <Select value={qual.professionalLevel} onValueChange={(v) => updateQual({ professionalLevel: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn trình độ chuyên môn --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trung cấp">Trung cấp</SelectItem>
                          <SelectItem value="Cao đẳng">Cao đẳng</SelectItem>
                          <SelectItem value="Đại học">Đại học</SelectItem>
                          <SelectItem value="Kỹ sư">Kỹ sư</SelectItem>
                          <SelectItem value="Cử nhân">Cử nhân</SelectItem>
                          <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                          <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Chuyên ngành
                      </Label>
                      <Input value={qual.major} onChange={(e) => updateQual({ major: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nơi đào tạo
                      </Label>
                      <Input value={qual.trainingPlace} onChange={(e) => updateQual({ trainingPlace: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Năm tốt nghiệp
                    </Label>
                    <Input type="number" placeholder="2015" value={qual.graduationYear} onChange={(e) => updateQual({ graduationYear: e.target.value })} />
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
                    <Select value={qual.itLevel} onValueChange={(v) => updateQual({ itLevel: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn trình độ tin học --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tin học A (cũ)">Tin học A (cũ)</SelectItem>
                        <SelectItem value="Tin học B (cũ)">Tin học B (cũ)</SelectItem>
                        <SelectItem value="Tin học C (cũ)">Tin học C (cũ)</SelectItem>
                        <SelectItem value="Ứng dụng CNTT cơ bản">Ứng dụng CNTT cơ bản</SelectItem>
                        <SelectItem value="Ứng dụng CNTT nâng cao">Ứng dụng CNTT nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Trình độ Ngoại ngữ
                    </Label>
                    <Select value={qual.foreignLanguageLevel} onValueChange={(v) => updateQual({ foreignLanguageLevel: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn trình độ ngoại ngữ --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Khung năng lực ngoại ngữ 6 bậc (Việt Nam)</SelectLabel>
                          <SelectItem value="Bậc 1 (A1)">Bậc 1 (A1)</SelectItem>
                          <SelectItem value="Bậc 2 (A2)">Bậc 2 (A2)</SelectItem>
                          <SelectItem value="Bậc 3 (B1)">Bậc 3 (B1)</SelectItem>
                          <SelectItem value="Bậc 4 (B2)">Bậc 4 (B2)</SelectItem>
                          <SelectItem value="Bậc 5 (C1)">Bậc 5 (C1)</SelectItem>
                          <SelectItem value="Bậc 6 (C2)">Bậc 6 (C2)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Chứng chỉ tiếng Anh quốc tế</SelectLabel>
                          <SelectItem value="TOEIC">TOEIC</SelectItem>
                          <SelectItem value="IELTS">IELTS</SelectItem>
                          <SelectItem value="TOEFL iBT">TOEFL iBT</SelectItem>
                          <SelectItem value="Cambridge (KET, PET, FCE, CAE, CPE)">Cambridge (KET, PET, FCE, CAE, CPE)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Chứng chỉ các ngoại ngữ khác</SelectLabel>
                          <SelectItem value="Tiếng Nhật (JLPT N1-N5)">Tiếng Nhật (JLPT N1-N5)</SelectItem>
                          <SelectItem value="Tiếng Hàn (TOPIK I-VI)">Tiếng Hàn (TOPIK I-VI)</SelectItem>
                          <SelectItem value="Tiếng Trung (HSK 1-6)">Tiếng Trung (HSK 1-6)</SelectItem>
                          <SelectItem value="Tiếng Pháp (DELF/DALF)">Tiếng Pháp (DELF/DALF)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                      Đánh giá viên chức
                    </Label>
                    <Select value={eval_.civilServantRating} onValueChange={(v) => updateEval({ civilServantRating: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn đánh giá --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hoàn thành xuất sắc nhiệm vụ">Hoàn thành xuất sắc nhiệm vụ</SelectItem>
                        <SelectItem value="Hoàn thành tốt nhiệm vụ">Hoàn thành tốt nhiệm vụ</SelectItem>
                        <SelectItem value="Hoàn thành nhiệm vụ">Hoàn thành nhiệm vụ</SelectItem>
                        <SelectItem value="Không hoàn thành">Không hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Giáo viên giỏi
                    </Label>
                    <Select value={eval_.excellentTeacher ? "yes" : "no"} onValueChange={(v) => updateEval({ excellentTeacher: v === "yes" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Có</SelectItem>
                        <SelectItem value="no">Không</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5 mt-4">
                  <Label className="text-[13px] font-semibold text-muted-foreground">
                    Năm đánh giá
                  </Label>
                  <Input type="number" placeholder="2024" value={eval_.evaluationYear} onChange={(e) => updateEval({ evaluationYear: e.target.value })} />
                </div>
                <div className="space-y-1.5 mt-4">
                  <Label className="text-[13px] font-semibold text-muted-foreground">
                    Ghi chú
                  </Label>
                  <Input placeholder="Nhập ghi chú đánh giá" value={eval_.note} onChange={(e) => updateEval({ note: e.target.value })} />
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
                    <Input placeholder="Ví dụ: Vietcombank" value={bank.bankName} onChange={(e) => updateBank({ bankName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Chi nhánh
                    </Label>
                    <Input placeholder="Ví dụ: Chi nhánh Hà Nội" value={bank.branch} onChange={(e) => updateBank({ branch: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-muted-foreground">
                    Số tài khoản
                  </Label>
                  <Input placeholder="Nhập số tài khoản..." value={bank.accountNumber} onChange={(e) => updateBank({ accountNumber: e.target.value })} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
