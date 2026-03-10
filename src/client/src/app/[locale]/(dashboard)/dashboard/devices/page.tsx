'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Monitor, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { deviceService } from '@/services/device.service';
import { roomService } from '@/services/room.service';
import { buildingService } from '@/services/building.service';
import type { Device, CreateDeviceInput, UpdateDeviceInput } from '@/types/facility.types';

const PAGE_SIZE = 10;
const STATUSES = ['active', 'under_repair', 'waiting_replacement', 'broken'] as const;

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  under_repair: 'Đang sửa chữa',
  waiting_replacement: 'Chờ thay thế',
  broken: 'Hỏng',
};

const statusBadgeClass: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent',
  under_repair: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent',
  waiting_replacement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-transparent',
  broken: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent',
};

export default function DevicesPage() {
  const queryClient = useQueryClient();

  // Data fetching
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getAll(),
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getAll(),
  });

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formStatus, setFormStatus] = useState<string>('active');

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateDeviceInput) => deviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Tạo thiết bị thành công');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Create device error:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thiết bị';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeviceInput }) => deviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Cập nhật thiết bị thành công');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật thiết bị');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Xoá thiết bị thành công');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xoá thiết bị');
    },
  });

  // Filtered & paginated data
  const filteredDevices = useMemo(() => {
    let result = devices;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    if (roomFilter !== 'all') {
      const roomId = parseInt(roomFilter);
      result = result.filter((d) => d.roomId === roomId);
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    return result;
  }, [devices, search, roomFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE));
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDevices.slice(start, start + PAGE_SIZE);
  }, [filteredDevices, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roomFilter, statusFilter]);

  // Dialog handlers
  const handleOpenCreate = useCallback(() => {
    setEditingDevice(null);
    setFormName('');
    setFormRoomId('');
    setFormStatus('active');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((device: Device) => {
    setEditingDevice(device);
    setFormName(device.name);
    setFormRoomId(device.roomId ? device.roomId.toString() : '');
    setFormStatus(device.status);
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formRoomId) {
      toast.error('Vui lòng chọn phòng');
      return;
    }

    const data: CreateDeviceInput = {
      name: formName,
      roomId: parseInt(formRoomId),
      status: formStatus as Device['status'],
    };

    console.log('Submitting device data:', data);

    if (editingDevice) {
      updateMutation.mutate({ id: editingDevice.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingDevice, formName, formRoomId, formStatus, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingDevice) {
      deleteMutation.mutate(deletingDevice.id);
    }
  }, [deletingDevice, deleteMutation]);

  const getRoomName = (roomId?: number) => {
    if (!roomId) return 'Chưa gán';
    return rooms.find((r) => r.id === roomId)?.name || 'N/A';
  };

  const getBuildingName = (roomId?: number) => {
    if (!roomId) return 'N/A';
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return 'N/A';
    return buildings.find((b) => b.id === room.buildingId)?.name || 'N/A';
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">Quản lý Thiết bị</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Monitor className="size-6" />
            Quản lý Thiết bị
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Quản lý thông tin các thiết bị trong phòng</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          Thêm thiết bị
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên thiết bị..." className="pl-10" />
        </div>
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả phòng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.name}
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
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
          </div>
        ) : paginatedDevices.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Không tìm thấy thiết bị nào</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">STT</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tên thiết bị</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Phòng</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Toà nhà</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Trạng thái</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDevices.map((device, index) => (
                  <TableRow key={device.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4 text-sm">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell className="px-6 py-4 font-semibold">{device.name}</TableCell>
                    <TableCell className="px-6 py-4 text-sm">{getRoomName(device.roomId)}</TableCell>
                    <TableCell className="px-6 py-4 text-sm">{getBuildingName(device.roomId)}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={statusBadgeClass[device.status]}>{statusLabels[device.status]}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(device)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingDevice(device);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} đến {Math.min(currentPage * PAGE_SIZE, filteredDevices.length)} trong tổng số {filteredDevices.length} thiết bị
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-8" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 min-w-8 px-3 text-xs font-semibold"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="size-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDevice ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</DialogTitle>
            <DialogDescription>{editingDevice ? 'Cập nhật thông tin thiết bị' : 'Nhập thông tin thiết bị mới'}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên thiết bị <span className="text-destructive">*</span>
              </Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ví dụ: Máy chiếu Epson" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="room">
                Phòng <span className="text-destructive">*</span>
              </Label>
              <Select value={formRoomId || undefined} onValueChange={setFormRoomId}>
                <SelectTrigger id="room">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !formName || !formRoomId}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingDevice ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xoá thiết bị "{deletingDevice?.name}"? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
