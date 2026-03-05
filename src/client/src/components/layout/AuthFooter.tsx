import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white px-4 py-6 sm:py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center text-sm text-slate-500 md:text-left dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            © 2025 TRƯỜNG THỰC HÀNH SƯ PHẠM
          </p>
          <p className="text-slate-500 dark:text-slate-400">TRƯỜNG ĐẠI HỌC TRÀ VINH</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/terms"
            className="text-xs font-medium text-slate-500 transition-colors sm:text-sm hover:text-primary dark:text-slate-400"
          >
            Điều khoản sử dụng
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-medium text-slate-500 transition-colors sm:text-sm hover:text-primary dark:text-slate-400"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="/guide"
            className="text-xs font-medium text-slate-500 transition-colors sm:text-sm hover:text-primary dark:text-slate-400"
          >
            Hướng dẫn
          </Link>
        </div>
      </div>
    </footer>
  );
}
