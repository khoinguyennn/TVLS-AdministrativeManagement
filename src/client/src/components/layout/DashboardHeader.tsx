"use client";

import { usePathname, useRouter } from "next/navigation";

import { Bell, HelpCircle, Menu, Moon, Search, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { LOCALES, type LocaleCode } from "@/constants/i18n.constants";

import { USFlag, VietnamFlag } from "@/components/icons/flags";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const FlagIcon = ({ locale, className }: { locale: LocaleCode; className?: string }) => {
  if (locale === "vi") {
    return <VietnamFlag className={className} />;
  }
  return <USFlag className={className} />;
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { setTheme } = useTheme();
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Header");

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8 dark:border-slate-800 dark:bg-slate-900/80">
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

        {/* Search */}
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border-none bg-slate-100 py-2 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-[#2060df]/20 dark:bg-slate-800"
          />
        </div>

        {/* Mobile Search Icon */}
        <Button variant="ghost" size="icon" className="size-9 sm:hidden">
          <Search className="size-5" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-9 rounded-lg text-slate-600 sm:flex dark:text-slate-400"
        >
          <Bell className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-9 rounded-lg text-slate-600 sm:flex dark:text-slate-400"
        >
          <HelpCircle className="size-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-slate-600 dark:text-slate-400"
          onClick={() =>
            setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")
          }
        >
          <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-800" />

        {/* Language Selector */}
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
              className={locale === "vi" ? "bg-slate-100 dark:bg-slate-800" : ""}
            >
              <VietnamFlag className="mr-2 size-5 rounded-sm" />
              {LOCALES.vi.label}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLocale("en")}
              className={locale === "en" ? "bg-slate-100 dark:bg-slate-800" : ""}
            >
              <USFlag className="mr-2 size-5 rounded-sm" />
              {LOCALES.en.label}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
