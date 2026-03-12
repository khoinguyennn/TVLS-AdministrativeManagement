"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Filter, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrderTable, WorkOrderDialog } from "@/components/work-orders";
import { personnelService } from "@/services/personnel.service";
import type { WorkOrder, CreateWorkOrderPayload, UpdateWorkOrderPayload } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

export default function WorkOrdersPage() {
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  // Filter work orders based on search query and status
  useEffect(() => {
    let filtered = workOrders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.code.toLowerCase().includes(query) ||
          (wo.location?.toLowerCase().includes(query) || false) ||
          wo.content.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((wo) => wo.status === statusFilter);
    }

    setFilteredWorkOrders(filtered);
  }, [searchQuery, statusFilter, workOrders]);

  async function loadData() {
    try {
      setIsLoading(true);

      // Load personnel data
      const personnelData: PersonnelRecord[] = [
        {
          id: 1,
          code: "8401555613",
          fullName: "Bùi Hữu Khánh",
          gender: "Nam",
          dateOfBirth: "1987-05-12",
          cccdNumber: "084087001648",
          email: "bhkhanh@tvu.edu.vn",
          contactAddress: { phone: "0904789498" },
          status: "active",
          userId: 101,
          role: "technician",
          staffStatus: "working",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z"
        },
        {
          id: 2,
          code: "8413375048",
          fullName: "Bùi Quốc Tân",
          gender: "Nam",
          dateOfBirth: "1991-12-19",
          cccdNumber: "084091001190",
          email: "buitan@tvu.edu.vn",
          contactAddress: { phone: "0982454710" },
          status: "active",
          userId: 102,
          role: "technician",
          staffStatus: "working",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z"
        },
        {
          id: 3,
          code: "8400631101",
          fullName: "Bùi Thế Ngân",
          gender: "Nam",
          dateOfBirth: "1984-12-08",
          cccdNumber: "084084001944",
          email: "btngan@tvu.edu.vn",
          contactAddress: { phone: "0904542520" },
          status: "active",
          userId: 103,
          role: "technician",
          staffStatus: "working",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z"
        }
      ];
      setPersonnel(personnelData);

      // Mock work orders data
      const mockWorkOrders: WorkOrder[] = [
        {
          id: 1,
          code: "CL-2026-001",
          title: "Bảo trì định kỳ",
          location: "Phòng 101, Tòa nhà A",
          content: "Kiểm tra và bảo dưỡng hệ thống điện",
          startDate: "2026-03-10T08:00:00Z",
          endDate: "2026-03-10T12:00:00Z",
          note: "Cần mang theo dụng cụ kiểm tra điện",
          status: "pending",
          assignedTo: 1,
          createdBy: 1,
          createdAt: "2026-03-06T10:00:00Z",
          updatedAt: "2026-03-06T10:00:00Z"
        },
        {
          id: 2,
          code: "CL-2026-002",
          title: "Cập nhật hệ thống",
          location: "Phòng máy chủ",
          content: "Cập nhật phần mềm bảo mật",
          startDate: "2026-03-11T14:00:00Z",
          endDate: "2026-03-11T16:00:00Z",
          note: "Đảm bảo backup dữ liệu trước khi cập nhật",
          status: "approved",
          assignedTo: 2,
          createdBy: 1,
          createdAt: "2026-03-06T11:00:00Z",
          updatedAt: "2026-03-06T11:30:00Z"
        },
        {
          id: 3,
          code: "CL-2026-003",
          title: "Sửa chữa thiết bị",
          location: "Văn phòng Giám đốc",
          content: "Sửa chữa máy in",
          startDate: "2026-03-07T09:00:00Z",
          endDate: "2026-03-07T11:00:00Z",
          status: "completed",
          assignedTo: 3,
          createdBy: 1,
          createdAt: "2026-03-05T15:00:00Z",
          updatedAt: "2026-03-07T11:00:00Z"
        }
      ];
      setWorkOrders(mockWorkOrders);
      setFilteredWorkOrders(mockWorkOrders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data: CreateWorkOrderPayload) {
    try {
      setIsSubmitting(true);
      // Mock API call
      const newWorkOrder: WorkOrder = {
        id: Date.now(),
        code: `CL-2026-${String(workOrders.length + 1).padStart(3, "0")}`,
        ...data,
        status: "pending",
        createdBy: 1, // Current user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setWorkOrders(prev => [...prev, newWorkOrder]);
      toast.success("Tạo công lệnh thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tạo công lệnh";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(data: UpdateWorkOrderPayload) {
    if (!editingWorkOrder) return;

    try {
      setIsSubmitting(true);
      // Mock API call
      setWorkOrders(prev =>
        prev.map(wo =>
          wo.id === editingWorkOrder.id
            ? { ...wo, ...data, updatedAt: new Date().toISOString() }
            : wo
        )
      );
      toast.success("Cập nhật công lệnh thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi cập nhật công lệnh";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa công lệnh này?")) {
      return;
    }

    try {
      // Mock API call
      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
      toast.success("Xóa công lệnh thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi xóa công lệnh";
      toast.error(message);
    }
  }

  async function handlePrint(id: number) {
    try {
      const workOrder = workOrders.find(wo => wo.id === id);
      if (!workOrder) {
        toast.error("Không tìm thấy công lệnh");
        return;
      }

      const assignedPerson = personnel.find(p => p.id === workOrder.assignedTo);
      const createdByPerson = personnel.find(p => p.id === workOrder.createdBy);

      const formatDate = (dateTime: string | undefined) => {
        if (!dateTime) return "-";
        const date = new Date(dateTime);
        return `${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Giấy Đi Đường</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #000;
              line-height: 1.4;
              padding: 0;
              font-size: 13px;
            }
            .container {
              max-width: 210mm;
              height: 297mm;
              margin: 0 auto;
              background: #fff;
              padding: 20mm;
              position: relative;
            }
            .header-top {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 0;
              margin-bottom: 15px;
              font-size: 11px;
              text-align: center;
              line-height: 1.3;
            }
            .header-col {
              border: 1px solid #000;
              padding: 8px 4px;
              min-height: 50px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .header-left {
              font-weight: bold;
              font-size: 10px;
            }
            .header-center {
              font-weight: bold;
              font-size: 10px;
            }
            .header-right {
              font-size: 9px;
              line-height: 1.2;
            }
            .title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 15px 0 5px 0;
              text-transform: uppercase;
            }
            .number-field {
              text-align: right;
              font-size: 12px;
              margin-bottom: 10px;
            }
            .info-section {
              margin-bottom: 12px;
              line-height: 1.5;
              font-size: 12px;
            }
            .info-line {
              margin-bottom: 5px;
            }
            .info-label {
              display: inline-block;
              font-weight: normal;
              margin-right: 5px;
            }
            .info-value {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 180px;
              padding: 0 5px;
            }
            .location-date {
              text-align: right;
              margin: 12px 0;
              font-size: 12px;
              font-style: italic;
            }
            .signature-header {
              text-align: center;
              font-weight: bold;
              font-size: 13px;
              margin: 15px 0 2px 0;
            }
            .signature-subheader {
              text-align: center;
              font-size: 11px;
              margin-bottom: 50px;
            }
            .allowance-section {
              margin: 12px 0;
              font-size: 12px;
              line-height: 1.8;
            }
            .allowance-title {
              font-weight: normal;
              margin-bottom: 3px;
            }
            .allowance-line {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 10px;
            }
            .allowance-item {
              flex: 0 0 auto;
            }
            .allowance-dots {
              border-bottom: 1px solid #000;
              min-width: 200px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 11px;
            }
            table th, table td {
              border: 1px solid #000;
              padding: 5px 3px;
              text-align: center;
              height: 25px;
            }
            table th {
              background-color: #fff;
              font-weight: bold;
              font-size: 10px;
            }
            table td {
              text-align: left;
              padding: 8px 4px;
            }
            .col-location {
              text-align: left;
              width: 25%;
            }
            .col-date {
              width: 12%;
            }
            .col-vehicle {
              width: 15%;
              text-align: left;
            }
            .col-days {
              width: 12%;
            }
            .col-reason {
              width: 18%;
              text-align: left;
            }
            .col-confirm {
              width: 18%;
              text-align: left;
            }
            .notes-section {
              margin: 12px 0;
              font-size: 12px;
              line-height: 1.6;
            }
            .note-line {
              margin-bottom: 5px;
            }
            .finance-section {
              margin: 12px 0;
              font-size: 12px;
              line-height: 1.8;
            }
            .finance-line {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 10px;
              margin-bottom: 4px;
            }
            .finance-dots {
              border-bottom: 1px solid #000;
            }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
              margin-top: 40px;
              font-size: 11px;
              text-align: center;
            }
            .signature-box {
              border-top: 1px solid #000;
              padding-top: 40px;
            }
            .signature-label {
              font-weight: bold;
              margin-bottom: 2px;
              line-height: 1.3;
            }
            .signature-subtext {
              font-size: 10px;
              margin-bottom: 20px;
              font-style: italic;
            }
            .signature-name {
              font-size: 10px;
              margin-top: 3px;
            }
            @media print {
              body {
                padding: 0;
              }
              .container {
                max-width: 210mm;
                height: 297mm;
                padding: 20mm;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-top">
              <div class="header-col header-left">
                TRƯỜNG ĐẠI HỌC TRÀ VINH<br>TRƯỜNG THỰC HÀNH SƯ PHẠM<br><br>Mã đơn vị ngành sách 1113255
              </div>
              <div class="header-col header-center">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập - Tự do - Hạnh phúc
              </div>
              <div class="header-col header-right">
                Mẫu số C16 - HD<br>(Ban hành kèm theo)<br>Thông tư 10/2017/TTLBTTC<br>ngày 10/10/2017
              </div>
            </div>

            <div class="title">Giấy Đi Đường</div>
            <div class="number-field">Số: ________________</div>

            <div class="info-section">
              <div class="info-line">
                <span class="info-label">Cấp cho (Ông/Bà):</span>
                <span class="info-value">${assignedPerson ? assignedPerson.fullName : ''}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Chức vụ:</span>
                <span class="info-value">Hiệu trưởng</span>
              </div>
              <div class="info-line">
                <span class="info-label">Được cử đi công tác tại:</span>
                <span class="info-value">${workOrder.location || ''}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Nội dung:</span>
                <span class="info-value">${workOrder.content}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Từ ngày ${formatDate(workOrder.startDate)}</span>
              </div>
            </div>

            <div class="location-date">
              Vĩnh Long, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
            </div>

            <div class="signature-header">HIỆU TRƯỞNG</div>
            <div class="signature-subheader">(Ký, ghi rõ họ tên và dấu)</div>

            <div class="allowance-section">
              <div class="allowance-title">Tiền ứng trước</div>
              <div class="allowance-line">
                <span class="allowance-item">Lương</span>
                <span class="allowance-dots" style="margin-top: -3px;"></span><span style="margin-left: 3px;">đ</span>
              </div>
              <div class="allowance-line">
                <span class="allowance-item">Công tác phí</span>
                <span class="allowance-dots" style="margin-top: -3px;"></span><span style="margin-left: 3px;">đ</span>
              </div>
              <div class="allowance-line">
                <span class="allowance-item">Cộng</span>
                <span class="allowance-dots" style="margin-top: -3px;"></span><span style="margin-left: 3px;">đ</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="col-location">Nơi đi / Nơi đến</th>
                  <th class="col-date">Ngày</th>
                  <th class="col-vehicle">Phương tiện vận động</th>
                  <th class="col-days">Số ngày công tác</th>
                  <th class="col-reason">Lý do lên trả</th>
                  <th class="col-confirm">Chứng nhận cơ quan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-location">Nơi đi: Trường Thực hành Sư phạm</td>
                  <td class="col-date">${workOrder.startDate ? new Date(workOrder.startDate).getDate() : ''}/${workOrder.startDate ? new Date(workOrder.startDate).getMonth() + 1 : ''}/${workOrder.startDate ? new Date(workOrder.startDate).getFullYear() : ''}</td>
                  <td class="col-vehicle"></td>
                  <td class="col-days"></td>
                  <td class="col-reason"></td>
                  <td class="col-confirm"></td>
                </tr>
                <tr>
                  <td class="col-location">Nơi đến: ${workOrder.location || ''}</td>
                  <td class="col-date">${workOrder.endDate ? new Date(workOrder.endDate).getDate() : ''}/${workOrder.endDate ? new Date(workOrder.endDate).getMonth() + 1 : ''}/${workOrder.endDate ? new Date(workOrder.endDate).getFullYear() : ''}</td>
                  <td class="col-vehicle"></td>
                  <td class="col-days"></td>
                  <td class="col-reason"></td>
                  <td class="col-confirm"></td>
                </tr>
                <tr>
                  <td class="col-location">Nơi đi:</td>
                  <td class="col-date"></td>
                  <td class="col-vehicle"></td>
                  <td class="col-days"></td>
                  <td class="col-reason"></td>
                  <td class="col-confirm"></td>
                </tr>
                <tr>
                  <td class="col-location">Nơi đến:</td>
                  <td class="col-date"></td>
                  <td class="col-vehicle"></td>
                  <td class="col-days"></td>
                  <td class="col-reason"></td>
                  <td class="col-confirm"></td>
                </tr>
              </tbody>
            </table>

            <div class="notes-section">
              <div class="note-line">- Tiền xe đi và về: ....................................................................................................</div>
              <div class="note-line">- Về cuộc: ....................................................................................................</div>
              <div class="note-line">- Không nghỉ: ....................................................................................................</div>
              <div class="note-line">- Phụ cấp lưu trú: ....................................................................................................</div>
            </div>

            <div class="finance-section">
              <div class="finance-line">
                <span>Tổng số tiền:</span>
                <span class="finance-dots"></span>
              </div>
              <div class="finance-line">
                <span>Bằng chữ:</span>
                <span class="finance-dots"></span>
              </div>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">Người cử công tác</div>
                <div class="signature-subtext">(Ký, họ tên)</div>
                <div class="signature-name">${createdByPerson ? createdByPerson.fullName : ''}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Kế Toán</div>
                <div class="signature-subtext">(Ký, họ tên)</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Hiệu Trưởng</div>
                <div class="signature-subtext">(Ký, họ tên)</div>
                <div class="signature-name">${assignedPerson ? assignedPerson.fullName : ''}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open("", "", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      toast.error("Lỗi in công lệnh");
    }
  }

  async function handleApprove(id: number) {
    try {
      setWorkOrders(prev =>
        prev.map(wo =>
          wo.id === id
            ? { ...wo, status: "approved" as const, updatedAt: new Date().toISOString() }
            : wo
        )
      );
      toast.success("Duyệt công lệnh thành công");
    } catch (error) {
      toast.error("Lỗi duyệt công lệnh");
    }
  }

  async function handleReject(id: number) {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;

    try {
      setWorkOrders(prev =>
        prev.map(wo =>
          wo.id === id
            ? {
                ...wo,
                status: "rejected" as const,
                rejectionReason: reason,
                updatedAt: new Date().toISOString()
              }
            : wo
        )
      );
      toast.success("Từ chối công lệnh thành công");
    } catch (error) {
      toast.error("Lỗi từ chối công lệnh");
    }
  }

  async function handleComplete(id: number) {
    try {
      setWorkOrders(prev =>
        prev.map(wo =>
          wo.id === id
            ? {
                ...wo,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : wo
        )
      );
      toast.success("Hoàn thành công lệnh thành công");
    } catch (error) {
      toast.error("Lỗi hoàn thành công lệnh");
    }
  }

  const handleSubmit = async (data: CreateWorkOrderPayload | UpdateWorkOrderPayload) => {
    if (editingWorkOrder) {
      await handleUpdate(data);
    } else {
      await handleCreate(data as CreateWorkOrderPayload);
    }
    setEditingWorkOrder(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("workOrders")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tSidebar("workOrders")}</h2>
          <p className="text-gray-600 mt-1 text-sm">Tạo, phê duyệt và theo dõi các công việc được giao</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vi/dashboard/work-orders/tao-moi">
            <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Tạo công lệnh
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm theo mã công lệnh, nơi công tác, nội dung..."
              className="pl-10 bg-white border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {mounted ? (
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border border-gray-200 shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="sm:w-48">
            <div className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background text-muted-foreground opacity-50 cursor-not-allowed">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>Lọc theo trạng thái</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50 rotate-90" />
            </div>
          </div>
        )}
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách công lệnh</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            <WorkOrderTable
              data={filteredWorkOrders}
              personnel={personnel}
              onEdit={(id) => {
                const workOrder = workOrders.find(wo => wo.id === id);
                setEditingWorkOrder(workOrder);
                setIsDialogOpen(true);
              }}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              onComplete={handleComplete}
              onPrint={handlePrint}
              isLoading={false}
            />
          )}
        </div>
      </div>

      {/* Work Order Dialog */}
      <WorkOrderDialog
        workOrder={editingWorkOrder}
        personnel={personnel}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}