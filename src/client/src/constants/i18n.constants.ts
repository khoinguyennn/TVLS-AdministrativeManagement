// Supported locales: Vietnamese and English
export const LOCALES = {
  vi: { label: "Tiếng Việt", tag: "vi-VN", flag: "��" },
  en: { label: "English", tag: "en-US", flag: "��" }
} as const;

export type LocaleCode = keyof typeof LOCALES;

// Default locale is Vietnamese
export const DEFAULT_LOCALE: LocaleCode = "vi";

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[];

export const LOCALE_TAGS = Object.fromEntries(
  SUPPORTED_LOCALES.map((code) => [code, LOCALES[code].tag])
) as Record<LocaleCode, string>;
