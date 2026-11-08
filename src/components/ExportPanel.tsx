import { Download, Loader2 } from 'lucide-react'
import { FORMATS, getFormat, type FormatId } from '../lib/formats'
import { buildFilename } from '../lib/filename'
import { estimateDocxBytes, formatBytes, type TextStats } from '../lib/stats'

interface Props {
  format: FormatId
  onFormat: (f: FormatId) => void
  filename: string
  onFilename: (v: string) => void
  stats: TextStats
  empty: boolean
  busy: boolean
  progress: number
  onDownload: () => void
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const MOD = isMac ? '⌘' : 'Ctrl'

export function ExportPanel({ format, onFormat, filename, onFilename, stats, empty, busy, progress, onDownload }: Props) {
  const info = getFormat(format)
  const outName = buildFilename(filename, format)
  const size = empty ? null : format === 'docx' ? `≈ ${formatBytes(estimateDocxBytes(stats))}` : formatBytes(stats.bytes)

  return (
    <section aria-label="Export" className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 shadow-panel">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold tracking-tight">Export format</legend>
        <div className="grid gap-2.5">
          {FORMATS.map((f) => {
            const selected = f.id === format
            return (
              <label
                key={f.id}
                className={`group relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-3.5 transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  selected
                    ? 'border-accent bg-accentsoft shadow-[0_0_0_1px_var(--accent)]'
                    : 'border-line hover:border-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.id}
                  checked={selected}
                  onChange={() => onFormat(f.id)}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 grid h-8 w-[46px] shrink-0 place-items-center rounded-md font-mono text-[11.5px] font-semibold tracking-tight transition-colors ${
                    selected ? 'bg-accent text-accentink' : 'bg-surface2 text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {f.label}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{f.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted">{f.description}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filename" className="mb-1.5 block text-sm font-semibold tracking-tight">
          File name
        </label>
        <div className="flex h-10 items-center rounded-lg border border-line bg-surface2 pr-3 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
          <input
            id="filename"
            value={filename}
            onChange={(e) => onFilename(e.target.value)}
            placeholder="document"
            autoComplete="off"
            maxLength={160}
            spellCheck={false}
            aria-describedby="filename-hint"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted/70"
          />
          <span className="font-mono text-sm text-muted" aria-hidden="true">{info.ext}</span>
        </div>
        <p id="filename-hint" className="mt-1.5 truncate text-xs text-muted">
          Saves as <span className="font-mono text-ink">{outName}</span>
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          aria-disabled={empty}
          className={`relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[15px] font-semibold transition-[transform,background-color,opacity] duration-150 active:scale-[0.985] ${
            empty ? 'bg-surface2 text-muted' : 'bg-accent text-accentink hover:opacity-90'
          }`}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {busy ? `Preparing ${info.label}…` : `Download ${info.label}`}
          {busy && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accentink/60 transition-transform"
              style={{ transform: `scaleX(${progress})` }}
            />
          )}
        </button>
        <p className="mt-2.5 flex items-center justify-between text-xs text-muted">
          <span>{empty ? 'Add some text to enable download.' : `Estimated size ${size}`}</span>
          <span className="hidden sm:inline">
            <kbd className="rounded border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[11px]">{MOD}</kbd>{' '}
            <kbd className="rounded border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[11px]">S</kbd>
          </span>
        </p>
      </div>
    </section>
  )
}
