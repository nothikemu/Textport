import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function initial(): Theme {
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="color-scheme"]')
    meta?.setAttribute('content', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('textport-theme', next) // only the preference, never content
      } catch { /* storage unavailable */ }
      return next
    })
  }, [])

  return { theme, toggle }
}
