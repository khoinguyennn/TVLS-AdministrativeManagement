"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, ChevronRight } from "lucide-react";
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
import { PersonnelTable } from "@/components/personnel/personnel-table";
import { TablePagination } from "@/components/shared/table-pagination";
import { ExcelImportExportDialog } from "@/components/personnel/excel-import-export-dialog";
import { personnelService } from "@/services/personnel.service";
import type { PersonnelRecord } from "@/types/personnel.types";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function StaffPage() {
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");
  const tStaff = useTranslations("Staff");
  const [allPersonnel, setAllPersonnel] = useState<PersonnelRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadPersonnel = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await personnelService.getAllForSelection();
      setAllPersonnel(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải dữ liệu";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonnel();
  }, [loadPersonnel]);

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    allPersonnel.forEach((person) => {
      const role = person.positions?.[0]?.jobPosition?.trim();
      if (role) {
        set.add(role);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [allPersonnel]);

  const filteredPersonnel = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allPersonnel.filter((person) => {
      const role = person.positions?.[0]?.jobPosition?.trim() || "";
      const phone = person.contactAddress?.phone || "";

      const matchSearch =
        query.length === 0 ||
        person.fullName.toLowerCase().includes(query) ||
        person.code.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query);

      const matchRole = roleFilter === "all" || role === roleFilter;
      const matchStatus = statusFilter === "all" || person.staffStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [allPersonnel, roleFilter, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const pagedPersonnel = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPersonnel.slice(start, start + PAGE_SIZE);
  }, [filteredPersonnel, currentPage]);

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) {
      return;
    }

    try {
      await personnelService.delete(id);
      toast.success("Xóa nhân sự thành công");
      loadPersonnel();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi xóa dữ liệu";
      toast.error(message);
    }
  }

  async function handleImportExcel(file: File) {
    try {
      const result = await personnelService.importExcel(file);
      toast.success(`Nhập thành công ${result.success} hồ sơ`);
      loadPersonnel();
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

      {/* Search and Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tStaff("searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {mounted ? (
          <>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="working">Đang làm việc</SelectItem>
                <SelectItem value="probation">Thử việc</SelectItem>
                <SelectItem value="maternity_leave">Nghỉ thai sản</SelectItem>
                <SelectItem value="retired">Đã nghỉ hưu</SelectItem>
                <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
              <span>Tất cả vai trò</span>
              <ChevronRight className="size-4 opacity-50 rotate-90" />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
              <span>Tất cả trạng thái</span>
              <ChevronRight className="size-4 opacity-50 rotate-90" />
            </div>
          </>
        )}
      </div>

      {/* Personnel Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-0">
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
