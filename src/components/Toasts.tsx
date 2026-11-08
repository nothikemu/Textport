import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ToastItem } from '../hooks/useToasts'

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }

export function Toasts({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.kind]
        return (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="anim-toast pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-2 text-sm shadow-panel"
          >
            <Icon size={17} className={t.kind === 'error' ? 'text-danger' : 'text-accent'} aria-hidden="true" />
            <span className="min-w-0 break-words">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.run()
                  onDismiss(t.id)
                }}
                className="rounded-md px-2 py-1 font-medium text-accent hover:bg-accentsoft"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="grid size-6 place-items-center rounded-md text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
