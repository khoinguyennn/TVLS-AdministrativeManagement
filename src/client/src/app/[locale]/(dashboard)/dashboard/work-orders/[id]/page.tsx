"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { WorkOrder } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionNote, setCompletionNote] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadWorkOrder();
    loadPersonnel();
  }, [id]);

  async function loadWorkOrder() {
    try {
      setIsLoading(true);
      // Mock data - replace with API call
      const mockWorkOrders: WorkOrder[] = [
        {
          id: 1,
          code: "CL-2026-001",
          workLocation: "Phòng 101, Tòa nhà A",
          workContent: "Kiểm tra và bảo dưỡng hệ thống điện",
          startTime: "2026-03-10T08:00:00Z",
          endTime: "2026-03-10T12:00:00Z",
          notes: "Cần mang theo dụng cụ kiểm tra điện",
          status: "pending",
          assignedTo: 1,
          assignedBy: 1,
          createdAt: "2026-03-06T10:00:00Z",
          updatedAt: "2026-03-06T10:00:00Z"
        },
        {
          id: 2,
          code: "CL-2026-002",
          workLocation: "Phòng máy chủ",
          workContent: "Cập nhật phần mềm bảo mật",
          startTime: "2026-03-11T14:00:00Z",
          endTime: "2026-03-11T16:00:00Z",
          notes: "Đảm bảo backup dữ liệu trước khi cập nhật",
          status: "approved",
          assignedTo: 2,
          assignedBy: 1,
          createdAt: "2026-03-06T11:00:00Z",
          updatedAt: "2026-03-06T11:30:00Z"
        },
        {
          id: 3,
          code: "CL-2026-003",
          workLocation: "Văn phòng Giám đốc",
          workContent: "Sửa chữa máy in",
          startTime: "2026-03-07T09:00:00Z",
          endTime: "2026-03-07T11:00:00Z",
          status: "completed",
          assignedTo: 3,
          assignedBy: 1,
          createdAt: "2026-03-05T15:00:00Z",
          updatedAt: "2026-03-07T11:00:00Z",
          completedAt: "2026-03-07T11:00:00Z",
          evidencePhotos: ["/api/uploads/evidence/work-order-3-1.jpg"]
        }
      ];

      const found = mockWorkOrders.find(wo => wo.id === parseInt(id));
      if (found) {
        setWorkOrder(found);
      } else {
        toast.error("Không tìm thấy công lệnh");
        router.push("/vi/dashboard/work-orders");
      }
    } catch (error) {
      toast.error("Lỗi tải dữ liệu công lệnh");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPersonnel() {
    // Mock personnel data
    const mockPersonnel: PersonnelRecord[] = [
      {
        id: 1,
        code: "8401555613",
        fullName: "Bùi Hữu Khánh",
        gender: "Nam",
        dateOfBirth: "1987-05-12",
        idNumber: "084087001648",
        email: "bhkhanh@tvu.edu.vn",
        phoneNumber: "0904789498",
        status: "active"
      },
      {
        id: 2,
        code: "8413375048",
        fullName: "Bùi Quốc Tân",
        gender: "Nam",
        dateOfBirth: "1991-12-19",
        idNumber: "084091001190",
        email: "buitan@tvu.edu.vn",
        phoneNumber: "0982454710",
        status: "active"
      },
      {
        id: 3,
        code: "8400631101",
        fullName: "Bùi Thế Ngân",
        gender: "Nam",
        dateOfBirth: "1984-12-08",
        idNumber: "084084001944",
        email: "btngan@tvu.edu.vn",
        phoneNumber: "0904542520",
        status: "active"
      }
    ];
    setPersonnel(mockPersonnel);
  }

  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const, icon: Clock },
      approved: { label: "Đã duyệt", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "Đang thực hiện", variant: "outline" as const, icon: Clock },
      completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Từ chối", variant: "destructive" as const, icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getAssignedPersonnel = () => {
    return personnel.find(p => p.id === workOrder?.assignedTo);
  };

  const getAssignedByPersonnel = () => {
    return personnel.find(p => p.id === workOrder?.assignedBy);
  };

  async function handleComplete() {
    if (!workOrder || !completionNote.trim()) {
      toast.error("Vui lòng nhập ghi chú hoàn thành");
      return;
    }

    try {
      setIsCompleting(true);
      // Mock API call
      setWorkOrder(prev => prev ? {
        ...prev,
        status: "completed",
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : null);

      toast.success("Hoàn thành công lệnh thành công");
    } catch (error) {
      toast.error("Lỗi hoàn thành công lệnh");
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không tìm thấy công lệnh</p>
      </div>
    );
  }

  const assignedPerson = getAssignedPersonnel();
  const assignedByPerson = getAssignedByPersonnel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vi/dashboard/work-orders">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Công lệnh {workOrder.code}
          </h1>
          <p className="text-gray-600 mt-1">
            Chi tiết công việc được giao
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin công việc</span>
                {getStatusBadge(workOrder.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Nơi công tác</p>
                    <p className="text-gray-600">{workOrder.workLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Thời gian</p>
                    <p className="text-gray-600">
                      {formatDateTime(workOrder.startTime)} - {formatDateTime(workOrder.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Người thực hiện</p>
                    <p className="text-gray-600">
                      {assignedPerson ? `${assignedPerson.fullName} (${assignedPerson.code})` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Người giao việc</p>
                    <p className="text-gray-600">
                      {assignedByPerson ? `${assignedByPerson.fullName} (${assignedByPerson.code})` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nội dung công việc</p>
                  <p className="text-gray-600 mt-1">{workOrder.workContent}</p>
                </div>
              </div>

              {workOrder.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Ghi chú</p>
                      <p className="text-gray-600 mt-1">{workOrder.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Completion Section */}
          {workOrder.status === "approved" && (
            <Card>
              <CardHeader>
                <CardTitle>Hoàn thành công việc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú hoàn thành *
                  </label>
                  <Textarea
                    placeholder="Mô tả kết quả thực hiện công việc..."
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh minh chứng (tùy chọn)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Kéo thả ảnh hoặc click để chọn file
                    </p>
                    <input type="file" multiple accept="image/*" className="hidden" />
                  </div>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isCompleting || !completionNote.trim()}
                  className="w-full"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang hoàn thành...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hoàn thành công lệnh
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Evidence Photos */}
          {workOrder.evidencePhotos && workOrder.evidencePhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ảnh minh chứng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workOrder.evidencePhotos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Minh chứng ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái công lệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tạo công lệnh</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(workOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {workOrder.status !== "pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Đã duyệt</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(workOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {workOrder.status === "completed" && workOrder.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hoàn thành</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(workOrder.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          {workOrder.status === "rejected" && workOrder.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Lý do từ chối</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{workOrder.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}