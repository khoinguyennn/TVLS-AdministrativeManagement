"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, FileText, LayoutDashboard, LogOut, Settings, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");

  const mainNavItems = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard
    },
    {
      href: "/dashboard/records",
      label: t("records"),
      icon: FileText
    },
    {
      href: "/dashboard/departments",
      label: t("departments"),
      icon: Users
    },
    {
      href: "/dashboard/reports",
      label: t("reports"),
      icon: BarChart3
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900",
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
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <Image
          src="/logo-thsp.png"
          alt="Logo"
          width={40}
          height={40}
          className="size-10 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <h1 className="text-xs leading-tight font-bold whitespace-nowrap text-slate-900 uppercase dark:text-white">
            {t("systemTitle")}
          </h1>
          <p className="text-[10px] font-medium tracking-tight whitespace-nowrap text-slate-500 uppercase">
            {t("schoolName")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive(item.href)
                ? "bg-[#2060df]/10 text-[#2060df]"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* System Section */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                ? "bg-[#2060df]/10 text-[#2060df]"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-8">
            <AvatarImage src="/nice-avatar.png" alt="User avatar" />
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">Nguyễn Văn A</p>
            <p className="truncate text-[10px] text-slate-500">Administrator</p>
          </div>
          <button
            className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            aria-label={t("logout")}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
