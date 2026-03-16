"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MonitorDot, FileText, Wrench, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService, Notification } from "@/services/notification.service";
import { toast } from "react-toastify";

export function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
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
      } catch (error) {
        toast.error("Không thể đánh dấu đã đọc");
        return; // Stop navigation if mark as read fails
      }
    }

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

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "device_report":
        return <MonitorDot className="size-5 text-orange-500" />;
      case "leave_request":
        return <FileText className="size-5 text-blue-500" />;
      case "work_order":
        return <Wrench className="size-5 text-purple-500" />;
      default:
        return <Info className="size-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + date.toLocaleDateString("vi-VN");
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("notifications") || "Thông báo"}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 border-b p-4">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer select-none items-start gap-4 border-b p-4 transition-colors hover:bg-accent/50 ${
                    !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-background p-2 shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
