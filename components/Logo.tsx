export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative grid place-items-center rounded-2xl bg-gradient-to-br from-violet-400 via-violet-600 to-ink-800 shadow-[0_8px_28px_-10px_rgba(143,87,247,0.9)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.5 7.2A8.5 8.5 0 1 0 20.5 16.8" />
        <path d="M13.4 12.2a2.6 2.6 0 1 0 0-1.2" opacity=".85" />
      </svg>
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-baseline gap-[3px] font-[family-name:var(--font-display)] tracking-tight">
      <span className="text-[19px] font-bold text-violet-50">CStore</span>
      {!compact && (
        <span className="hidden text-[13px] font-medium text-violet-400/70 sm:inline">
          / CremnityStore
        </span>
      )}
    </span>
  );
}
