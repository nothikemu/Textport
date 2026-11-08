import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Editor } from './components/Editor'
import { ExportPanel } from './components/ExportPanel'
import { Toasts } from './components/Toasts'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useTheme } from './hooks/useTheme'
import { useToasts } from './hooks/useToasts'
import { computeStats } from './lib/stats'
import { buildFilename } from './lib/filename'
import { createBlob, saveBlob } from './lib/export'
import { readFileAsText } from './lib/import'
import { SAMPLE } from './lib/sample'
import type { FormatId } from './lib/formats'

export default function App() {
  const { theme, toggle } = useTheme()
  const { toasts, push, dismiss } = useToasts()
  const [text, setText] = useState('')
  const [format, setFormat] = useState<FormatId>('docx')
  const [filename, setFilename] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)

  const deferred = useDeferredValue(text)
  const stats = useMemo(() => computeStats(deferred), [deferred])

  const latest = useRef({ text, format, filename, busy })
  latest.current = { text, format, filename, busy }

  const download = useCallback(async () => {
    const { text, format, filename, busy } = latest.current
    if (busy) return
    if (text.length === 0) {
      push({ kind: 'info', message: 'Nothing to download yet. Paste or type some text first.' })
      return
    }
    const name = buildFilename(filename, format)
    setBusy(true)
    setProgress(0)
    try {
      const blob = await createBlob(text, format, setProgress)
      saveBlob(blob, name)
      push({ kind: 'success', message: `Downloaded ${name}` })
    } catch (err) {
      console.error(err)
      push({
        kind: 'error',
        message: 'The file could not be created. Try a smaller amount of text or another format.',
      })
    } finally {
      setBusy(false)
    }
  }, [push])

  const requestClear = useCallback(() => {
    if (latest.current.text.length > 0) setConfirmClear(true)
  }, [])

  const doClear = () => {
    const previous = text
    setText('')
    setConfirmClear(false)
    push({ kind: 'info', message: 'Editor cleared.', action: { label: 'Undo', run: () => setText(previous) } })
  }

  const importFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0]
      if (!file) return
      try {
        const content = await readFileAsText(file)
        const previous = latest.current.text
        setText(content)
        if (!latest.current.filename) setFilename(file.name.replace(/\.[^.]+$/, ''))
        push({
          kind: 'success',
          message: `Imported ${file.name}`,
          action: previous ? { label: 'Undo', run: () => setText(previous) } : undefined,
        })
      } catch (err) {
        push({ kind: 'error', message: err instanceof Error ? err.message : 'That file could not be imported.' })
      }
    },
    [push],
  )

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(latest.current.text)
      push({ kind: 'success', message: 'Text copied to clipboard' })
      return true
    } catch {
      push({ kind: 'error', message: 'Copying was blocked by the browser. Select the text and copy it manually.' })
      return false
    }
  }, [push])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void download()
      } else if (mod && e.shiftKey && e.key === 'Backspace') {
        e.preventDefault()
        requestClear()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [download, requestClear])

  return (
    <div className="flex min-h-dvh flex-col">
      <Header theme={theme} onToggle={toggle} />
      <main className="mx-auto grid w-full max-w-[1280px] flex-1 content-start gap-5 px-4 pb-10 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <Editor
          text={text}
          stats={stats}
          onChange={setText}
          onImportFiles={importFiles}
          onCopy={copy}
          onClear={requestClear}
          onSample={() => setText(SAMPLE)}
        />
        <ExportPanel
          format={format}
          onFormat={setFormat}
          filename={filename}
          onFilename={setFilename}
          stats={stats}
          empty={text.length === 0}
          busy={busy}
          progress={progress}
          onDownload={download}
        />
      </main>
      <ConfirmDialog
        open={confirmClear}
        title="Clear the editor?"
        body="All text in the editor will be removed. You can undo right after."
        confirmLabel="Clear text"
        onConfirm={doClear}
        onCancel={() => setConfirmClear(false)}
      />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
