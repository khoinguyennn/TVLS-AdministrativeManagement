"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FileText, MonitorDot, Wrench, Info, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService, Notification } from "@/services/notification.service";
import { toast } from "react-toastify";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 1 minute
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        toast.error("Không thể đánh dấu đã đọc");
        return; // Stop navigation if mark as read fails
      }
    }

    setIsOpen(false);

    // Navigate based on type
    if (notification.referenceId) {
      switch (notification.type) {
        case "device_report":
          router.push(`/dashboard/device-reports`);
          break;
        case "leave_request":
          router.push(`/dashboard/leave-requests`);
          break;
        case "work_order":
          router.push(`/dashboard/work-orders/${notification.referenceId}`);
          break;
        default:
          break;
      }
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "device_report":
        return <MonitorDot className="size-4 text-orange-500" />;
      case "leave_request":
        return <FileText className="size-4 text-blue-500" />;
      case "work_order":
        return <Wrench className="size-4 text-purple-500" />;
      default:
        return <Info className="size-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + date.toLocaleDateString("vi-VN");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 rounded-lg text-muted-foreground">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-destructive"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold">{t("notifications") || "Thông báo"}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
              <Check className="mr-1 size-3" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-none border-b p-4 focus:bg-accent ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="mt-1 shrink-0 rounded-full bg-background p-1.5 shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">{notification.title}</span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-auto mt-2 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
