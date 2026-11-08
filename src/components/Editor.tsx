import { useRef, useState, type DragEvent } from 'react'
import { Check, Copy, FileUp, Trash2, FileText } from 'lucide-react'
import { ACCEPT } from '../lib/import'
import { formatBytes, type TextStats } from '../lib/stats'

interface Props {
  text: string
  stats: TextStats
  onChange: (v: string) => void
  onImportFiles: (files: FileList | File[]) => void
  onCopy: () => Promise<boolean>
  onClear: () => void
  onSample: () => void
}

function ToolButton(props: {
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.shortcut ? `${props.label} (${props.shortcut})` : props.label}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      {props.children}
      <span className="hidden sm:inline">{props.label}</span>
    </button>
  )
}

export function Editor({ text, stats, onChange, onImportFiles, onCopy, onClear, onSample }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const depth = useRef(0)
  const empty = text.length === 0

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  return (
    <section
      aria-label="Text editor"
      className="relative flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-panel lg:h-[calc(100dvh-150px)] lg:min-h-[520px]"
      onDragEnter={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        depth.current++
        setDragging(true)
      }}
      onDragOver={(e) => hasFiles(e) && e.preventDefault()}
      onDragLeave={(e) => {
        if (!hasFiles(e)) return
        if (--depth.current <= 0) {
          depth.current = 0
          setDragging(false)
        }
      }}
      onDrop={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        depth.current = 0
        setDragging(false)
        if (e.dataTransfer.files.length) onImportFiles(e.dataTransfer.files)
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-2.5 py-2">
        <div className="flex items-center gap-0.5">
          <ToolButton label="Import file" onClick={() => fileRef.current?.click()}>
            <FileUp size={15} />
          </ToolButton>
          <ToolButton
            label={copied ? 'Copied' : 'Copy text'}
            disabled={empty}
            onClick={async () => {
              if (await onCopy()) {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              }
            }}
          >
            {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
          </ToolButton>
        </div>
        <ToolButton label="Clear all" shortcut="Ctrl+Shift+Backspace" disabled={empty} onClick={onClear}>
          <Trash2 size={15} />
        </ToolButton>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple={false}
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onImportFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="relative min-h-0 flex-1">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your text here..."
          aria-label="Text to convert"
          spellCheck={false}
          autoFocus
          className="editor-scroll absolute inset-0 size-full resize-none bg-transparent px-5 py-4 font-mono text-[14px] leading-[1.7] outline-none placeholder:text-muted/70 sm:px-7 sm:py-5"
        />
        {empty && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-5 text-[13px] text-muted sm:px-7">
            <span>Drop a .txt, .md or .docx file anywhere here, or</span>
            <button
              type="button"
              onClick={onSample}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface2 px-2.5 py-1 font-medium text-ink hover:border-accent"
            >
              <FileText size={14} /> Try sample text
            </button>
          </div>
        )}
        {dragging && (
          <div className="anim-fade absolute inset-3 z-10 grid place-items-center rounded-xl border-2 border-dashed border-accent bg-accentsoft/90 text-center">
            <div>
              <FileUp className="mx-auto text-accent" size={28} />
              <p className="mt-2 text-sm font-medium">Drop to import</p>
              <p className="text-xs text-muted">.txt, .md or .docx</p>
            </div>
          </div>
        )}
      </div>

      <dl
        className="grid grid-cols-4 divide-x divide-line border-t border-line text-center"
        aria-label="Live statistics"
      >
        <Stat label="Characters" value={stats.chars.toLocaleString()} />
        <Stat label="Words" value={stats.words.toLocaleString()} />
        <Stat label="Lines" value={stats.lines.toLocaleString()} />
        <Stat label="Size" value={empty ? '0 B' : formatBytes(stats.bytes)} />
      </dl>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1 py-2.5 sm:px-3">
      <dd className="font-mono text-[15px] font-medium tabular-nums tracking-tight">{value}</dd>
      <dt className="text-[11.5px] text-muted">{label}</dt>
    </div>
  )
}
