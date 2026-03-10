'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronLeft, ChevronRight, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { buildingService } from '@/services/building.service';
import type { Building, CreateBuildingInput, UpdateBuildingInput } from '@/types/facility.types';

const PAGE_SIZE = 10;

export default function BuildingsPage() {
  const t = useTranslations('Facilities.buildings');
  const tBreadcrumb = useTranslations('Breadcrumb');
  const queryClient = useQueryClient();

  // Data fetching
  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getAll(),
  });

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateBuildingInput) => buildingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.createSuccess'));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBuildingInput }) => buildingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.updateSuccess'));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => buildingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.deleteSuccess'));
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });

  // Filtered & paginated data
  const filteredBuildings = useMemo(() => {
    let result = buildings;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q));
    }

    return result;
  }, [buildings, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBuildings.length / PAGE_SIZE));
  const paginatedBuildings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBuildings.slice(start, start + PAGE_SIZE);
  }, [filteredBuildings, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Dialog handlers
  const handleOpenCreate = useCallback(() => {
    setEditingBuilding(null);
    setFormName('');
    setFormDescription('');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((building: Building) => {
    setEditingBuilding(building);
    setFormName(building.name);
    setFormDescription(building.description || '');
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const data: CreateBuildingInput = {
      name: formName,
      description: formDescription || undefined,
    };

    if (editingBuilding) {
      updateMutation.mutate({ id: editingBuilding.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingBuilding, formName, formDescription, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingBuilding) {
      deleteMutation.mutate(deletingBuilding.id);
    }
  }, [deletingBuilding, deleteMutation]);

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
          {tBreadcrumb('home')}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{t('title')}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-6" />
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t('addBuilding')}
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="pl-10" />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span>
          </div>
        ) : paginatedBuildings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">{t('noResults')}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.name')}</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('columns.description')}</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">{t('columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBuildings.map((building) => (
                  <TableRow key={building.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4 font-mono text-sm">{building.id}</TableCell>
                    <TableCell className="px-6 py-4 font-semibold">{building.name}</TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">{building.description || '-'}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(building)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingBuilding(building);
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
                {t('pagination.showing')} {(currentPage - 1) * PAGE_SIZE + 1} {t('pagination.to')} {Math.min(currentPage * PAGE_SIZE, filteredBuildings.length)} {t('pagination.of')} {filteredBuildings.length} {t('pagination.buildings')}
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
            <DialogTitle>{editingBuilding ? t('editBuilding') : t('addBuilding')}</DialogTitle>
            <DialogDescription>{editingBuilding ? t('form.update') : t('form.create')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('form.name')} <span className="text-destructive">*</span>
              </Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t('form.namePlaceholder')} />
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
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !formName}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingBuilding ? t('form.update') : t('form.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm.title')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm.description', { name: deletingBuilding?.name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('deleteConfirm.cancel')}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
