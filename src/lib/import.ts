const TEXT_EXT = /\.(txt|text|md|markdown)$/i
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

export const ACCEPT = '.txt,.md,.markdown,.docx,text/plain,text/markdown'

export function isSupportedFile(file: File): boolean {
  return TEXT_EXT.test(file.name) || /\.docx$/i.test(file.name) || file.type.startsWith('text/')
}

function walk(node: Node, out: string[]): void {
  for (let n = node.firstChild; n; n = n.nextSibling) {
    if (n.nodeType !== 1) continue
    const el = n as Element
    if (el.namespaceURI !== W) {
      walk(el, out)
      continue
    }
    switch (el.localName) {
      case 't':
        out.push(el.textContent ?? '')
        break
      case 'tab':
        out.push('\t')
        break
      case 'br':
      case 'cr':
        out.push('\n')
        break
      case 'p':
        // nested paragraphs (text boxes) are flattened onto their own lines
        walk(el, out)
        out.push('\u0001')
        break
      default:
        walk(el, out)
    }
  }
}

/** Pull paragraphs out of a .docx (a zip containing word/document.xml). */
export async function docxToText(buffer: ArrayBuffer): Promise<string> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('This file is not a valid Word document.')
  const xml = await entry.async('string')
  const dom = new DOMParser().parseFromString(xml, 'application/xml')
  if (dom.getElementsByTagName('parsererror').length) throw new Error('This Word document could not be read.')
  const parts: string[] = []
  walk(dom.documentElement, parts)
  return parts.join('').split('\u0001').join('\n').replace(/\n$/, '')
}

export async function readFileAsText(file: File): Promise<string> {
  if (/\.docx$/i.test(file.name)) return docxToText(await file.arrayBuffer())
  if (!isSupportedFile(file)) throw new Error('Only .txt, .md and .docx files can be imported.')
  return file.text()
}
