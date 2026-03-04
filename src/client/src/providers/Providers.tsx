"use client";

import { type AbstractIntlMessages } from "next-intl";

import {
  GoogleAuthProvider,
  IntlProvider,
  QueryProvider,
  ThemeProvider,
  ToastProvider
} from "@/providers";

export function Providers({
  children,
  messages,
  locale
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale?: string;
}) {
  return (
    <ThemeProvider>
      <GoogleAuthProvider>
        <IntlProvider messages={messages} locale={locale}>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </IntlProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}
