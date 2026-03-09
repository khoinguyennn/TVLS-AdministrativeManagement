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
  Users,
  X
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
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
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

  const mainNavItems = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard
    },
    {
      href: "/dashboard/users",
      label: t("users"),
      icon: Users
    },
    {
      href: "/dashboard/staff",
      label: t("staff"),
      icon: FileText
    },
    {
      href: "/dashboard/work-orders",
      label: t("workOrders"),
      icon: ClipboardList
    }
  ];

  const facilityNavItems = [
    {
      href: "/dashboard/buildings",
      label: t("buildings"),
      icon: Building2
    },
    {
      href: "/dashboard/rooms",
      label: t("rooms"),
      icon: DoorOpen
    },
    {
      href: "/dashboard/devices",
      label: t("devices"),
      icon: Monitor
    }
  ];

  const otherNavItems = [
    {
      href: "/dashboard/device-reports",
      label: t("deviceReports"),
      icon: AlertTriangle
    },
    {
      href: "/dashboard/leave-requests",
      label: t("leaveRequests"),
      icon: CalendarOff
    },
    {
      href: "/dashboard/digital-signatures",
      label: t("digitalSignatures"),
      icon: Fingerprint
    }
  ];

  const systemNavItems = [
    {
      href: "/dashboard/settings",
      label: t("settings"),
      icon: Settings
    }
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" || pathname === "/vi/dashboard" || pathname === "/en/dashboard"
      );
    }
    return pathname.includes(href);
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300",
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
        <div className="min-w-0">
          <h1 className="text-xs leading-tight font-bold whitespace-nowrap text-foreground uppercase">
            {t("systemTitle")}
          </h1>
          <p className="text-[10px] font-medium tracking-tight whitespace-nowrap text-muted-foreground uppercase">
            {t("schoolName")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Facility Section */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t("facilitySection")}
          </p>
        </div>

        {facilityNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Other Section */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t("otherSection")}
          </p>
        </div>

        {otherNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* System Section */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t("system")}
          </p>
        </div>

        {systemNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-8">
            <AvatarImage
              src={
                user?.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${user.avatar}`
                  : "/nice-avatar.png"
              }
              alt="User avatar"
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
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
