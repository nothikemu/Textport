import { getFormat, type FormatId } from './formats'

export const DEFAULT_BASENAME = 'document'
const MAX_BASENAME = 120
const KNOWN_EXT = /\.(txt|text|md|markdown|docx|doc)$/i
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i

/** Turn whatever the user typed into a safe base name (no extension). Returns '' if nothing usable. */
export function sanitizeBaseName(input: string): string {
  let name = input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // drop an extension the user typed themselves; the chosen format decides the real one
  while (KNOWN_EXT.test(name)) name = name.replace(KNOWN_EXT, '').trim()
  name = name.replace(/^\.+/, '').replace(/[. ]+$/, '')
  if (name.length > MAX_BASENAME) name = Array.from(name).slice(0, MAX_BASENAME).join('').trim()
  if (RESERVED.test(name)) name = `${name}_`
  return name
}

export function buildFilename(input: string, format: FormatId): string {
  const base = sanitizeBaseName(input) || DEFAULT_BASENAME
  return base + getFormat(format).ext
}
