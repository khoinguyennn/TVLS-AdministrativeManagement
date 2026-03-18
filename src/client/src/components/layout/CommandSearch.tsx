"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "@/i18n/navigation";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  DoorOpen,
  FileText,
  Fingerprint,
  LayoutDashboard,
  Monitor,
  Search,
  Settings,
  UserRound,
  Users
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles: string[];
  section: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  // Main
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "teacher", "technician"], section: "main" },
  { href: "/dashboard/my-profile", labelKey: "myProfile", icon: UserRound, roles: ["admin", "manager", "teacher", "technician"], section: "main" },
  { href: "/dashboard/users", labelKey: "users", icon: Users, roles: ["admin"], section: "main" },
  { href: "/dashboard/staff", labelKey: "staff", icon: FileText, roles: ["admin", "manager"], section: "main" },
  { href: "/dashboard/work-orders", labelKey: "workOrders", icon: ClipboardList, roles: ["admin", "manager", "teacher", "technician"], section: "main" },
  // Facility
  { href: "/dashboard/buildings", labelKey: "buildings", icon: Building2, roles: ["admin", "manager"], section: "facility" },
  { href: "/dashboard/rooms", labelKey: "rooms", icon: DoorOpen, roles: ["admin", "manager"], section: "facility" },
  { href: "/dashboard/devices", labelKey: "devices", icon: Monitor, roles: ["admin", "manager"], section: "facility" },
  // Statistics
  { href: "/dashboard/statistics", labelKey: "statistics", icon: BarChart3, roles: ["admin", "manager"], section: "statistics" },
  { href: "/dashboard/statistics/age", labelKey: "ageStatistics", icon: CalendarDays, roles: ["admin", "manager"], section: "statistics" },
  // Other
  { href: "/dashboard/device-reports", labelKey: "deviceReports", icon: AlertTriangle, roles: ["admin", "manager", "teacher", "technician"], section: "other" },
  { href: "/dashboard/leave-requests", labelKey: "leaveRequests", icon: CalendarOff, roles: ["admin", "manager", "teacher", "technician"], section: "other" },
  { href: "/dashboard/digital-signatures", labelKey: "digitalSignatures", icon: Fingerprint, roles: ["admin", "manager", "teacher", "technician"], section: "other" },
  // System
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings, roles: ["admin", "manager", "teacher", "technician"], section: "system" }
];

const SECTION_KEYS: Record<string, string> = {
  main: "main",
  facility: "facilitySection",
  statistics: "statisticsSection",
  other: "otherSection",
  system: "system"
};

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const t = useTranslations("Header");
  const tSidebar = useTranslations("Sidebar");
  const { user } = useAuth();
  const userRole = user?.role || "";

  // Filter items by user role
  const accessibleItems = useMemo(
    () => ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole)),
    [userRole]
  );

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return accessibleItems;
    const normalizedQuery = normalizeText(query);
    return accessibleItems.filter((item) => {
      const label = tSidebar(item.labelKey as Parameters<typeof tSidebar>[0]);
      return normalizeText(label).includes(normalizedQuery);
    });
  }, [query, accessibleItems, tSidebar]);

  // Group by section
  const groupedItems = useMemo(() => {
    const groups: { section: string; sectionLabel: string; items: NavItem[] }[] = [];
    const sectionOrder = ["main", "facility", "statistics", "other", "system"];

    for (const section of sectionOrder) {
      const items = filteredItems.filter((item) => item.section === section);
      if (items.length > 0) {
        const sectionKey = SECTION_KEYS[section];
        groups.push({
          section,
          sectionLabel: section === "main" ? "" : tSidebar(sectionKey as Parameters<typeof tSidebar>[0]),
          items
        });
      }
    }
    return groups;
  }, [filteredItems, tSidebar]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(
    () => groupedItems.flatMap((g) => g.items),
    [groupedItems]
  );

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Focus input after dialog animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter" && flatItems[activeIndex]) {
      e.preventDefault();
      handleSelect(flatItems[activeIndex].href);
    }
  };

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  let flatIndex = -1;

  return (
    <>
      {/* Desktop trigger: styled like a search input */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden w-full max-w-md cursor-pointer items-center sm:flex"
      >
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <div className="w-full rounded-lg border-none bg-muted py-2 pr-4 pl-10 text-left text-sm text-muted-foreground transition-all hover:bg-accent">
          {t("searchPlaceholder")}
        </div>
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Ctrl+K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="size-9 sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="size-5" />
      </Button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">{t("searchTitle")}</DialogTitle>

          {/* Search input */}
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("searchPlaceholder")}
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
            {flatItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("searchNoResults")}
              </p>
            ) : (
              groupedItems.map((group) => (
                <div key={group.section}>
                  {group.sectionLabel && (
                    <p className="mb-1 mt-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {group.sectionLabel}
                    </p>
                  )}
                  {group.items.map((item) => {
                    flatIndex++;
                    const currentIndex = flatIndex;
                    const Icon = item.icon;
                    const label = tSidebar(item.labelKey as Parameters<typeof tSidebar>[0]);
                    return (
                      <button
                        key={item.href}
                        type="button"
                        data-index={currentIndex}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setActiveIndex(currentIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                          currentIndex === activeIndex
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">↑↓</kbd>
                {t("searchNavigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">↵</kbd>
                {t("searchSelect")}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">Esc</kbd>
              {t("searchClose")}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
