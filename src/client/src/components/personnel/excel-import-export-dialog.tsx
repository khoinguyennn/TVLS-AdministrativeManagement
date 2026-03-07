"use client";

import { useState, useRef } from "react";
import { Download, Upload, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExcelImportExportDialogProps {
  onImport?: (file: File) => Promise<void>;
  onExport?: () => Promise<void>;
}

export function ExcelImportExportDialog({
  onImport,
  onExport
}: ExcelImportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setImportedFile(file);
      setError("");
    }
  };

  const handleImport = async () => {
    if (!importedFile) {
      setError("Vui lòng chọn file để nhập");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await onImport?.(importedFile);
      setSuccess("Nhập dữ liệu thành công!");
      setImportedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await onExport?.();
      setSuccess("Xuất dữ liệu thành công!");
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Nhập/Xuất Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Quản lý Excel Nhân sự</DialogTitle>
        <DialogDescription>
          Nhập hoặc xuất dữ liệu nhân sự từ/tới file Excel
        </DialogDescription>

        <div className="grid gap-4 py-4">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <div>✓ {success}</div>
            </div>
          )}

          {/* Import Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Nhập Excel</h3>
                </div>

                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {importedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm font-medium text-green-700">
                          ✓ {importedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(importedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setImportedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Kéo và thả file Excel hoặc
                      </p>
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        chọn từ máy tính
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!importedFile || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Đang nhập..." : "Nhập Excel"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* Export Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Xuất Excel</h3>
                </div>

                <p className="text-sm text-gray-600">
                  Tải xuống toàn bộ dữ liệu nhân sự dưới dạng file Excel
                </p>

                <Button
                  onClick={handleExport}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Đang xuất..." : "Xuất Excel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
