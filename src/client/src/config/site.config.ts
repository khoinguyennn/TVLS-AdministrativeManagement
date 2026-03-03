import type { SiteConfig } from "@/types/site-config.types";
import { DEFAULT_LOCALE } from "@/constants/i18n.constants";
import { env } from "@/env";

export const siteConfig: SiteConfig = {
  name: "Hệ thống Quản lý Hành chính",
  description: "Hệ thống quản lý hồ sơ hành chính cho Trường Thực hành Sư phạm",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "Trường Thực hành Sư phạm",
  locale: DEFAULT_LOCALE,
  themeColor: "#2060df",
  keywords: ["quản lý hành chính", "hồ sơ", "trường thực hành sư phạm", "administrative management"],
  social: {
    twitter: "",
    github: "khoinguyennn",
    linkedin: ""
  },
  ogImage: "/og.jpg",
  languages: {
    vi: "/vi",
    en: "/en",
    "x-default": "/vi"
  }
} as const;
