"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Loader2 } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonnelTable } from "@/components/personnel/personnel-table";
import { ExcelImportExportDialog } from "@/components/personnel/excel-import-export-dialog";
import { personnelService } from "@/services/personnel.service";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<PersonnelRecord[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load personnel data
  useEffect(() => {
    loadPersonnel();
  }, []);

  // Filter personnel based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPersonnel(personnel);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = personnel.filter(
      (p) =>
        p.fullName.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        (p.contactAddress?.phone && p.contactAddress.phone.includes(query))
    );
    setFilteredPersonnel(filtered);
  }, [searchQuery, personnel]);

  async function loadPersonnel() {
    try {
      setIsLoading(true);
      // Mock data - replace with API call when backend is ready
      const mockData: PersonnelRecord[] = [
        {
          id: 1,
          userId: 1,
          code: "8401555613",
          fullName: "Bùi Hữu Khánh",
          email: "bhkhanh@tvu.edu.vn",
          role: "teacher",
          status: "active",
          gender: "Nam",
          dateOfBirth: "1987-05-12",
          cccdNumber: "084087001648",
          staffStatus: "working",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          contactAddress: {
            phone: "0904789498"
          }
        },
        {
          id: 2,
          userId: 2,
          code: "8413375048",
          fullName: "Bùi Quốc Tân",
          email: "buitan@tvu.edu.vn",
          role: "teacher",
          status: "active",
          gender: "Nam",
          dateOfBirth: "1991-12-19",
          cccdNumber: "084091001190",
          staffStatus: "working",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          contactAddress: {
            phone: "0982454710"
          }
        },
        {
          id: 3,
          userId: 3,
          code: "8400631101",
          fullName: "Bùi Thế Ngân",
          email: "btngan@tvu.edu.vn",
          role: "teacher",
          status: "active",
          gender: "Nam",
          dateOfBirth: "1984-12-08",
          cccdNumber: "084084001944",
          staffStatus: "working",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          contactAddress: {
            phone: "0904542520"
          }
        },
        {
          id: 4,
          userId: 4,
          code: "8401979501",
          fullName: "Bùi Thị Cẩm Loan",
          email: "btcloan@tvu.edu.vn",
          role: "teacher",
          status: "active",
          gender: "Nữ",
          dateOfBirth: "1981-01-01",
          cccdNumber: "084181002023",
          staffStatus: "working",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          contactAddress: {
            phone: "0914880571"
          }
        },
        {
          id: 5,
          userId: 5,
          code: "8413269448",
          fullName: "Bùi Văn Cật",
          email: "buicat@tvu.edu.vn",
          role: "teacher",
          status: "active",
          gender: "Nam",
          dateOfBirth: "1976-05-15",
          cccdNumber: "084076001778",
          staffStatus: "working",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          contactAddress: {
            phone: "0909207380"
          }
        }
      ];
      setPersonnel(mockData);
      setFilteredPersonnel(mockData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) {
      return;
    }

    try {
      // await personnelService.delete(id);
      setPersonnel((prev) => prev.filter((p) => p.id !== id));
      toast.success("Xóa nhân sự thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi xóa dữ liệu";
      toast.error(message);
    }
  }

  async function handleImportExcel(file: File) {
    try {
      // const response = await personnelService.importExcel(file);
      // After import, reload the data
      await loadPersonnel();
      toast.success("Nhập dữ liệu Excel thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi nhập Excel";
      toast.error(message);
      throw error;
    }
  }

  async function handleExportExcel() {
    try {
      // const blob = await personnelService.exportExcel();
      // Create a mock export
      const data = filteredPersonnel;
      const csv = [
        ["Mã định danh", "Họ và tên", "Giới tính", "Ngày sinh", "CCCD", "Email", "Điện thoại"]
          .map((h) => `"${h}"`)
          .join(","),
        ...data.map((p) =>
          [
            p.code,
            p.fullName,
            p.gender,
            p.dateOfBirth,
            p.cccdNumber,
            p.email,
            p.contactAddress?.phone
          ]
            .map((v) => `"${v || ""}"`)
            .join(",")
        )
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `personnel-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast.success("Xuất dữ liệu thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi xuất Excel";
      toast.error(message);
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hồ sơ nhân sự</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Quản lý thông tin chi tiết của nhân sự
          </p>
        </div>
        <div className="flex gap-2">
          <ExcelImportExportDialog
            onImport={handleImportExcel}
            onExport={handleExportExcel}
          />
          <Link href="/dashboard/records/add">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="h-4 w-4" />
              Thêm nhân sự
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo tên, mã, email hoặc điện thoại..."
            className="pl-10 bg-white border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách nhân sự</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            <PersonnelTable
              data={filteredPersonnel}
              onDelete={handleDelete}
              isLoading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
