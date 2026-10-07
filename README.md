# DictateWrite ✍️📐📂

> **A multi-topic scratchpad and LaTeX writing studio for post-dictation editing and mathematical notation.**

Live GitHub Pages: [https://erdisayar.github.io/dictate_write/](https://erdisayar.github.io/dictate_write/)

---

## 🌟 Key Features

### 1. 🗂️ Browser-Style Multi-Topic Tabs
- **Work on Multiple Topics at Once**: Open independent tabs directly inside a single browser window.
- **One-Click Tab Switching**: Jump between topics instantly without losing your text, cursor position, or preview state.
- **Persistent Local Storage**: All open tabs and notes are automatically preserved across browser sessions.
- **Topic Tab Actions**: Add new tabs (**`Ctrl+Alt+T`**), close tabs (**`Ctrl+Alt+W`**), and duplicate tabs with 1 click.
- **JSON Backup & Restore**: 1-click backup of all your open topics.

### 2. 📐 Live KaTeX Math Rendering
- Real-time LaTeX compilation supporting `$inline$` and `\[display\]` math formulas.
- Multi-line equation environments (`align`, `gather`, `multline`, etc.).
- Syntax error diagnostics highlighting exact line and column issues.

### 3. 🔣 Searchable LaTeX Symbol Palette (**`Ctrl + /`**)
- Instant search filter for:
  - **Greek letters** ($\alpha, \beta, \gamma, \delta, \Omega, \ldots$)
  - **Calculus & Sums** ($\int, \iint, \sum, \prod, \partial, \nabla, \lim, \ldots$)
  - **Relations & Sets** ($\le, \ge, \neq, \approx, \in, \subset, \cup, \cap, \ldots$)
  - **Arrows & Logic** ($\implies, \iff, \therefore, \forall, \exists, \ldots$)
  - **Matrices & Fractions** ($\frac{a}{b}, \begin{pmatrix}\dots\end{pmatrix}, \mathbf{x}, \mathbb{R}, \ldots$)
- Click any symbol to insert directly at your cursor without interrupting your flow.

### 4. ⚡ Fast Command Palette (**`Ctrl + K`**)
- Search and run any tool or jump directly to any open topic tab with arrow keys and Enter.

### 5. 🔄 Synchronized Scrolling & Focus Mode
- **Dual Synced Scroll**: Scrolling the editor smoothly synchronizes the preview, and vice versa.
- **Zen Focus Mode (**`Ctrl + E`**)**: Full-width writing canvas for deep concentration.

### 6. 📤 Multi-Format Exports
- **Printable PDF** (formatted for A4 academic documents)
- **Standard LaTeX Source (`.tex`)**
- **Standalone HTML**
- **High-Resolution PNG**
- **Vector SVG**

### 7. 🎹 Sensory & Navigation Customization
- **Keystroke Sounds**: Mechanical switches, Typewriter, Soft click, Bubble pop, Marble tap, Soft chime, and Piano tones.
- **Keybinding Modes**: Default, Vim (Normal/Insert/Line operators), and Emacs.
- **Typography & Themes**: Literata, Source Serif, Inter, JetBrains Mono, and IBM Plex fonts in Light or Dark themes.

---

## 🚀 How to Use & Deploy

### 1. Hosted on GitHub Pages (Zero Setup)
Simply push this repository to GitHub and visit your live URL:  
👉 **[https://erdisayar.github.io/dictate_write/](https://erdisayar.github.io/dictate_write/)**

### 2. Open Locally in Any Browser
You can open `index.html` directly in your browser without any server, or run Python's built-in static server:
```bash
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + Alt + T`** / **`Ctrl + Alt + N`** | New Topic Tab |
| **`Ctrl + Alt + W`** | Close Current Tab |
| **`Ctrl + K`** | Open Command Palette |
| **`Ctrl + /`** | Open LaTeX Symbol Palette |
| **`Ctrl + Enter`** | Re-render Preview |
| **`Ctrl + E`** | Toggle Focus / Split Mode |
| **`Ctrl + B`** / **`Ctrl + I`** | Bold / Italic Snippet |
| **`Tab`** | Indent 4 Spaces |
| **`Esc`** | Normal Mode (Vim) or Close Active Modal |
| **`?`** | Open Keyboard Shortcuts Guide |

---

## 📄 License
MIT
