"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  label = "bản ghi",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build page number list with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-gray-200">
      {/* Left: info text */}
      <p className="text-sm text-gray-500">
        Hiển thị{" "}
        <span className="font-medium text-gray-700">{from}</span>
        {" - "}
        <span className="font-medium text-gray-700">{to}</span>
        {" trên "}
        <span className="font-medium text-gray-700">{total}</span>
        {" "}
        {label}
      </p>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 text-sm ${
                p === page
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(p as number)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
