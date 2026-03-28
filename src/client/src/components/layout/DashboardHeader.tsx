"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Bell, HelpCircle, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { LOCALES, type LocaleCode } from "@/constants/i18n.constants";

import { USFlag, VietnamFlag } from "@/components/icons/flags";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { CommandSearch } from "@/components/layout/CommandSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const FlagIcon = ({ locale, className }: { locale: LocaleCode; className?: string }) => {
  if (locale === "vi") {
    return <VietnamFlag className={className} />;
  }
  return <USFlag className={className} />;
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ onMenuClick, sidebarCollapsed = false, onToggleSidebar }: DashboardHeaderProps) {
  const { setTheme } = useTheme();
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Header");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-8">
      {/* Mobile Menu Button + Search */}
      <div className="flex flex-1 items-center gap-2 lg:gap-4">
        {/* Hamburger Menu - Mobile Only */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Sidebar Toggle - Desktop Only */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-9 shrink-0 lg:flex"
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Command Search */}
        <CommandSearch />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-9 rounded-lg text-muted-foreground sm:flex"
        >
          <HelpCircle className="size-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-muted-foreground"
          onClick={() =>
            setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")
          }
        >
          <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {/* Language Selector */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3"
              >
                <FlagIcon locale={locale} className="size-4 rounded-sm sm:size-5" />
                <span className="hidden text-xs font-medium uppercase sm:inline">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => switchLocale("vi")}
                className={locale === "vi" ? "bg-accent" : ""}
              >
                <VietnamFlag className="mr-2 size-5 rounded-sm" />
                {LOCALES.vi.label}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchLocale("en")}
                className={locale === "en" ? "bg-accent" : ""}
              >
                <USFlag className="mr-2 size-5 rounded-sm" />
                {LOCALES.en.label}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 sm:gap-2 sm:px-3"
          >
            <FlagIcon locale={locale} className="size-4 rounded-sm sm:size-5" />
            <span className="hidden text-xs font-medium uppercase sm:inline">{locale}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
