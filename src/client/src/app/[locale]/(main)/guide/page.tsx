import Link from "next/link";
import { ArrowLeft, BookOpen, Shield, FileText, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GuidePage() {
  const t = useTranslations("Pages");
  const g = useTranslations("Pages.Guide");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{t("schoolName")}</span>
            <ChevronRight className="size-3.5" />
            <span>{g("breadcrumb")}</span>
          </div>
          <Link href="/login" className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
            <ArrowLeft className="size-3.5" />
            {t("login")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 shadow-sm dark:text-violet-400">
            <BookOpen className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{g("title")}</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{g("subtitle")}</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-violet-100 bg-violet-50/60 px-6 py-4 text-sm leading-relaxed text-slate-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-slate-300">
          {g("intro")}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">01</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s01Title")}</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{g("s01Intro")}</p>
            <ul className="space-y-2">
              {[g("s01i1"), g("s01i2"), g("s01i3")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">02</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s02Title")}</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{g("s02Intro")}</p>
            <ul className="space-y-2">
              {[g("s02i1"), g("s02i2"), g("s02i3")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">03</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s03Title")}</h2>
            </div>
            <ul className="space-y-2">
              {[g("s03i1"), g("s03i2"), g("s03i3"), g("s03i4")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">04</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s04Title")}</h2>
            </div>
            <ul className="space-y-2">
              {[g("s04i1"), g("s04i2"), g("s04i3"), g("s04i4")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">05</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s05Title")}</h2>
            </div>
            <ul className="space-y-2">
              {[g("s05i1"), g("s05i2"), g("s05i3"), g("s05i4")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">06</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s06Title")}</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{g("s06Intro")}</p>
            <ul className="space-y-2">
              {[g("s06i1"), g("s06i2"), g("s06i3"), g("s06i4"), g("s06i5")].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500/60" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">07</span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{g("s07Title")}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{g("s07Intro")}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs text-slate-400">{t("copyright")}</p>
          <div className="flex gap-4 text-sm">
            <Link href="/terms" className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
              <FileText className="size-3.5" /> {g("linkTerms")}
            </Link>
            <Link href="/privacy" className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
              <Shield className="size-3.5" /> {g("linkPrivacy")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
