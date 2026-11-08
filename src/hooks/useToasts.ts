import { useCallback, useRef, useState } from 'react'

export interface ToastItem {
  id: number
  kind: 'success' | 'error' | 'info'
  message: string
  action?: { label: string; run: () => void }
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>, ms = 4500) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-2), { ...toast, id }])
      window.setTimeout(() => dismiss(id), toast.action ? ms + 3000 : ms)
    },
    [dismiss],
  )

  return { toasts, push, dismiss }
}
