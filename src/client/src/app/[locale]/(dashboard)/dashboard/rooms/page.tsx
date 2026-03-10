'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, DoorOpen, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

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

import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import type { Room, CreateRoomInput, UpdateRoomInput } from '@/types/facility.types';

const PAGE_SIZE = 10;

export default function RoomsPage() {
  const queryClient = useQueryClient();

  // Data fetching
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getAll(),
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getAll(),
  });

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBuildingId, setFormBuildingId] = useState('');

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateRoomInput) => roomService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Tạo phòng thành công');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo phòng');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoomInput }) => roomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Cập nhật phòng thành công');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật phòng');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roomService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Xoá phòng thành công');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xoá phòng');
    },
  });

  // Filtered & paginated data
  const filteredRooms = useMemo(() => {
    let result = rooms;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (buildingFilter !== 'all') {
      result = result.filter((r) => r.buildingId === parseInt(buildingFilter));
    }

    return result;
  }, [rooms, search, buildingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, buildingFilter]);

  // Dialog handlers
  const handleOpenCreate = useCallback(() => {
    setEditingRoom(null);
    setFormName('');
    setFormBuildingId('');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormBuildingId(room.buildingId.toString());
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const data: CreateRoomInput = {
      name: formName,
      buildingId: parseInt(formBuildingId),
    };

    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingRoom, formName, formBuildingId, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingRoom) {
      deleteMutation.mutate(deletingRoom.id);
    }
  }, [deletingRoom, deleteMutation]);

  const getBuildingName = (buildingId: number) => {
    return buildings.find((b) => b.id === buildingId)?.name || 'N/A';
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
        <span className="font-medium text-foreground">Quản lý Phòng</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DoorOpen className="size-6" />
            Quản lý Phòng
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Quản lý thông tin các phòng trong toà nhà</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          Thêm phòng
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên phòng..." className="pl-10" />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả toà nhà" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả toà nhà</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.name}
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
        ) : paginatedRooms.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Không tìm thấy phòng nào</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">STT</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tên phòng</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Toà nhà</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRooms.map((room, index) => (
                  <TableRow key={room.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4 text-sm">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell className="px-6 py-4 font-semibold">{room.name}</TableCell>
                    <TableCell className="px-6 py-4 text-sm">{getBuildingName(room.buildingId)}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(room)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingRoom(room);
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
                Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} đến {Math.min(currentPage * PAGE_SIZE, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
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
            <DialogTitle>{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
            <DialogDescription>{editingRoom ? 'Cập nhật thông tin phòng' : 'Nhập thông tin phòng mới'}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="building">
                Toà nhà <span className="text-destructive">*</span>
              </Label>
              <Select value={formBuildingId} onValueChange={setFormBuildingId}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Chọn toà nhà" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên phòng <span className="text-destructive">*</span>
              </Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ví dụ: Phòng 101" />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !formName || !formBuildingId}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingRoom ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xoá phòng "{deletingRoom?.name}"? Hành động này không thể hoàn tác.</DialogDescription>
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
