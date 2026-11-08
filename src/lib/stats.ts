export interface TextStats {
  chars: number
  words: number
  lines: number
  bytes: number
}

/** Single pass over the text so it stays fast for multi-megabyte input. */
export function computeStats(text: string): TextStats {
  const len = text.length
  if (len === 0) return { chars: 0, words: 0, lines: 0, bytes: 0 }
  let chars = 0
  let words = 0
  let newlines = 0
  let bytes = 0
  let inWord = false
  for (let i = 0; i < len; i++) {
    const c = text.charCodeAt(i)
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < len) {
      const n = text.charCodeAt(i + 1)
      if (n >= 0xdc00 && n <= 0xdfff) {
        i++
        chars++
        bytes += 4
        if (!inWord) {
          inWord = true
          words++
        }
        continue
      }
    }
    chars++
    bytes += c < 0x80 ? 1 : c < 0x800 ? 2 : 3
    if (c === 10) newlines++
    // whitespace: ASCII, NBSP, line/paragraph separators, common unicode spaces
    const ws =
      c === 32 || (c >= 9 && c <= 13) || c === 0xa0 || c === 0x1680 || (c >= 0x2000 && c <= 0x200a) ||
      c === 0x2028 || c === 0x2029 || c === 0x202f || c === 0x205f || c === 0x3000 || c === 0xfeff
    if (ws) inWord = false
    else if (!inWord) {
      inWord = true
      words++
    }
  }
  return { chars, words, lines: newlines + 1, bytes }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB']
  let v = n / 1024
  let u = 0
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024
    u++
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[u]}`
}

/** DOCX is a zip of XML; estimate the compressed size from content. */
export function estimateDocxBytes(s: TextStats): number {
  if (s.chars === 0) return 0
  return Math.round(7000 + (s.bytes + s.lines * 110) * 0.28)
}
