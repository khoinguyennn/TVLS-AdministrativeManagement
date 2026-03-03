'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardSidebar() {
  const pathname = usePathname();
  const t = useTranslations('Sidebar');

  const mainNavItems = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/records',
      label: t('records'),
      icon: FileText,
    },
    {
      href: '/dashboard/departments',
      label: t('departments'),
      icon: Users,
    },
    {
      href: '/dashboard/reports',
      label: t('reports'),
      icon: BarChart3,
    },
  ];

  const systemNavItems = [
    {
      href: '/dashboard/settings',
      label: t('settings'),
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/vi/dashboard' || pathname === '/en/dashboard';
    }
    return pathname.includes(href);
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed inset-y-0 left-0 z-50">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <Image
          src="/logo-thsp.png"
          alt="Logo"
          width={40}
          height={40}
          className="size-10 object-contain shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-xs font-bold leading-tight text-slate-900 dark:text-white uppercase whitespace-nowrap">
            {t('systemTitle')}
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight whitespace-nowrap">
            {t('schoolName')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-[#2060df]/10 text-[#2060df]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* System Section */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('system')}
          </p>
        </div>

        {systemNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-[#2060df]/10 text-[#2060df]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-8">
            <AvatarImage src="/nice-avatar.png" alt="User avatar" />
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Nguyễn Văn A</p>
            <p className="text-[10px] text-slate-500 truncate">Administrator</p>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={t('logout')}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
