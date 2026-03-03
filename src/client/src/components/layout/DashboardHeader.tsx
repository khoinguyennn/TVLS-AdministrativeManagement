'use client';

import { Bell, HelpCircle, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { USFlag, VietnamFlag } from '@/components/icons/flags';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LOCALES, type LocaleCode } from '@/constants/i18n.constants';

const FlagIcon = ({ locale, className }: { locale: LocaleCode; className?: string }) => {
  if (locale === 'vi') {
    return <VietnamFlag className={className} />;
  }
  return <USFlag className={className} />;
};

export function DashboardHeader() {
  const { setTheme } = useTheme();
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header');

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#2060df]/20 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-slate-600 dark:text-slate-400"
        >
          <Bell className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-slate-600 dark:text-slate-400"
        >
          <HelpCircle className="size-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-slate-600 dark:text-slate-400"
          onClick={() => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleTheme')}</span>
        </Button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            >
              <FlagIcon locale={locale} className="size-5 rounded-sm" />
              <span className="text-xs font-medium uppercase">{locale}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => switchLocale('vi')}
              className={locale === 'vi' ? 'bg-slate-100 dark:bg-slate-800' : ''}
            >
              <VietnamFlag className="size-5 rounded-sm mr-2" />
              {LOCALES.vi.label}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLocale('en')}
              className={locale === 'en' ? 'bg-slate-100 dark:bg-slate-800' : ''}
            >
              <USFlag className="size-5 rounded-sm mr-2" />
              {LOCALES.en.label}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
