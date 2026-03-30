import Link from "next/link";
import { ArrowLeft, FileText, Shield, BookOpen, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("Pages");
  const s = useTranslations("Pages.Terms");

  const sections = [
    { num: "01", title: s("s01Title"), content: s("s01Content"), items: null },
    { num: "02", title: s("s02Title"), content: null, items: [s("s02i1"), s("s02i2"), s("s02i3")] },
    { num: "03", title: s("s03Title"), content: null, items: [s("s03i1"), s("s03i2"), s("s03i3"), s("s03i4")] },
    { num: "04", title: s("s04Title"), content: s("s04Content"), items: null },
    { num: "05", title: s("s05Title"), content: s("s05Content"), items: null },
    { num: "06", title: s("s06Title"), content: s("s06Content"), items: null },
    { num: "07", title: s("s07Title"), content: s("s07Content"), items: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{t("schoolName")}</span>
            <ChevronRight className="size-3.5" />
            <span>{s("breadcrumb")}</span>
          </div>
          <Link href="/login" className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
            <ArrowLeft className="size-3.5" />
            {t("login")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <FileText className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{s("title")}</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{s("subtitle")}</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 px-6 py-4 text-sm leading-relaxed text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
          {s("intro")}
        </div>

        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.num} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{sec.num}</span>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{sec.title}</h2>
              </div>
              {sec.content && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{sec.content}</p>}
              {sec.items && (
                <ul className="space-y-2">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />{item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs text-slate-400">{t("copyright")}</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
              <Shield className="size-3.5" /> {s("linkPrivacy")}
            </Link>
            <Link href="/guide" className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
              <BookOpen className="size-3.5" /> {s("linkGuide")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
