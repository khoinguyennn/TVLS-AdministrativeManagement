'use client';

import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Plus,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data
const records = [
  {
    id: 'REC-8291',
    name: 'Báo cáo tài chính Q3',
    submitter: 'Trần Duy',
    initials: 'TD',
    date: '12/10/2023',
    department: 'Phòng Tài chính',
    status: 'pending',
  },
  {
    id: 'REC-7312',
    name: 'Đề xuất mua sắm thiết bị IT',
    submitter: 'Lê Hoa',
    initials: 'LH',
    date: '11/10/2023',
    department: 'Phòng Kỹ thuật',
    status: 'approved',
  },
  {
    id: 'REC-9011',
    name: 'Hợp đồng đối tác ABC',
    submitter: 'Nguyễn Phong',
    initials: 'NP',
    date: '10/10/2023',
    department: 'Phòng Kinh doanh',
    status: 'rejected',
  },
  {
    id: 'REC-6623',
    name: 'Kế hoạch marketing Tết',
    submitter: 'Phạm Thúy',
    initials: 'PT',
    date: '08/10/2023',
    department: 'Phòng Marketing',
    status: 'submitted',
  },
  {
    id: 'REC-4412',
    name: 'Đơn xin nghỉ phép - Mai Anh',
    submitter: 'Mai Anh',
    initials: 'MA',
    date: '05/10/2023',
    department: 'Phòng Hành chính',
    status: 'approved',
  },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Đang chờ', variant: 'secondary' },
  approved: { label: 'Đã duyệt', variant: 'default' },
  rejected: { label: 'Từ chối', variant: 'destructive' },
  submitted: { label: 'Đã gửi', variant: 'outline' },
};

export default function DashboardRecordsPage() {
  return (
    <>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-[#2060df]">
          Trang chủ
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-slate-900 dark:text-slate-100 font-medium">
          Hồ sơ hành chính
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Hồ sơ hành chính</h2>
          <p className="text-slate-500">
            Quản lý và phê duyệt các hồ sơ hành chính của doanh nghiệp
          </p>
        </div>
        <Button className="bg-[#2060df] hover:bg-[#2060df]/90 text-white">
          <Plus className="size-5 mr-2" />
          Tạo hồ sơ mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              <Filter className="size-4" />
              Bộ lọc
            </div>

            <Button variant="outline" size="sm" className="text-sm">
              Trạng thái: <b className="ml-1">Tất cả</b>
            </Button>

            <Button variant="outline" size="sm" className="text-sm">
              <Calendar className="size-4 mr-2" />
              Thời gian: <b className="ml-1">Tháng này</b>
            </Button>

            <Button variant="outline" size="sm" className="text-sm">
              Phòng ban: <b className="ml-1">Tất cả</b>
            </Button>

            <Button
              variant="link"
              size="sm"
              className="ml-auto text-[#2060df] font-medium"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">Tên hồ sơ</TableHead>
                <TableHead className="font-bold">Người nộp</TableHead>
                <TableHead className="font-bold">Ngày tạo</TableHead>
                <TableHead className="font-bold">Phòng ban</TableHead>
                <TableHead className="font-bold text-center">Trạng thái</TableHead>
                <TableHead className="font-bold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const status = statusConfig[record.status];
                const isActionDisabled = record.status === 'approved' || record.status === 'rejected';

                return (
                  <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{record.name}</span>
                        <span className="text-xs text-slate-400">ID: #{record.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px] font-bold bg-[#2060df]/10 text-[#2060df]">
                            {record.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{record.submitter}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{record.date}</TableCell>
                    <TableCell className="text-sm text-slate-500">{record.department}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-[#2060df]"
                          title="Xem"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-blue-500"
                          title="Sửa"
                          disabled={isActionDisabled}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-green-500"
                          title="Phê duyệt"
                          disabled={isActionDisabled}
                        >
                          <CheckCircle className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-red-500"
                          title="Từ chối"
                          disabled={isActionDisabled}
                        >
                          <XCircle className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium">1-5</span> trong số{' '}
            <span className="font-medium">84</span> hồ sơ
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <div className="flex items-center gap-1">
              <Button size="sm" className="size-8 bg-[#2060df] text-white">
                1
              </Button>
              <Button variant="ghost" size="sm" className="size-8">
                2
              </Button>
              <Button variant="ghost" size="sm" className="size-8">
                3
              </Button>
              <span className="px-1 text-slate-400">...</span>
              <Button variant="ghost" size="sm" className="size-8">
                17
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Tiếp theo
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
