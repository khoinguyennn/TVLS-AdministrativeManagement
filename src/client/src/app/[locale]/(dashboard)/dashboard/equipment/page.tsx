'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Edit, Loader2, Monitor, Plus, Search, Trash2 } from 'lucide-react';
import { TableSkeleton } from '@/components/skeletons';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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

import { roomService } from '@/services/room.service';
import { equipmentService } from '@/services/equipment.service';
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from '@/types/facility.types';

const PAGE_SIZE = 10;
const CATEGORIES = ['computer', 'projector', 'furniture', 'lab-equipment', 'other'] as const;
const STATUSES = ['working', 'broken', 'maintenance', 'disposed'] as const;

const statusBadgeClass: Record<string, string> = {
  working: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent',
  broken: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent',
  disposed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-transparent',
};

export default function EquipmentPage() {
  const t = useTranslations('Facilities.equipment');
  const queryClient = useQueryClient();

  // Data fetching
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.getAll(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getAll(),
  });

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formCategory, setFormCategory] = useState<string>('other');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formWarrantyExpiry, setFormWarrantyExpiry] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState<string>('working');
  const [formDescription, setFormDescription] = useState('');

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateEquipmentInput) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(t('toast.createSuccess'));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEquipmentInput }) => equipmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(t('toast.updateSuccess'));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(t('toast.deleteSuccess'));
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  // Filtered & paginated data
  const filteredEquipment = useMemo(() => {
    let result = equipment;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.brand?.toLowerCase().includes(q));
    }

    if (roomFilter !== 'all') {
      result = result.filter((e) => e.roomId === parseInt(roomFilter));
    }

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    return result;
  }, [equipment, search, roomFilter, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / PAGE_SIZE));
  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEquipment.slice(start, start + PAGE_SIZE);
  }, [filteredEquipment, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roomFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dialog handlers
  const handleOpenCreate = useCallback(() => {
    setEditingEquipment(null);
    setFormName('');
    setFormCode('');
    setFormRoomId('');
    setFormCategory('other');
    setFormBrand('');
    setFormModel('');
    setFormSerialNumber('');
    setFormPurchaseDate('');
    setFormWarrantyExpiry('');
    setFormPrice('');
    setFormStatus('working');
    setFormDescription('');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((equip: Equipment) => {
    setEditingEquipment(equip);
    setFormName(equip.name);
    setFormCode(equip.code);
    setFormRoomId(equip.roomId.toString());
    setFormCategory(equip.category);
    setFormBrand(equip.brand || '');
    setFormModel(equip.model || '');
    setFormSerialNumber(equip.serialNumber || '');
    setFormPurchaseDate(equip.purchaseDate ? equip.purchaseDate.split('T')[0] : '');
    setFormWarrantyExpiry(equip.warrantyExpiry ? equip.warrantyExpiry.split('T')[0] : '');
    setFormPrice(equip.price?.toString() || '');
    setFormStatus(equip.status);
    setFormDescription(equip.description || '');
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const data: CreateEquipmentInput = {
      name: formName,
      code: formCode,
      roomId: parseInt(formRoomId),
      category: formCategory as Equipment['category'],
      brand: formBrand || undefined,
      model: formModel || undefined,
      serialNumber: formSerialNumber || undefined,
      purchaseDate: formPurchaseDate || undefined,
      warrantyExpiry: formWarrantyExpiry || undefined,
      price: formPrice ? parseFloat(formPrice) : undefined,
      status: formStatus as Equipment['status'],
      description: formDescription || undefined,
    };

    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [
    editingEquipment,
    formName,
    formCode,
    formRoomId,
    formCategory,
    formBrand,
    formModel,
    formSerialNumber,
    formPurchaseDate,
    formWarrantyExpiry,
    formPrice,
    formStatus,
    formDescription,
    createMutation,
    updateMutation,
  ]);

  const handleDelete = useCallback(() => {
    if (deletingEquipment) {
      deleteMutation.mutate(deletingEquipment.id);
    }
  }, [deletingEquipment, deleteMutation]);

  const getRoomName = (roomId: number) => {
    return rooms.find((r) => r.id === roomId)?.name || 'N/A';
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
          {t('breadcrumb.home')}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{t('breadcrumb.equipment')}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Monitor className="size-6" />
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t('addEquipment')}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-10" />
        </div>
        {mounted ? (
          <>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('allRooms')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRooms')}</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`statuses.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <div className="flex gap-4">
            <div className="flex w-48 h-9 cursor-not-allowed items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground opacity-50 shadow-sm ring-offset-background">
              <span>{t("allRooms")}</span>
              <ChevronRight className="size-4 rotate-90 opacity-50" />
            </div>
            <div className="flex w-48 h-9 cursor-not-allowed items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground opacity-50 shadow-sm ring-offset-background">
              <span>{t("allCategories")}</span>
              <ChevronRight className="size-4 rotate-90 opacity-50" />
            </div>
            <div className="flex w-48 h-9 cursor-not-allowed items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground opacity-50 shadow-sm ring-offset-background">
              <span>{t("allStatuses")}</span>
              <ChevronRight className="size-4 rotate-90 opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={9} rows={5} />
        ) : paginatedEquipment.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">{t('noResults')}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.code')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.name')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.category')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.room')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.brand')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.model')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.price')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.status')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">{t('columns.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEquipment.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-4 font-mono text-sm">{item.code}</TableCell>
                      <TableCell className="px-6 py-4 font-semibold">{item.name}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline">{t(`categories.${item.category}`)}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm">{getRoomName(item.roomId)}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">{item.brand || '-'}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">{item.model || '-'}</TableCell>
                      <TableCell className="px-6 py-4 text-sm">{item.price ? `${item.price.toLocaleString('vi-VN')} đ` : '-'}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={statusBadgeClass[item.status]}>{t(`statuses.${item.status}`)}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(item)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setDeletingEquipment(item);
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
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t('pagination.showing')} {(currentPage - 1) * PAGE_SIZE + 1} {t('pagination.to')} {Math.min(currentPage * PAGE_SIZE, filteredEquipment.length)} {t('pagination.of')} {filteredEquipment.length} {t('pagination.equipment')}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? t('editEquipment') : t('addEquipment')}</DialogTitle>
            <DialogDescription>{editingEquipment ? t('form.update') : t('form.create')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t('form.name')} <span className="text-destructive">{t('form.required')}</span>
                </Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t('form.namePlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">
                  {t('form.code')} <span className="text-destructive">{t('form.required')}</span>
                </Label>
                <Input id="code" value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder={t('form.codePlaceholder')} disabled={!!editingEquipment} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="room">
                  {t('form.room')} <span className="text-destructive">{t('form.required')}</span>
                </Label>
                <Select value={formRoomId} onValueChange={setFormRoomId}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder={t('form.selectRoom')} />
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
                <Label htmlFor="category">
                  {t('form.category')} <span className="text-destructive">{t('form.required')}</span>
                </Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`categories.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">{t('form.brand')}</Label>
                <Input id="brand" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} placeholder={t('form.brandPlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">{t('form.model')}</Label>
                <Input id="model" value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder={t('form.modelPlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">{t('form.serialNumber')}</Label>
                <Input id="serialNumber" value={formSerialNumber} onChange={(e) => setFormSerialNumber(e.target.value)} placeholder={t('form.serialNumberPlaceholder')} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">{t('form.purchaseDate')}</Label>
                <Input id="purchaseDate" type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="warrantyExpiry">{t('form.warrantyExpiry')}</Label>
                <Input id="warrantyExpiry" type="date" value={formWarrantyExpiry} onChange={(e) => setFormWarrantyExpiry(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">{t('form.price')}</Label>
                <Input id="price" type="number" min="0" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder={t('form.pricePlaceholder')} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t('form.status')}</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('form.description')}</Label>
              <Input id="description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder={t('form.descriptionPlaceholder')} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('form.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !formName || !formCode || !formRoomId}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingEquipment ? t('form.update') : t('form.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm.title')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm.description', { name: deletingEquipment?.name || '' })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('deleteConfirm.cancel')}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
