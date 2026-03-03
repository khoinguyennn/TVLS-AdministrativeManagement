import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    ...seoConfig,
    title: t('pageTitle'),
    alternates: {
      canonical: `/${locale}/login`,
      languages: siteConfig.languages
    }
  } satisfies Metadata;
}

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950">{children}</div>
  );
}
