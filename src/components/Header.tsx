import { Lock, Moon, Sun } from 'lucide-react'
import { Logo } from './Logo'
import type { Theme } from '../hooks/useTheme'

export function Header({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <header className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-5 sm:px-8 sm:pt-7">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[19px] font-semibold tracking-[-0.03em]">Textport</span>
      </div>
      <div className="order-3 flex w-full items-center gap-2 text-[13px] text-muted sm:order-2 sm:w-auto">
        <Lock size={14} aria-hidden="true" className="text-accent" />
        <span>Your text never leaves your device.</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="order-2 grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:text-ink sm:order-3"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  )
}
