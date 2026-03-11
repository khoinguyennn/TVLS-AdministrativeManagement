# Hướng dẫn sử dụng Translation cho Facilities

## Vấn đề hiện tại:
Các trang Buildings, Rooms, Devices đang hardcode text tiếng Việt, chưa sử dụng translation.

## Giải pháp:

### Bước 1: Thêm useTranslations hook

Ở đầu component, thêm:

```typescript
import { useTranslations } from 'next-intl';

export default function BuildingsPage() {
  const t = useTranslations('Facilities.buildings');
  // ... rest of code
}
```

### Bước 2: Thay thế text hardcode

**Trước:**
```typescript
toast.success('Tạo toà nhà thành công');
```

**Sau:**
```typescript
toast.success(t('toast.createSuccess'));
```

## Ví dụ đầy đủ cho Buildings Page:

```typescript
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronLeft, ChevronRight, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl'; // ← THÊM DÒNG NÀY

// ... imports khác

export default function BuildingsPage() {
  const t = useTranslations('Facilities.buildings'); // ← THÊM DÒNG NÀY
  const queryClient = useQueryClient();

  // ... state declarations

  // Mutations với translation
  const createMutation = useMutation({
    mutationFn: (data: CreateBuildingInput) => buildingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.createSuccess')); // ← THAY ĐỔI
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error')); // ← THAY ĐỔI
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBuildingInput }) => buildingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.updateSuccess')); // ← THAY ĐỔI
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error')); // ← THAY ĐỔI
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => buildingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success(t('toast.deleteSuccess')); // ← THAY ĐỔI
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toast.error')); // ← THAY ĐỔI
    },
  });

  // ... rest of code

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {t('breadcrumb.home')} {/* ← THAY ĐỔI */}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{t('title')}</span> {/* ← THAY ĐỔI */}
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-6" />
            {t('title')} {/* ← THAY ĐỔI */}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{t('description')}</p> {/* ← THAY ĐỔI */}
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t('addBuilding')} {/* ← THAY ĐỔI */}
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder={t('searchPlaceholder')} {/* ← THAY ĐỔI */}
            className="pl-10" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span> {/* ← THAY ĐỔI */}
          </div>
        ) : paginatedBuildings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">{t('noResults')}</div> {/* ← THAY ĐỔI */}
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t('columns.no')} {/* ← THAY ĐỔI */}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t('columns.name')} {/* ← THAY ĐỔI */}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t('columns.description')} {/* ← THAY ĐỔI */}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    {t('columns.actions')} {/* ← THAY ĐỔI */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              {/* ... table body */}
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t('pagination.showing')} {(currentPage - 1) * PAGE_SIZE + 1} {t('pagination.to')} {Math.min(currentPage * PAGE_SIZE, filteredBuildings.length)} {t('pagination.of')} {filteredBuildings.length} {t('pagination.buildings')}
              </p>
              {/* ... pagination buttons */}
            </div>
          </>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBuilding ? t('editBuilding') : t('addBuilding')}</DialogTitle> {/* ← THAY ĐỔI */}
            <DialogDescription>
              {editingBuilding ? t('form.updateDescription') : t('form.createDescription')} {/* ← THAY ĐỔI */}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('form.name')} <span className="text-destructive">*</span> {/* ← THAY ĐỔI */}
              </Label>
              <Input 
                id="name" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                placeholder={t('form.namePlaceholder')} {/* ← THAY ĐỔI */}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('form.description')}</Label> {/* ← THAY ĐỔI */}
              <Input 
                id="description" 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                placeholder={t('form.descriptionPlaceholder')} {/* ← THAY ĐỔI */}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('form.cancel')}</Button> {/* ← THAY ĐỔI */}
            </DialogClose>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !formName}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingBuilding ? t('form.update') : t('form.create')} {/* ← THAY ĐỔI */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm.title')}</DialogTitle> {/* ← THAY ĐỔI */}
            <DialogDescription>
              {t('deleteConfirm.description', { name: deletingBuilding?.name })} {/* ← THAY ĐỔI */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('deleteConfirm.cancel')}</Button> {/* ← THAY ĐỔI */}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('deleteConfirm.confirm')} {/* ← THAY ĐỔI */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Tương tự cho Rooms và Devices:

**Rooms:**
```typescript
const t = useTranslations('Facilities.rooms');
```

**Devices:**
```typescript
const t = useTranslations('Facilities.devices');
```

## Sau khi cập nhật:

1. Restart client: `npm run dev` trong `src/client`
2. Chuyển ngôn ngữ bằng cách click icon cờ ở góc trên
3. Text sẽ tự động chuyển đổi giữa tiếng Việt và tiếng Anh

## Lưu ý:

- Breadcrumb "Trang chủ" nên dùng `useTranslations('Breadcrumb')` và `t('home')`
- Nếu cần interpolation (như tên trong delete confirm), dùng: `t('key', { name: value })`
