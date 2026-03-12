"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

import { env } from "@/env";
import {
  adminUserService,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/services/admin-user.service";
import type { User } from "@/types/auth.types";

// ── Constants ──
const ROLES = ["admin", "manager", "teacher", "technician"] as const;
const STATUSES = ["active", "inactive", "locked"] as const;
const PAGE_SIZE = 8;

// ── Role badge colours ──
const roleBadgeClass: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-transparent",
  manager: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-transparent",
  teacher: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent",
  technician: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-transparent",
};

// ── Status dot colours ──
const statusDotClass: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-slate-300 dark:bg-slate-600",
  locked: "bg-red-500",
};
const statusTextClass: Record<string, string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  inactive: "text-slate-400 dark:text-slate-500",
  locked: "text-red-600 dark:text-red-400",
};

// ── Helpers ──
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarUrl(src?: string | null) {
  if (!src) return undefined;
  if (src.startsWith("blob:") || src.startsWith("http")) return src;
  return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
}

// ═══════════════════════════════════════════════════════════
export default function UsersPage() {
  const t = useTranslations("UserManagement");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");

  // ── Data state ──
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // ── Dialog state ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Form state ──
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<string>("teacher");
  const [formStatus, setFormStatus] = useState<string>("active");

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminUserService.getAll();
      setUsers(res.data);
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
    setMounted(true);
  }, [fetchUsers]);

  // ── Filtered & paginated data ──
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // ── Open create dialog ──
  const handleOpenCreate = useCallback(() => {
    setEditingUser(null);
    setFormFullName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("teacher");
    setFormStatus("active");
    setDialogOpen(true);
  }, []);

  // ── Open edit dialog ──
  const handleOpenEdit = useCallback((user: User) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormStatus(user.status || "active");
    setDialogOpen(true);
  }, []);

  // ── Submit create / edit ──
  const handleSubmit = useCallback(async () => {
    try {
      setFormLoading(true);

      if (editingUser) {
        // Update
        const payload: UpdateUserPayload = {};
        if (formFullName !== editingUser.fullName) payload.fullName = formFullName;
        if (formRole !== editingUser.role) payload.role = formRole as User["role"];
        if (formStatus !== (editingUser.status || "active")) payload.status = formStatus as User["status"];
        if (formPassword.trim()) payload.password = formPassword;

        if (Object.keys(payload).length === 0) {
          setDialogOpen(false);
          return;
        }

        await adminUserService.update(editingUser.id, payload);
        toast.success(t("toast.updateSuccess"));
      } else {
        // Create
        const payload: CreateUserPayload = {
          fullName: formFullName,
          email: formEmail,
          password: formPassword,
          role: formRole as User["role"],
        };
        await adminUserService.create(payload);
        toast.success(t("toast.createSuccess"));
      }

      setDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [editingUser, formFullName, formEmail, formPassword, formRole, formStatus, fetchUsers, t]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!deletingUser) return;
    try {
      setFormLoading(true);
      await adminUserService.delete(deletingUser.id);
      toast.success(t("toast.deleteSuccess"));
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setFormLoading(false);
    }
  }, [deletingUser, fetchUsers, t]);

  // ── Pagination helpers ──
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("users")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          {t("addUser")}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10"
          />
        </div>
        {mounted ? (
          <>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("allRoles")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allRoles")}</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`roles.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`statuses.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
              <span>{t("allRoles")}</span>
              <ChevronRight className="size-4 opacity-50 rotate-90" />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background w-48 h-9 text-muted-foreground opacity-50 cursor-not-allowed">
              <span>{t("allStatuses")}</span>
              <ChevronRight className="size-4 opacity-50 rotate-90" />
            </div>
          </>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            {t("noResults")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.user")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.email")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.role")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    {/* User cell */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{user.fullName}</span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>

                    {/* Role badge */}
                    <TableCell className="px-6 py-4">
                      <Badge className={roleBadgeClass[user.role] || ""}>
                        {t(`roles.${user.role}`)}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${statusTextClass[user.status || "active"]}`}>
                        <span className={`size-1.5 rounded-full ${statusDotClass[user.status || "active"]}`} />
                        {t(`statuses.${user.status || "active"}`)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingUser(user);
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
                {t("pagination.showing")} {(currentPage - 1) * PAGE_SIZE + 1}{" "}
                {t("pagination.to")}{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}{" "}
                {t("pagination.of")} {filteredUsers.length} {t("pagination.users")}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    className="h-8 min-w-8 px-3 text-xs font-semibold"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? t("editUser") : t("addUser")}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? t("description") : t("description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("form.fullName")}</Label>
              <Input
                id="fullName"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder={t("form.fullNamePlaceholder")}
              />
            </div>

            {/* Email (only for create) */}
            {!editingUser && (
              <div className="grid gap-2">
                <Label htmlFor="email">{t("form.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder={t("form.emailPlaceholder")}
                />
              </div>
            )}

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">
                {t("form.password")}
                {editingUser && (
                  <span className="text-muted-foreground font-normal ml-1 text-xs">
                    (để trống nếu không đổi)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={t("form.passwordPlaceholder")}
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label>{t("form.role")}</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`roles.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status (only for edit) */}
            {editingUser && (
              <div className="grid gap-2">
                <Label>{t("form.status")}</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectStatus")} />
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
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("form.cancel")}</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingUser ? t("form.update") : t("form.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirm.description", { name: deletingUser?.fullName || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("deleteConfirm.cancel")}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("deleteConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
