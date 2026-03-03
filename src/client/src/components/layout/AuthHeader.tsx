import Image from "next/image";

export function AuthHeader() {
  return (
    <header className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden sm:size-12">
            <Image
              src="/logothsp.png"
              alt="Trường Thực hành Sư phạm Logo"
              width={48}
              height={48}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <h1 className="text-sm leading-tight font-bold tracking-wide text-[#2060df] uppercase sm:text-lg">
              Hệ thống Quản lý Hành chính
            </h1>
            <h2 className="text-xs font-semibold text-slate-600 uppercase sm:text-sm dark:text-slate-400">
              Trường Thực hành Sư phạm
            </h2>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="text-xs text-slate-400 italic">Cổng thông tin nội bộ</span>
        </div>
      </div>
    </header>
  );
}
