# Textport

Paste text, pick TXT, DOCX or Markdown, download. Everything runs in your browser: no backend, no analytics, no storage of your text.

```bash
npm install
npm run dev      # development
npm run build    # typecheck + production build
npm test         # filename, stats and export tests
```

- **Stack:** React, TypeScript, Vite, Tailwind CSS 4, Lucide, `docx` (lazy-loaded).
- **Shortcuts:** `Ctrl/⌘ + S` download, `Ctrl/⌘ + Shift + Backspace` clear (with confirmation and undo).
- **Import:** drop or choose `.txt`, `.md` or `.docx`.
- **Privacy:** a strict Content-Security-Policy blocks all outside connections; fonts are bundled. Only the theme preference is saved locally.
