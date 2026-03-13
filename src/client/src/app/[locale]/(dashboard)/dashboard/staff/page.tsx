"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonnelTable } from "@/components/personnel/personnel-table";
import { TablePagination } from "@/components/shared/table-pagination";
import { ExcelImportExportDialog } from "@/components/personnel/excel-import-export-dialog";
import { personnelService } from "@/services/personnel.service";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

export default function StaffPage() {
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");
  const tStaff = useTranslations("Staff");
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<PersonnelRecord[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Load personnel data
  useEffect(() => {
    loadPersonnel();
  }, []);

  // Filter personnel based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPersonnel(personnel);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = personnel.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          (p.contactAddress?.phone && p.contactAddress.phone.includes(query))
      );
      setFilteredPersonnel(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, personnel]);

  const pagedPersonnel = filteredPersonnel.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function loadPersonnel() {
    try {
      setIsLoading(true);
      const data = await personnelService.getAll();
      setPersonnel(data);
      setFilteredPersonnel(data);
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
      await personnelService.delete(id);
      setPersonnel((prev) => prev.filter((p) => p.id !== id));
      toast.success("Xóa nhân sự thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi xóa dữ liệu";
      toast.error(message);
    }
  }

  async function handleImportExcel(file: File) {
    try {
      const result = await personnelService.importExcel(file);
      await loadPersonnel();
      toast.success(`Nhập thành công ${result.success} hồ sơ`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi nhập Excel";
      toast.error(message);
      throw error;
    }
  }

  async function handleExportExcel() {
    try {
      const blob = await personnelService.exportExcel();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ho-so-nhan-su-${new Date().toISOString().split("T")[0]}.xlsx`;
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("staff")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tSidebar("staff")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{tStaff("description")}</p>
        </div>
        <div className="flex gap-2">
          <ExcelImportExportDialog onImport={handleImportExcel} onExport={handleExportExcel} />
          <Link href="/dashboard/staff/add">
            <Button className="gap-2">
              <Plus className="size-4" />
              {tStaff("addStaff")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tStaff("searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Danh sách nhân sự</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            <>
              <PersonnelTable
                data={pagedPersonnel}
                onDelete={handleDelete}
                isLoading={false}
                startIndex={(currentPage - 1) * PAGE_SIZE + 1}
              />
              <TablePagination
                total={filteredPersonnel.length}
                page={currentPage}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                label="nhân sự"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
