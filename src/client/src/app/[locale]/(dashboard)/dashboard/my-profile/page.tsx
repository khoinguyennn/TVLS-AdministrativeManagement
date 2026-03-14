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
  id: 0,
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
  // Singular objects
  position: { jobPosition: "", positionGroup: "", recruitmentAgency: "", professionWhenRecruited: "", rankLevel: "", educationLevel: "", rankCode: "", subjectGroup: "", contractType: "" },
  qualification: { generalEducationLevel: "", professionalLevel: "", major: "", trainingPlace: "", graduationYear: "" as number | string, itLevel: "", foreignLanguageLevel: "" },
  salary: { salaryCoefficient: "" as number | string, salaryLevel: "" as number | string, baseSalary: "" as number | string, salaryStartDate: "", unionAllowancePercent: "" as number | string, seniorityAllowancePercent: "" as number | string, incentiveAllowancePercent: "" as number | string, positionAllowancePercent: "" as number | string, salaryNote: "" },
  evaluation: { civilServantRating: "", excellentTeacher: false, evaluationYear: "" as number | string, note: "" },
  bankAccount: { bankName: "", branch: "", accountNumber: "" },
};

function mapApiToState(data: StaffProfileData) {
  const addresses = data.addresses || [];
  const contactAddr = addresses.find(a => a.addressType === "contact");
  const hometownAddr = addresses.find(a => a.addressType === "hometown");
  const p = data.position;
  const q = data.qualification;
  const s = data.salary;
  const e = data.evaluation;
  const b = data.bankAccount;
  const o = data.organization;

  return {
    id: data.id || 0,
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
    phone: contactAddr?.phone || "",
    contactProvince: contactAddr?.province || "",
    contactWard: contactAddr?.ward || "",
    contactHamlet: contactAddr?.hamlet || "",
    contactDetail: contactAddr?.detailAddress || "",
    hometownProvince: hometownAddr?.province || "",
    hometownWard: hometownAddr?.ward || "",
    hometownHamlet: hometownAddr?.hamlet || "",
    hometownDetail: hometownAddr?.detailAddress || "",
    isUnionMember: o?.isUnionMember || false,
    unionJoinDate: o?.unionJoinDate || "",
    isPartyMember: o?.isPartyMember || false,
    partyJoinDate: o?.partyJoinDate || "",
    position: {
      jobPosition: p?.jobPosition || "", positionGroup: p?.positionGroup || "", recruitmentAgency: p?.recruitmentAgency || "", professionWhenRecruited: p?.professionWhenRecruited || "", rankLevel: p?.rankLevel || "", educationLevel: p?.educationLevel || "", rankCode: p?.rankCode || "", subjectGroup: p?.subjectGroup || "", contractType: p?.contractType || "",
    },
    qualification: {
      generalEducationLevel: q?.generalEducationLevel || "", professionalLevel: q?.professionalLevel || "", major: q?.major || "", trainingPlace: q?.trainingPlace || "", graduationYear: q?.graduationYear ? String(q.graduationYear) : "", itLevel: q?.itLevel || "", foreignLanguageLevel: q?.foreignLanguageLevel || "",
    },
    salary: {
      salaryCoefficient: s?.salaryCoefficient ? String(s.salaryCoefficient) : "", salaryLevel: s?.salaryLevel ? String(s.salaryLevel) : "", baseSalary: s?.baseSalary ? String(s.baseSalary) : "", salaryStartDate: s?.salaryStartDate || "", unionAllowancePercent: s?.unionAllowancePercent ? String(s.unionAllowancePercent) : "", seniorityAllowancePercent: s?.seniorityAllowancePercent ? String(s.seniorityAllowancePercent) : "", incentiveAllowancePercent: s?.incentiveAllowancePercent ? String(s.incentiveAllowancePercent) : "", positionAllowancePercent: s?.positionAllowancePercent ? String(s.positionAllowancePercent) : "", salaryNote: s?.salaryNote || "",
    },
    evaluation: {
      civilServantRating: e?.civilServantRating || "", excellentTeacher: e?.excellentTeacher || false, evaluationYear: e?.evaluationYear ? String(e.evaluationYear) : "", note: e?.note || "",
    },
    bankAccount: {
      bankName: b?.bankName || "", branch: b?.branch || "", accountNumber: b?.accountNumber || "",
    },
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

  const pos = profile.position;
  const updatePos = (updates: Partial<typeof pos>) => setProfile({ ...profile, position: { ...pos, ...updates } });

  const qual = profile.qualification;
  const updateQual = (updates: Partial<typeof qual>) => setProfile({ ...profile, qualification: { ...qual, ...updates } });

  const sal = profile.salary;
  const updateSal = (updates: Partial<typeof sal>) => setProfile({ ...profile, salary: { ...sal, ...updates } });

  const eval_ = profile.evaluation;
  const updateEval = (updates: Partial<typeof eval_>) => setProfile({ ...profile, evaluation: { ...eval_, ...updates } });

  const bank = profile.bankAccount;
  const updateBank = (updates: Partial<typeof bank>) => setProfile({ ...profile, bankAccount: { ...bank, ...updates } });

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
        if (!user?.id) return;
        const res = await staffProfileService.getMyProfile(user.id);
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
  }, [user?.id]);

  // ── Save profile to API ──
  const handleSave = async () => {
    if (!profile.code.trim()) {
      toast.error("Mã định danh là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      await staffProfileService.updateMyProfile(profile.id, {
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
        addresses: [
          {
            addressType: "contact",
            province: profile.contactProvince || undefined,
            ward: profile.contactWard || undefined,
            hamlet: profile.contactHamlet || undefined,
            detailAddress: profile.contactDetail || undefined,
            phone: profile.phone || undefined,
          },
          {
            addressType: "hometown",
            province: profile.hometownProvince || undefined,
            ward: profile.hometownWard || undefined,
            hamlet: profile.hometownHamlet || undefined,
            detailAddress: profile.hometownDetail || undefined,
          },
        ],
        organization: {
          isUnionMember: profile.isUnionMember,
          unionJoinDate: profile.unionJoinDate || undefined,
          isPartyMember: profile.isPartyMember,
          partyJoinDate: profile.partyJoinDate || undefined,
        },
        position: {
          jobPosition: pos.jobPosition || undefined,
          positionGroup: pos.positionGroup || undefined,
          recruitmentAgency: pos.recruitmentAgency || undefined,
          professionWhenRecruited: pos.professionWhenRecruited || undefined,
          rankLevel: pos.rankLevel || undefined,
          educationLevel: pos.educationLevel || undefined,
          rankCode: pos.rankCode || undefined,
          subjectGroup: pos.subjectGroup || undefined,
          contractType: pos.contractType || undefined,
        },
        qualification: {
          generalEducationLevel: qual.generalEducationLevel || undefined,
          professionalLevel: qual.professionalLevel || undefined,
          major: qual.major || undefined,
          trainingPlace: qual.trainingPlace || undefined,
          graduationYear: qual.graduationYear ? Number(qual.graduationYear) : undefined,
          itLevel: qual.itLevel || undefined,
          foreignLanguageLevel: qual.foreignLanguageLevel || undefined,
        },
        salary: {
          salaryCoefficient: sal.salaryCoefficient ? Number(sal.salaryCoefficient) : undefined,
          salaryLevel: sal.salaryLevel ? Number(sal.salaryLevel) : undefined,
          baseSalary: sal.baseSalary ? Number(sal.baseSalary) : undefined,
          salaryStartDate: sal.salaryStartDate || undefined,
          unionAllowancePercent: sal.unionAllowancePercent ? Number(sal.unionAllowancePercent) : undefined,
          seniorityAllowancePercent: sal.seniorityAllowancePercent ? Number(sal.seniorityAllowancePercent) : undefined,
          incentiveAllowancePercent: sal.incentiveAllowancePercent ? Number(sal.incentiveAllowancePercent) : undefined,
          positionAllowancePercent: sal.positionAllowancePercent ? Number(sal.positionAllowancePercent) : undefined,
          salaryNote: sal.salaryNote || undefined,
        },
        bankAccount: {
          bankName: bank.bankName || undefined,
          branch: bank.branch || undefined,
          accountNumber: bank.accountNumber || undefined,
        },
        evaluation: {
          civilServantRating: eval_.civilServantRating || undefined,
          excellentTeacher: eval_.excellentTeacher,
          evaluationYear: eval_.evaluationYear ? Number(eval_.evaluationYear) : undefined,
          note: eval_.note || undefined,
        },
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
                      <Select value={pos.jobPosition} onValueChange={(v) => updatePos({ jobPosition: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn vị trí --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                          <SelectItem value="Giáo viên HĐ">Giáo viên HĐ</SelectItem>
                          <SelectItem value="Nhân viên">Nhân viên</SelectItem>
                          <SelectItem value="Cán bộ quản lý (CBQL)">Cán bộ quản lý (CBQL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Nhóm chức vụ
                      </Label>
                      <Select value={pos.positionGroup} onValueChange={(v) => updatePos({ positionGroup: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn nhóm chức vụ --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hiệu trưởng">Hiệu trưởng</SelectItem>
                          <SelectItem value="Phó hiệu trưởng">Phó hiệu trưởng</SelectItem>
                          <SelectItem value="Tổ trưởng">Tổ trưởng</SelectItem>
                          <SelectItem value="Phó tổ trưởng">Phó tổ trưởng</SelectItem>
                          <SelectItem value="Bí thư đoàn">Bí thư đoàn</SelectItem>
                          <SelectItem value="Phó bí thư đoàn">Phó bí thư đoàn</SelectItem>
                          <SelectItem value="Chủ tịch Hội Liên hiệp Thanh niên">Chủ tịch Hội Liên hiệp Thanh niên</SelectItem>
                          <SelectItem value="Phó Chủ tịch Hội Liên hiệp Thanh niên">Phó Chủ tịch Hội Liên hiệp Thanh niên</SelectItem>
                          <SelectItem value="Tổng phụ trách">Tổng phụ trách</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Loại hợp đồng
                      </Label>
                      <Select value={pos.contractType} onValueChange={(v) => updatePos({ contractType: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn hình thức hợp đồng --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hợp đồng xác định thời hạn">Hợp đồng xác định thời hạn</SelectItem>
                          <SelectItem value="Hợp đồng không xác định thời hạn">Hợp đồng không xác định thời hạn</SelectItem>
                          <SelectItem value="Hợp đồng theo Nghị định 111">Hợp đồng theo Nghị định 111</SelectItem>
                          <SelectItem value="Hợp đồng khoán">Hợp đồng khoán</SelectItem>
                          <SelectItem value="Hợp đồng lương vùng theo Nghị định 74/2024/NĐ-CP">Hợp đồng lương vùng theo Nghị định 74/2024/NĐ-CP</SelectItem>
                          <SelectItem value="Hợp đồng thỉnh giảng">Hợp đồng thỉnh giảng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Ngạch hạng
                      </Label>
                      <Input value={pos.rankCode} onChange={(e) => updatePos({ rankCode: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Tổ bộ môn
                      </Label>
                      <Select value={pos.subjectGroup} onValueChange={(v) => updatePos({ subjectGroup: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn tổ bộ môn --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tổ Văn phòng">Tổ Văn phòng</SelectItem>
                          <SelectItem value="Tổ Chồi - Lá">Tổ Chồi - Lá</SelectItem>
                          <SelectItem value="Tổ Khối Một">Tổ Khối Một</SelectItem>
                          <SelectItem value="Tổ Khối Hai">Tổ Khối Hai</SelectItem>
                          <SelectItem value="Tổ Khối Ba">Tổ Khối Ba</SelectItem>
                          <SelectItem value="Tổ Khối Bốn">Tổ Khối Bốn</SelectItem>
                          <SelectItem value="Tổ Khối Năm">Tổ Khối Năm</SelectItem>
                          <SelectItem value="Tổ Khoa Học Tự Nhiên">Tổ Khoa Học Tự Nhiên</SelectItem>
                          <SelectItem value="Tổ Lý - Hoá - Sinh - Công nghệ">Tổ Lý - Hoá - Sinh - Công nghệ</SelectItem>
                          <SelectItem value="Tổ Toán - Tin THCS">Tổ Toán - Tin THCS</SelectItem>
                          <SelectItem value="Tổ Toán - Tin THPT">Tổ Toán - Tin THPT</SelectItem>
                          <SelectItem value="Tổ Ngoại Ngữ - Ngữ Văn THCS">Tổ Ngoại Ngữ - Ngữ Văn THCS</SelectItem>
                          <SelectItem value="Tổ Ngoại Ngữ - Ngữ Văn THPT">Tổ Ngoại Ngữ - Ngữ Văn THPT</SelectItem>
                          <SelectItem value="Tổ Nghệ Thuật - Sử - Địa - GDCD - GDTC">Tổ Nghệ Thuật - Sử - Địa - GDCD - GDTC</SelectItem>
                          <SelectItem value="Tổ Sử - Địa - GDKTPL - GDQP - GDTC">Tổ Sử - Địa - GDKTPL - GDQP - GDTC</SelectItem>
                          <SelectItem value="Tổ Cấp Dưỡng">Tổ Cấp Dưỡng</SelectItem>
                          <SelectItem value="Ban Giám Hiệu">Ban Giám Hiệu</SelectItem>
                          <SelectItem value="Tổ Nhóm - Mầm">Tổ Nhóm - Mầm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-muted-foreground">
                        Cấp học
                      </Label>
                      <Select value={pos.educationLevel} onValueChange={(v) => updatePos({ educationLevel: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn cấp học --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mầm non">Mầm non</SelectItem>
                          <SelectItem value="Tiểu học">Tiểu học</SelectItem>
                          <SelectItem value="THCS">THCS</SelectItem>
                          <SelectItem value="THPT">THPT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-muted-foreground">
                      Cấp bậc
                    </Label>
                    <Input value={pos.rankLevel} onChange={(e) => updatePos({ rankLevel: e.target.value })} />
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
