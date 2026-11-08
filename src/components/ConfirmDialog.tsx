import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => e.target === ref.current && onCancel()}
      aria-labelledby="confirm-title"
      className="anim-pop m-auto w-[min(92vw,400px)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-line px-4 text-sm font-medium hover:bg-surface2"
          >
            Keep text
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="h-9 rounded-lg bg-danger px-4 text-sm font-medium text-white dark:text-[#1a0a07]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
