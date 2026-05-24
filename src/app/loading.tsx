export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-xl font-bold text-white shadow-md">
          I
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#c9a227] dark:border-zinc-700 dark:border-t-[#d4af37]" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    </div>
  );
}
