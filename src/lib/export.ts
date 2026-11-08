import { getFormat, type FormatId } from './formats'

export const CHUNK = 4000

const yieldToBrowser = () => new Promise<void>((r) => setTimeout(r, 0))

/** Characters XML 1.0 cannot represent, plus lone surrogates. */
// eslint-disable-next-line no-control-regex
const XML_INVALID = /[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g

export const normalizeNewlines = (s: string) => s.replace(/\r\n?/g, '\n')

export function textBlob(text: string, format: 'txt' | 'md'): Blob {
  // Passed through untouched: no BOM, no newline conversion, no added formatting.
  return new Blob([text], { type: getFormat(format).mime })
}

export async function docxBlob(text: string, onProgress?: (p: number) => void): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, Tab } = await import('docx')
  const lines = normalizeNewlines(text).replace(XML_INVALID, '�').split('\n')
  const children: InstanceType<typeof Paragraph>[] = []
  const spacing = { after: 0, line: 276 }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') {
      children.push(new Paragraph({ spacing }))
    } else {
      const parts = line.split('\t')
      const runs = parts.flatMap((p, idx) => {
        const out: InstanceType<typeof TextRun>[] = []
        if (idx > 0) out.push(new TextRun({ children: [new Tab()] }))
        if (p) out.push(new TextRun({ text: p }))
        return out
      })
      children.push(new Paragraph({ spacing, children: runs }))
    }
    if (i % CHUNK === CHUNK - 1) {
      onProgress?.(i / lines.length)
      await yieldToBrowser()
    }
  }

  const doc = new Document({
    creator: 'Textport',
    title: 'Document',
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 }, paragraph: { spacing } } },
    },
    sections: [{ children }],
  })
  onProgress?.(1)
  return Packer.toBlob(doc)
}

export async function createBlob(text: string, format: FormatId, onProgress?: (p: number) => void): Promise<Blob> {
  return format === 'docx' ? docxBlob(text, onProgress) : textBlob(text, format)
}

/** Trigger a browser download, then release the object URL. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser time to start reading the blob before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 15_000)
}
