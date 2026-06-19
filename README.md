# Temporary Dictate Notes
https://erdisayar.github.io/dictate_write/

A comfortable writing space for revising dictated text and writing with LaTeX.

## Features

- **LaTeX rendering** with KaTeX (inline `$...$`, display `\[...\]`, `align`, `itemize`, etc.)
- **Live preview** as you type
- **Keystroke sounds** — 7 styles (mechanical, typewriter, soft click, bubble, marble, chime, piano)
- **Vim & Emacs keybindings** alongside the default mode
- **Multiple editor fonts** and text sizes
- **Light / dark themes**
- **Export** to `.tex`, `.html`, `.pdf`, PNG, and SVG
- **Auto-save** to localStorage

## New — productivity features for post-dictation editing

### Find & Replace (`Ctrl+F` / `Ctrl+H`)
Fix repeated dictation mistakes across the whole document at once.
- `Enter` / `Shift+Enter` — jump to next / previous match
- `Esc` — close the panel
- Options: case-sensitive (`Aa`), whole word (`W`), regex (`.*`)
- Match highlights appear directly in the editor
- **Replace All** fixes every occurrence in one click

### Read Aloud (`Ctrl+R`)
Hear your text spoken back to catch errors your eyes miss — especially
useful when revising dictated text. Each word is highlighted in the
preview as it is read. Press `Ctrl+R` again to stop.

### Synonym Lookup (double-click any word)
Double-click any word in the editor to see synonyms and related words
(powered by the free Datamuse API). Click a synonym to instantly replace
the word — handy for non-native speakers refining their phrasing.

### Keyboard Shortcuts Help (`Ctrl+/`)
A cheatsheet overlay listing every shortcut, grouped by category.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Render note |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find & Replace |
| `Ctrl+R` | Read aloud / stop |
| `Ctrl+/` | Show shortcuts help |
| `Ctrl+E` | Toggle focus mode |
| `Ctrl+B` | Bold (`\textbf`) |
| `Ctrl+I` | Italic (`\textit`) |
| `Alt+B` / `Alt+F` | Move back / forward one word |
| `Alt+Backspace` | Delete previous word |
| `Double-click` | Look up synonyms |

