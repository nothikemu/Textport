import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { buildFilename, sanitizeBaseName } from './filename'
import { computeStats, estimateDocxBytes } from './stats'
import { docxBlob, textBlob } from './export'

describe('filenames', () => {
  it('appends the right extension', () => {
    expect(buildFilename('notes', 'txt')).toBe('notes.txt')
    expect(buildFilename('notes', 'docx')).toBe('notes.docx')
    expect(buildFilename('notes', 'md')).toBe('notes.md')
  })
  it('replaces a typed extension instead of doubling it', () => {
    expect(buildFilename('notes.md', 'txt')).toBe('notes.txt')
    expect(buildFilename('report.DOCX', 'docx')).toBe('report.docx')
    expect(buildFilename('a.txt.md', 'md')).toBe('a.md')
    expect(buildFilename('v1.2 draft', 'md')).toBe('v1.2 draft.md')
  })
  it('strips illegal characters and falls back to a default', () => {
    expect(sanitizeBaseName('a/b\\c:d*e?f"g<h>i|j')).toBe('a b c d e f g h i j')
    expect(buildFilename('', 'txt')).toBe('document.txt')
    expect(buildFilename('   ...  ', 'md')).toBe('document.md')
    expect(buildFilename('CON', 'txt')).toBe('CON_.txt')
    expect(buildFilename('x'.repeat(500), 'txt').length).toBeLessThanOrEqual(124)
  })
})

describe('stats', () => {
  it('counts', () => {
    expect(computeStats('')).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 })
    expect(computeStats('hello world\nfoo')).toEqual({ chars: 15, words: 3, lines: 2, bytes: 15 })
    expect(computeStats('a\r\nb')).toMatchObject({ lines: 2, words: 2 })
  })
  it('handles unicode and emoji', () => {
    const s = computeStats('héllo 🚀 日本')
    expect(s.chars).toBe(10)
    expect(s.words).toBe(3)
    expect(s.bytes).toBe(new TextEncoder().encode('héllo 🚀 日本').length)
  })
  it('estimates docx size', () => expect(estimateDocxBytes(computeStats('hi'))).toBeGreaterThan(0))
})

describe('exports', () => {
  it('txt and md preserve text exactly', async () => {
    const t = '# Not changed\r\n\ttabbed  spaces\n\n\n🚀 émoji'
    for (const f of ['txt', 'md'] as const) {
      const blob = textBlob(t, f)
      expect(await blob.text()).toBe(t)
      expect(new Uint8Array(await blob.arrayBuffer())[0]).not.toBe(0xef) // no BOM
    }
  })
  it('docx is a valid package with preserved paragraphs', async () => {
    const t = 'one\n\ntwo & <three>\r\nta\tb\u0000 🚀 日本語\n'
    const blob = await docxBlob(t)
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(Object.keys(zip.files)).toEqual(expect.arrayContaining(['[Content_Types].xml', '_rels/.rels', 'word/document.xml']))
    const xml = await zip.file('word/document.xml')!.async('string')
    expect((xml.match(/<w:p[ >]/g) ?? []).length).toBe(5)
    expect(xml).toContain('two &amp; &lt;three&gt;')
    expect(xml).toContain('🚀 日本語')
    expect(xml).toContain('<w:tab/>')
    // eslint-disable-next-line no-control-regex
    expect(xml).not.toMatch(/[\u0000-\u0008]/)
  })
  it('handles very large input', async () => {
    let seed = 7
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
    const vocab = Array.from({ length: 3000 }, () => Array.from({ length: 3 + Math.floor(rnd() * 8) }, () => String.fromCharCode(97 + Math.floor(rnd() * 26))).join(''))
    const big = Array.from({ length: 100_000 }, () => Array.from({ length: 8 }, () => vocab[Math.floor(rnd() * 3000)]).join(' ')).join('\n') // ~5 MB, 100k paragraphs
    const blob = await docxBlob(big)
    expect(blob.size).toBeGreaterThan(10_000)
    const est = estimateDocxBytes(computeStats(big))
    expect(est / blob.size).toBeGreaterThan(0.5)
    expect(est / blob.size).toBeLessThan(2)
    console.log('big docx', blob.size, 'est', est)
  }, 60_000)
})
