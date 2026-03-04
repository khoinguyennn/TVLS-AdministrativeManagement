"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { User } from "@/types/auth.types";

const ROLE_LABELS: Record<User["role"], string> = {
  admin: "Quản trị viên",
  manager: "Ban Giám hiệu",
  teacher: "Giáo viên",
  technician: "Kỹ thuật viên"
};

type AuthUser = Pick<User, "id" | "email" | "fullName" | "role" | "avatar"> | null;

// Cache the snapshot so useSyncExternalStore gets a stable reference
let cachedUser: AuthUser = null;
let cachedRaw: string | null = null;

function getClientSnapshot(): AuthUser {
  const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? JSON.parse(raw) : null;
  }
  return cachedUser;
}

function getServerSnapshot(): AuthUser {
  return null;
}

const emptySubscribe = () => () => {};

export function useAuth() {
  const user = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

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
