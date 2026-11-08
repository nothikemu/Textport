export type FormatId = 'txt' | 'docx' | 'md'

export interface FormatInfo {
  id: FormatId
  label: string
  name: string
  description: string
  ext: string
  mime: string
}

export const FORMATS: readonly FormatInfo[] = [
  {
    id: 'txt',
    label: 'TXT',
    name: 'Plain text',
    description: 'Your text exactly as written. Opens anywhere.',
    ext: '.txt',
    mime: 'text/plain;charset=utf-8',
  },
  {
    id: 'docx',
    label: 'DOCX',
    name: 'Microsoft Word',
    description: 'A real Word document for Word, Google Docs and Pages.',
    ext: '.docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: 'md',
    label: 'MD',
    name: 'Markdown',
    description: 'Saved untouched, so your own Markdown stays intact.',
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
  },
]

export const getFormat = (id: FormatId): FormatInfo => FORMATS.find((f) => f.id === id)!
