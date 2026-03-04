import { NextRequest, NextResponse } from "next/server";

import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Auth routes (chưa đăng nhập mới vào được)
const AUTH_ROUTES = ["/login", "/forgot-password"];

// Protected routes (phải đăng nhập mới vào được)
const PROTECTED_ROUTES = ["/dashboard"];

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Loại bỏ locale prefix khỏi pathname (ví dụ: /vi/login → /login)
function stripLocale(pathname: string): string {
  const localePattern = /^\/(vi|en)(\/|$)/;
  return pathname.replace(localePattern, "/");
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = stripLocale(pathname);
  const accessToken = request.cookies.get("accessToken")?.value;

  // Đã đăng nhập → không cho vào trang auth (login, forgot-password)
  if (accessToken && isMatchingRoute(cleanPath, AUTH_ROUTES)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Chưa đăng nhập → không cho vào trang protected (dashboard)
  if (!accessToken && isMatchingRoute(cleanPath, PROTECTED_ROUTES)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Xử lý i18n như bình thường
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};
