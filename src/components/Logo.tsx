export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M9 8h9l5 5v11H9z" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 19h7m0 0-2.5-2.5M20 19l-2.5 2.5" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
