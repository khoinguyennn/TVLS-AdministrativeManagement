"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { User } from "@/types/auth.types";
import { subscribeUserChange } from "@/lib/auth-storage";

const ROLE_LABELS: Record<User["role"], string> = {
  admin: "Quản trị viên",
  manager: "Ban Giám hiệu",
  teacher: "Giáo viên",
  technician: "Kỹ thuật viên"
};

type AuthUser = Pick<User, "id" | "email" | "fullName" | "role" | "avatar"> | null;

// Cache so useSyncExternalStore gets a stable reference
let cachedRaw: string | null = null;
let cachedUser: AuthUser = null;

// Snapshot for client - reads localStorage with caching
function getClientSnapshot(): AuthUser {
  const raw = localStorage.getItem("user");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? JSON.parse(raw) : null;
  }
  return cachedUser;
}

// Snapshot for server - no localStorage available
function getServerSnapshot(): AuthUser {
  return null;
}

// Subscribe to both custom events (same tab) and native storage events (cross-tab)
function subscribe(callback: () => void) {
  const unsubscribeCustom = subscribeUserChange(callback);
  window.addEventListener("storage", callback);
  return () => {
    unsubscribeCustom();
    window.removeEventListener("storage", callback);
  };
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const getRoleLabel = useCallback(() => {
    if (!user) return "";
    return ROLE_LABELS[user.role] || user.role;
  }, [user]);

  const getInitials = useCallback(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  const isLoggedIn = !!user;

  return { user, isLoggedIn, getRoleLabel, getInitials };
}
