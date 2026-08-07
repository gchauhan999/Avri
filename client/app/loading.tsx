/** Route-level loading state, shown while a page segment streams in. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24">
      <div
        role="status"
        aria-label="Loading"
        className="h-11 w-11 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500"
      />
      <p className="text-sm font-medium text-ink-400">Loading…</p>
    </div>
  );
}
