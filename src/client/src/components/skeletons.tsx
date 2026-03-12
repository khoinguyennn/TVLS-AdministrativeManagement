import { Skeleton } from "@/components/ui/skeleton";

/* ─────────────── Table Skeleton ─────────────── */
export function TableSkeleton({
  columns = 4,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-6 py-4 flex gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 rounded-full" style={{ width: `${60 + ((i * 37) % 60)}px` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="px-6 py-4 flex items-center gap-6 border-t">
          {Array.from({ length: columns }).map((_, ci) => (
            <Skeleton key={ci} className="h-4 rounded-full" style={{ width: `${80 + (((ri * columns + ci) * 43) % 80)}px` }} />
          ))}
        </div>
      ))}
      {/* Pagination */}
      <div className="px-6 py-4 bg-muted/50 border-t flex items-center justify-between">
        <Skeleton className="h-3 w-40 rounded-full" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Table with Stats Skeleton ─────────────── */
export function TableWithStatsSkeleton({
  statsCount = 4,
  columns = 5,
  rows = 5,
}: {
  statsCount?: number;
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      <CardStatsSkeleton count={statsCount} />
      <TableSkeleton columns={columns} rows={rows} />
    </>
  );
}

/* ─────────────── Card Stats Skeleton ─────────────── */
export function CardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-2 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────── Detail Page Skeleton ─────────────── */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner + Avatar */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Skeleton className="h-32 w-full rounded-none" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <Skeleton className="size-24 rounded-full border-4 border-background" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      {/* Info cards */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <Skeleton className="h-5 w-40 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Form Skeleton ─────────────── */
export function FormSkeleton({
  fields = 8,
  columns = 2,
}: {
  fields?: number;
  columns?: number;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-4 w-72 rounded-full" />
      </div>
      <div className={`grid grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : ""} gap-4`}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}

/* ─────────────── Dashboard Skeleton ─────────────── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-full" />
        <Skeleton className="h-4 w-48 rounded-full" />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Profile Skeleton ─────────────── */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border shadow-sm">
        <Skeleton className="h-32 w-full rounded-t-xl" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <Skeleton className="size-32 rounded-full border-4 border-background" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-7 w-48 rounded-full" />
              <Skeleton className="h-4 w-36 rounded-full" />
            </div>
          </div>
          {/* Tabs */}
          <div className="border-b flex gap-4 mb-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded-full mb-3" />
            ))}
          </div>
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Settings Skeleton ─────────────── */
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Personal info card */}
      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      {/* Password card */}
      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Signature Skeleton ─────────────── */
export function SignatureSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        {/* Drawing area */}
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      {/* PIN section */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <Skeleton className="h-5 w-36 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Login Skeleton ─────────────── */
export function LoginSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header placeholder */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Main */}
      <main className="flex grow items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-8 space-y-6">
              {/* Title */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-7 w-56 rounded-full" />
                <Skeleton className="h-4 w-72 rounded-full" />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-44 rounded-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-32 rounded-full" />
              </div>

              {/* Submit button */}
              <Skeleton className="h-12 w-full rounded-lg" />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-3 w-48 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Google button */}
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/30 p-4 flex justify-center">
              <Skeleton className="h-3 w-52 rounded-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer placeholder */}
      <div className="flex justify-center py-4 border-t">
        <Skeleton className="h-3 w-64 rounded-full" />
      </div>
    </div>
  );
}

