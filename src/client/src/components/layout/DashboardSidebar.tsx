"use client";

import { useState } from "react";

import Image from "next/image";
import { usePathname, useRouter, Link } from "@/i18n/navigation";

import {
  AlertTriangle,
  Building2,
  CalendarOff,
  ClipboardList,
  DoorOpen,
  FileText,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  UserRound,
  Users,
  BarChart3,
  CalendarDays,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/env";
import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth.service";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose, collapsed = false, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Sidebar");
  const { user, getRoleLabel, getInitials } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      authStorage.clearAll();
      toast.success("Đăng xuất thành công!");
      router.push("/login");
    } catch {
      // authService.logout đã gọi authStorage.clearAll() trong finally
      toast.success("Đã đăng xuất");
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const userRole = user?.role || "";

  const mainNavItems = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      roles: ["admin", "manager", "teacher", "technician"]
    },
    {
      href: "/dashboard/my-profile",
      label: t("myProfile"),
      icon: UserRound,
      roles: ["admin", "manager", "teacher", "technician"]
    },
    {
      href: "/dashboard/users",
      label: t("users"),
      icon: Users,
      roles: ["admin"]
    },
    {
      href: "/dashboard/staff",
      label: t("staff"),
      icon: FileText,
      roles: ["admin", "manager"]
    },
    {
      href: "/dashboard/work-orders",
      label: t("workOrders"),
      icon: ClipboardList,
      roles: ["admin", "manager", "teacher", "technician"]
    }
  ].filter(item => item.roles.includes(userRole));

  const statisticsNavItems = [
    {
      href: "/dashboard/statistics",
      label: t("statistics"),
      icon: BarChart3,
      roles: ["admin", "manager"]
    },
    {
      href: "/dashboard/statistics/age",
      label: t("ageStatistics"),
      icon: CalendarDays,
      roles: ["admin", "manager"]
    }
  ].filter(item => item.roles.includes(userRole));

  const facilityNavItems = [
    {
      href: "/dashboard/buildings",
      label: t("buildings"),
      icon: Building2,
      roles: ["admin", "manager"]
    },
    {
      href: "/dashboard/rooms",
      label: t("rooms"),
      icon: DoorOpen,
      roles: ["admin", "manager"]
    },
    {
      href: "/dashboard/devices",
      label: t("devices"),
      icon: Monitor,
      roles: ["admin", "manager"]
    }
  ].filter(item => item.roles.includes(userRole));

  const otherNavItems = [
    {
      href: "/dashboard/device-reports",
      label: t("deviceReports"),
      icon: AlertTriangle,
      roles: ["admin", "manager", "teacher", "technician"]
    },
    {
      href: "/dashboard/leave-requests",
      label: t("leaveRequests"),
      icon: CalendarOff,
      roles: ["admin", "manager", "teacher", "technician"]
    },
    {
      href: "/dashboard/digital-signatures",
      label: t("digitalSignatures"),
      icon: Fingerprint,
      roles: ["admin", "manager", "teacher", "technician"]
    }
  ].filter(item => item.roles.includes(userRole));

  const systemNavItems = [
    {
      href: "/dashboard/settings",
      label: t("settings"),
      icon: Settings,
      roles: ["admin", "manager", "teacher", "technician"]
    }
  ].filter(item => item.roles.includes(userRole));

  const isActive = (href: string) => {
    // Strip locale prefix (/vi or /en) for comparison
    const cleanPath = pathname.replace(/^\/(vi|en)/, "");
    return cleanPath === href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
          // Width based on collapsed state
          collapsed ? "lg:w-[72px]" : "w-64",
          // Mobile: hidden by default, slide in when open
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 size-8 lg:hidden"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>

        {/* Logo Section */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Image
            src="/logo-thsp.png"
            alt="Logo"
            width={40}
            height={40}
            className="size-10 shrink-0 object-contain"
          />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-xs leading-tight font-bold whitespace-nowrap text-foreground uppercase">
                {t("systemTitle")}
              </h1>
              <p className="text-[10px] font-medium tracking-tight whitespace-nowrap text-muted-foreground uppercase">
                {t("schoolName")}
              </p>
            </div>
          )}
        </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4 scrollbar-hide", collapsed ? "px-2" : "px-4")}>
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              collapsed && "justify-center px-2",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}

        {/* Facility Section */}
        {facilityNavItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t("facilitySection")}
                </p>
              )}
              {collapsed && <div className="mx-auto h-px w-8 bg-border" />}
            </div>

            {facilityNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  collapsed && "justify-center px-2",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </>
        )}

        {/* Statistics Section */}
        {statisticsNavItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t("statisticsSection")}
                </p>
              )}
              {collapsed && <div className="mx-auto h-px w-8 bg-border" />}
            </div>

            {statisticsNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  collapsed && "justify-center px-2",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </>
        )}

        {/* Other Section */}
        <div className="pt-4 pb-2">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {t("otherSection")}
            </p>
          )}
          {collapsed && <div className="mx-auto h-px w-8 bg-border" />}
        </div>

        {otherNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              collapsed && "justify-center px-2",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}

        {/* System Section */}
        <div className="pt-4 pb-2">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {t("system")}
            </p>
          )}
          {collapsed && <div className="mx-auto h-px w-8 bg-border" />}
        </div>

        {systemNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              collapsed && "justify-center px-2",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
          <Avatar className="size-8 shrink-0">
            <AvatarImage
              src={
                user?.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${user.avatar}`
                  : undefined
              }
              alt="User avatar"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.fullName || "Người dùng"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{getRoleLabel()}</p>
              </div>
              <button
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t("logout")}
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </aside>
    </>
  );
}
