const STORAGE = {
    source: 'temporary_latex_note_source',
    title: 'temporary_latex_note_title',
    prefs: 'temporary_latex_note_prefs'
};

const SAMPLE_NOTE = String.raw`\section{Short derivation}
Suppose the residual is written as $r_i = y_i - f_\theta(x_i)$. A compact loss is
\[
\mathcal{L}(\theta)=\frac{1}{n}\sum_{i=1}^{n} r_i^2+\lambda\|\theta\|_2^2.
\]

The gradient contribution from the regularizer is $\nabla_\theta \lambda\|\theta\|_2^2 = 2\lambda\theta$.

\begin{align}
a^2+b^2 &= c^2 \\
\exp(x) &= \sum_{k=0}^{\infty}\frac{x^k}{k!}
\end{align}

\begin{itemize}
\item Check whether the assumptions are stated clearly.
\item Keep the notation consistent with the manuscript.
\end{itemize}`;

const MATH_ENVIRONMENTS = [
    'equation',
    'equation*',
    'align',
    'align*',
    'alignat',
    'alignat*',
    'gather',
    'gather*',
    'multline',
    'multline*',
    'flalign',
    'flalign*',
    'CD'
];

const refs = {};
let renderTimer = 0;
let savedTimer = 0;
let latestMathCount = 0;

document.addEventListener('DOMContentLoaded', init);

function init() {
    bindRefs();
    const prefs = loadPrefs();

    refs.noteTitle.value = localStorage.getItem(STORAGE.title) || 'Untitled LaTeX note';
    refs.sourceInput.value = localStorage.getItem(STORAGE.source) || '';
    refs.livePreviewToggle.checked = prefs.livePreview !== false;
    refs.editorSize.value = prefs.editorSize || document.documentElement.dataset.editorSize || 'medium';

    setTheme(prefs.theme || document.documentElement.dataset.theme || 'dark', false);
    setEditorSize(refs.editorSize.value, false);
    bindEvents();
    refreshIcons();
    updateStats();
    renderNote();
    refs.sourceInput.focus();
}

function bindRefs() {
    [
        'statusPill',
        'statusText',
        'noteTitle',
        'renderBtn',
        'loadSampleBtn',
        'openFileBtn',
        'downloadTexBtn',
        'downloadHtmlBtn',
        'downloadPdfBtn',
        'copyPngBtn',
        'copySvgBtn',
        'clearBtn',
        'copySourceBtn',
        'sourceInput',
        'characterCount',
        'wordCount',
        'lineCount',
        'livePreviewToggle',
        'editorSize',
        'mathCount',
        'savedStamp',
        'copyPreviewBtn',
        'previewOutput',
        'diagnostics',
        'fileInput',
        'toastContainer'
    ].forEach(id => {
        refs[id] = document.getElementById(id);
    });
}

function bindEvents() {
    refs.noteTitle.addEventListener('input', () => {
        localStorage.setItem(STORAGE.title, refs.noteTitle.value);
        markSaved();
    });

    refs.sourceInput.addEventListener('input', () => {
        localStorage.setItem(STORAGE.source, refs.sourceInput.value);
        updateStats();
        markSaved();
        if (refs.livePreviewToggle.checked) {
            scheduleRender();
        } else {
            setStatus('Saved', 'good');
        }
    });

    refs.sourceInput.addEventListener('keydown', handleEditorKeydown);
    refs.renderBtn.addEventListener('click', renderNote);
    refs.loadSampleBtn.addEventListener('click', loadSample);
    refs.openFileBtn.addEventListener('click', () => refs.fileInput.click());
    refs.fileInput.addEventListener('change', loadFile);
    refs.downloadTexBtn.addEventListener('click', downloadTex);
    refs.downloadHtmlBtn.addEventListener('click', downloadHtml);
    refs.downloadPdfBtn.addEventListener('click', downloadPdf);
    refs.copyPngBtn.addEventListener('click', copyPng);
    refs.copySvgBtn.addEventListener('click', copySvg);
    refs.clearBtn.addEventListener('click', clearNote);
    refs.copySourceBtn.addEventListener('click', () => copyText(refs.sourceInput.value, 'Source copied'));
    refs.copyPreviewBtn.addEventListener('click', copyPreviewText);

    refs.livePreviewToggle.addEventListener('change', () => {
        savePrefs();
        if (refs.livePreviewToggle.checked) {
            renderNote();
        } else {
            setStatus('Manual render', '');
        }
    });

    refs.editorSize.addEventListener('change', () => setEditorSize(refs.editorSize.value));

    document.querySelectorAll('[data-theme-choice]').forEach(button => {
        button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
    });

    document.querySelectorAll('[data-snippet]').forEach(button => {
        button.addEventListener('click', () => insertSnippet(button.dataset.snippet));
    });

    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            renderNote();
        }
    });
}

function handleEditorKeydown(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        insertAtSelection('    ', '');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        insertSnippet('bold');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        insertSnippet('italic');
    }
}

function scheduleRender() {
    clearTimeout(renderTimer);
    setStatus('Editing', '');
    renderTimer = window.setTimeout(renderNote, 180);
}

function renderNote() {
    clearTimeout(renderTimer);

    const source = refs.sourceInput.value;
    refs.previewOutput.innerHTML = buildPreviewHtml(source);

    let diagnostics = [];
    if (window.katex && source.trim()) {
        diagnostics = validateMath(source);
    }

    if (window.renderMathInElement) {
        window.renderMathInElement(refs.previewOutput, katexOptions());
    }

    latestMathCount = countMath(source);
    refs.mathCount.textContent = String(latestMathCount);
    renderDiagnostics(diagnostics);

    if (!source.trim()) {
        setStatus('Ready', '');
    } else if (diagnostics.length) {
        setStatus(`${diagnostics.length} math issue${diagnostics.length === 1 ? '' : 's'}`, 'warn');
    } else {
        setStatus('Rendered', 'good');
    }
}

function buildPreviewHtml(source) {
    const normalized = source.replace(/\r\n?/g, '\n');

    if (!normalized.trim()) {
        return '<div class="empty-preview">Your rendered note will appear here.</div>';
    }

    const lines = normalized.split('\n');
    const parts = [];
    let paragraph = [];

    const flushParagraph = () => {
        if (!paragraph.length) return;
        const text = paragraph.join(' ').replace(/[ \t]+/g, ' ').trim();
        if (text) {
            parts.push(`<p>${formatInline(text)}</p>`);
        }
        paragraph = [];
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            continue;
        }

        const displayBlock = collectMathBlock(lines, index);
        if (displayBlock) {
            flushParagraph();
            parts.push(`<div class="latex-display">${escapeHtml(displayBlock.text)}</div>`);
            index = displayBlock.endIndex;
            continue;
        }

        const listBlock = collectListBlock(lines, index);
        if (listBlock) {
            flushParagraph();
            parts.push(listBlock.html);
            index = listBlock.endIndex;
            continue;
        }

        const heading = parseHeading(trimmed);
        if (heading) {
            flushParagraph();
            parts.push(`<${heading.tag}>${formatInline(heading.text)}</${heading.tag}>`);
            continue;
        }

        if (trimmed.startsWith('%')) {
            flushParagraph();
            parts.push(`<div class="latex-comment">${escapeHtml(trimmed)}</div>`);
            continue;
        }

        if (isDocumentCommand(trimmed)) {
            flushParagraph();
            parts.push(`<div class="latex-command">${escapeHtml(trimmed)}</div>`);
            continue;
        }

        paragraph.push(line);
    }

    flushParagraph();
    return `<div class="latex-preview">${parts.join('\n')}</div>`;
}

function collectMathBlock(lines, startIndex) {
    const trimmed = lines[startIndex].trim();
    const envMatch = trimmed.match(/^\\begin\{([^}]+)\}/);

    if (envMatch && MATH_ENVIRONMENTS.includes(envMatch[1])) {
        const env = envMatch[1];
        return collectUntil(lines, startIndex, line => line.includes(`\\end{${env}}`));
    }

    if (trimmed.startsWith('\\[')) {
        return collectDelimitedBlock(lines, startIndex, '\\[', '\\]');
    }

    if (trimmed.startsWith('$$')) {
        return collectDelimitedBlock(lines, startIndex, '$$', '$$');
    }

    return null;
}

function collectDelimitedBlock(lines, startIndex, left, right) {
    const block = [];

    for (let index = startIndex; index < lines.length; index += 1) {
        const line = lines[index];
        block.push(line);

        const searchStart = index === startIndex ? line.indexOf(left) + left.length : 0;
        if (line.indexOf(right, searchStart) !== -1) {
            return { text: block.join('\n'), endIndex: index };
        }
    }

    return { text: block.join('\n'), endIndex: lines.length - 1 };
}

function collectUntil(lines, startIndex, predicate) {
    const block = [];

    for (let index = startIndex; index < lines.length; index += 1) {
        block.push(lines[index]);
        if (predicate(lines[index], index)) {
            return { text: block.join('\n'), endIndex: index };
        }
    }

    return { text: block.join('\n'), endIndex: lines.length - 1 };
}

function collectListBlock(lines, startIndex) {
    const start = lines[startIndex].trim();
    const typeMatch = start.match(/^\\begin\{(itemize|enumerate)\}/);
    if (!typeMatch) return null;

    const type = typeMatch[1];
    const items = [];
    let current = '';
    let endIndex = startIndex;

    for (let index = startIndex + 1; index < lines.length; index += 1) {
        const trimmed = lines[index].trim();
        endIndex = index;

        if (trimmed === `\\end{${type}}`) {
            if (current.trim()) items.push(current.trim());
            break;
        }

        if (trimmed.startsWith('\\item')) {
            if (current.trim()) items.push(current.trim());
            current = trimmed.replace(/^\\item\s*/, '');
        } else if (trimmed) {
            current += `${current ? ' ' : ''}${trimmed}`;
        }
    }

    const tag = type === 'enumerate' ? 'ol' : 'ul';
    const html = `<${tag}>${items.map(item => `<li>${formatInline(item)}</li>`).join('')}</${tag}>`;
    return { html, endIndex };
}

function parseHeading(trimmed) {
    const patterns = [
        { regex: /^\\section\*?\{(.+)\}$/, tag: 'h2' },
        { regex: /^\\subsection\*?\{(.+)\}$/, tag: 'h3' },
        { regex: /^\\subsubsection\*?\{(.+)\}$/, tag: 'h4' },
        { regex: /^\\paragraph\*?\{(.+)\}$/, tag: 'h4' },
        { regex: /^\\title\{(.+)\}$/, tag: 'h2' }
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern.regex);
        if (match) {
            return { tag: pattern.tag, text: match[1] };
        }
    }

    return null;
}

function isDocumentCommand(trimmed) {
    return /^\\(?:documentclass|usepackage|maketitle|author|date)\b/.test(trimmed)
        || /^\\(?:begin|end)\{document\}/.test(trimmed);
}

function formatInline(text) {
    return splitInlineMath(text).map(segment => {
        if (segment.type === 'math') {
            return escapeHtml(segment.value);
        }
        return formatTextCommands(segment.value);
    }).join('');
}

function splitInlineMath(text) {
    const segments = [];
    let cursor = 0;

    while (cursor < text.length) {
        const next = findNextInlineMath(text, cursor);

        if (!next) {
            segments.push({ type: 'text', value: text.slice(cursor) });
            break;
        }

        if (next.start > cursor) {
            segments.push({ type: 'text', value: text.slice(cursor, next.start) });
        }

        segments.push({ type: 'math', value: text.slice(next.start, next.end) });
        cursor = next.end;
    }

    return segments.filter(segment => segment.value);
}

function findNextInlineMath(text, from) {
    const candidates = [];

    const paren = text.indexOf('\\(', from);
    if (paren !== -1) {
        const end = text.indexOf('\\)', paren + 2);
        if (end !== -1) candidates.push({ start: paren, end: end + 2 });
    }

    const bracket = text.indexOf('\\[', from);
    if (bracket !== -1) {
        const end = text.indexOf('\\]', bracket + 2);
        if (end !== -1) candidates.push({ start: bracket, end: end + 2 });
    }

    const displayDollar = text.indexOf('$$', from);
    if (displayDollar !== -1) {
        const end = text.indexOf('$$', displayDollar + 2);
        if (end !== -1) candidates.push({ start: displayDollar, end: end + 2 });
    }

    const inlineDollar = findDollarPair(text, from);
    if (inlineDollar) candidates.push(inlineDollar);

    return candidates.sort((a, b) => a.start - b.start)[0] || null;
}

function findDollarPair(text, from) {
    for (let index = from; index < text.length; index += 1) {
        if (text[index] !== '$' || isEscaped(text, index) || text[index + 1] === '$') continue;

        for (let end = index + 1; end < text.length; end += 1) {
            if (text[end] === '$' && !isEscaped(text, end)) {
                return { start: index, end: end + 1 };
            }
        }
    }

    return null;
}

function formatTextCommands(text) {
    let html = escapeHtml(text);

    const replacements = [
        [/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>'],
        [/\\textit\{([^{}]*)\}/g, '<em>$1</em>'],
        [/\\emph\{([^{}]*)\}/g, '<em>$1</em>'],
        [/\\underline\{([^{}]*)\}/g, '<span class="underline">$1</span>'],
        [/\\texttt\{([^{}]*)\}/g, '<code>$1</code>'],
        [/\\cite\{([^{}]*)\}/g, '<span class="inline-chip">cite: $1</span>'],
        [/\\ref\{([^{}]*)\}/g, '<span class="inline-chip">ref: $1</span>'],
        [/\\label\{([^{}]*)\}/g, '<span class="inline-chip">label: $1</span>']
    ];

    for (let pass = 0; pass < 3; pass += 1) {
        replacements.forEach(([regex, replacement]) => {
            html = html.replace(regex, replacement);
        });
    }

    html = html
        .replace(/\\LaTeX\b/g, 'LaTeX')
        .replace(/\\TeX\b/g, 'TeX')
        .replace(/\\quad\b/g, '&emsp;')
        .replace(/\\,/g, '&thinsp;')
        .replace(/\\newline\b/g, '<br>')
        .replace(/\\\\/g, '<br>')
        .replace(/~/g, '&nbsp;');

    return html;
}

function katexOptions() {
    return {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
            ...MATH_ENVIRONMENTS.map(env => ({
                left: `\\begin{${env}}`,
                right: `\\end{${env}}`,
                display: true
            }))
        ],
        throwOnError: false,
        errorColor: getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#fb7185',
        strict: 'warn',
        trust: false
    };
}

function validateMath(source) {
    const expressions = extractMathExpressions(source);
    const errors = [];

    expressions.forEach(expression => {
        try {
            window.katex.renderToString(expression.value, {
                displayMode: expression.display,
                throwOnError: true,
                strict: 'warn',
                trust: false
            });
        } catch (error) {
            const errorIndex = getMathErrorIndex(expression, error);
            const location = getLineColumn(source, errorIndex);

            errors.push({
                message: error.message || 'Could not render expression',
                sample: expression.raw.replace(/\s+/g, ' ').trim().slice(0, 120),
                line: location.line,
                column: location.column,
                lineText: getLineText(source, location.line),
                startIndex: expression.index,
                endIndex: expression.index + expression.raw.length,
                errorIndex
            });
        }
    });

    return errors;
}

function extractMathExpressions(source) {
    const expressions = [];
    const text = source.replace(/\r\n?/g, '\n');

    MATH_ENVIRONMENTS.forEach(env => {
        const regex = new RegExp(String.raw`\\begin\{${escapeRegex(env)}\}[\s\S]*?\\end\{${escapeRegex(env)}\}`, 'g');
        let match;

        while ((match = regex.exec(text)) !== null) {
            expressions.push({
                raw: match[0],
                value: match[0],
                display: true,
                index: match.index,
                valueStartIndex: match.index
            });
        }
    });

    scanDelimitedMath(text).forEach(expression => expressions.push(expression));

    return expressions
        .sort((a, b) => a.index - b.index)
        .filter((expression, index, all) => {
            const previous = all[index - 1];
            return !previous || previous.index !== expression.index || previous.raw !== expression.raw;
        });
}

function scanDelimitedMath(text) {
    const expressions = [];
    let cursor = 0;

    while (cursor < text.length) {
        const next = findNextDelimitedMath(text, cursor);
        if (!next) break;
        expressions.push(next);
        cursor = next.index + next.raw.length;
    }

    return expressions;
}

function findNextDelimitedMath(text, from) {
    const candidates = [];
    addDelimitedCandidate(candidates, text, from, '$$', '$$', true);
    addDelimitedCandidate(candidates, text, from, '\\[', '\\]', true);
    addDelimitedCandidate(candidates, text, from, '\\(', '\\)', false);

    const dollar = findDollarPair(text, from);
    if (dollar) {
        const raw = text.slice(dollar.start, dollar.end);
        candidates.push({
            raw,
            value: raw.slice(1, -1),
            display: false,
            index: dollar.start,
            valueStartIndex: dollar.start + 1
        });
    }

    return candidates.sort((a, b) => a.index - b.index)[0] || null;
}

function addDelimitedCandidate(candidates, text, from, left, right, display) {
    const start = text.indexOf(left, from);
    if (start === -1 || isEscaped(text, start)) return;

    const end = text.indexOf(right, start + left.length);
    if (end === -1) return;

    const raw = text.slice(start, end + right.length);
    candidates.push({
        raw,
        value: raw.slice(left.length, -right.length),
        display,
        index: start,
        valueStartIndex: start + left.length
    });
}

function countMath(source) {
    return extractMathExpressions(source).length;
}

function renderDiagnostics(errors) {
    refs.diagnostics.hidden = !errors.length;
    refs.diagnostics.innerHTML = '';

    if (!errors.length) {
        return;
    }

    const heading = document.createElement('strong');
    heading.textContent = 'KaTeX could not fully render some math.';

    const list = document.createElement('ul');
    errors.slice(0, 5).forEach(error => {
        const item = document.createElement('li');

        const jump = document.createElement('button');
        jump.className = 'diagnostic-jump';
        jump.type = 'button';
        jump.textContent = `Line ${error.line}, col ${error.column}`;
        jump.addEventListener('click', () => focusSourceRange(error.startIndex, error.endIndex));

        const message = document.createElement('span');
        message.className = 'diagnostic-message';
        message.textContent = ` ${error.message}`;

        const sample = document.createElement('code');
        sample.className = 'diagnostic-sample';
        sample.textContent = error.lineText || error.sample || 'Expression';

        item.append(jump, message, sample);
        list.appendChild(item);
    });

    refs.diagnostics.append(heading, list);

    if (errors.length > 5) {
        const more = document.createElement('p');
        more.textContent = `${errors.length - 5} more issue${errors.length - 5 === 1 ? '' : 's'} not shown.`;
        refs.diagnostics.appendChild(more);
    }
}

function getMathErrorIndex(expression, error) {
    const valueStart = expression.valueStartIndex ?? expression.index;
    const rawEnd = expression.index + expression.raw.length;

    if (Number.isInteger(error.position)) {
        return clamp(valueStart + error.position, expression.index, rawEnd);
    }

    return expression.index;
}

function getLineColumn(source, index) {
    const safeIndex = clamp(index, 0, source.length);
    let line = 1;
    let lineStart = 0;

    for (let cursor = 0; cursor < safeIndex; cursor += 1) {
        if (source[cursor] === '\n') {
            line += 1;
            lineStart = cursor + 1;
        }
    }

    return { line, column: safeIndex - lineStart + 1 };
}

function getLineText(source, lineNumber) {
    return source.split('\n')[Math.max(0, lineNumber - 1)]?.trim() || '';
}

function focusSourceRange(startIndex, endIndex) {
    refs.sourceInput.focus();
    refs.sourceInput.setSelectionRange(startIndex, endIndex);
    const beforeSelection = refs.sourceInput.value.slice(0, startIndex);
    const lineCount = beforeSelection.split('\n').length;
    refs.sourceInput.scrollTop = Math.max(0, (lineCount - 4) * getEditorLineHeight());
}

function getEditorLineHeight() {
    const computed = window.getComputedStyle(refs.sourceInput);
    const parsed = Number.parseFloat(computed.lineHeight);
    return Number.isFinite(parsed) ? parsed : 24;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updateStats() {
    const source = refs.sourceInput.value;
    refs.characterCount.textContent = String(source.length);
    refs.wordCount.textContent = String(countWords(source));
    refs.lineCount.textContent = String(source ? source.split('\n').length : 0);
}

function countWords(value) {
    return (value.trim().match(/\S+/g) || []).length;
}

function insertSnippet(type) {
    const selection = getSelectionText() || defaultSnippetText(type);

    const snippets = {
        inlineMath: { before: '$', after: '$', fallback: 'x_i' },
        displayMath: { before: '\\[\n', after: '\n\\]', fallback: String.raw`\mathcal{L}(\theta)=\frac{1}{n}\sum_{i=1}^{n}(y_i-f_\theta(x_i))^2` },
        align: { before: '\\begin{align}\n', after: '\n\\end{align}', fallback: 'a^2+b^2 &= c^2 \\\\\nE &= mc^2' },
        itemize: { before: '\\begin{itemize}\n\\item ', after: '\n\\end{itemize}', fallback: 'First point' },
        section: { before: '\\section{', after: '}', fallback: 'New section' },
        bold: { before: '\\textbf{', after: '}', fallback: 'important text' },
        italic: { before: '\\textit{', after: '}', fallback: 'emphasis' }
    };

    const snippet = snippets[type];
    if (!snippet) return;

    insertAtSelection(snippet.before, snippet.after, selection || snippet.fallback);
}

function defaultSnippetText(type) {
    if (type === 'inlineMath') return 'x_i';
    if (type === 'displayMath') return String.raw`\mathcal{L}(\theta)=\frac{1}{n}\sum_{i=1}^{n}(y_i-f_\theta(x_i))^2`;
    return '';
}

function getSelectionText() {
    return refs.sourceInput.value.slice(refs.sourceInput.selectionStart, refs.sourceInput.selectionEnd);
}

function insertAtSelection(before, after, fallback = '') {
    const input = refs.sourceInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const current = input.value;
    const selected = current.slice(start, end) || fallback;
    const insertion = `${before}${selected}${after}`;

    input.value = `${current.slice(0, start)}${insertion}${current.slice(end)}`;
    input.focus();
    input.selectionStart = start + before.length;
    input.selectionEnd = start + before.length + selected.length;
    localStorage.setItem(STORAGE.source, input.value);
    updateStats();
    markSaved();

    if (refs.livePreviewToggle.checked) {
        scheduleRender();
    }
}

function loadSample() {
    if (refs.sourceInput.value.trim() && !window.confirm('Replace the current note with the sample?')) {
        return;
    }

    refs.noteTitle.value = 'Short derivation';
    refs.sourceInput.value = SAMPLE_NOTE;
    localStorage.setItem(STORAGE.title, refs.noteTitle.value);
    localStorage.setItem(STORAGE.source, refs.sourceInput.value);
    updateStats();
    markSaved();
    renderNote();
    toast('Sample loaded');
}

function clearNote() {
    if (refs.sourceInput.value.trim() && !window.confirm('Clear this note?')) {
        return;
    }

    refs.sourceInput.value = '';
    refs.noteTitle.value = 'Untitled LaTeX note';
    localStorage.setItem(STORAGE.source, '');
    localStorage.setItem(STORAGE.title, refs.noteTitle.value);
    updateStats();
    markSaved();
    renderNote();
    refs.sourceInput.focus();
    toast('Cleared');
}

function loadFile() {
    const file = refs.fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        refs.sourceInput.value = String(reader.result || '');
        refs.noteTitle.value = file.name.replace(/\.[^.]+$/, '') || 'Imported note';
        localStorage.setItem(STORAGE.source, refs.sourceInput.value);
        localStorage.setItem(STORAGE.title, refs.noteTitle.value);
        updateStats();
        markSaved();
        renderNote();
        toast('File loaded');
        refs.fileInput.value = '';
    };
    reader.onerror = () => toast('Could not read that file');
    reader.readAsText(file);
}

function downloadTex() {
    const source = refs.sourceInput.value;
    if (!source.trim()) {
        toast('Nothing to download');
        return;
    }

    downloadBlob(source, `${safeFileName(refs.noteTitle.value)}.tex`, 'text/plain;charset=utf-8');
    toast('TeX downloaded');
}

function downloadHtml() {
    if (!refs.sourceInput.value.trim()) {
        toast('Nothing to download');
        return;
    }

    renderNote();
    const title = escapeHtml(refs.noteTitle.value || 'Rendered LaTeX note');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css">
<style>
body{max-width:860px;margin:40px auto;padding:0 20px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65;color:#1b2330}
.latex-display{overflow-x:auto;margin:1em 0;padding:.75em;border:1px solid #d6dde8;border-radius:8px;background:#f8fafc}
.latex-comment,.latex-command{color:#667085;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
</style>
</head>
<body>
${refs.previewOutput.innerHTML}
</body>
</html>`;

    downloadBlob(html, `${safeFileName(refs.noteTitle.value)}.html`, 'text/html;charset=utf-8');
    toast('HTML downloaded');
}

async function downloadPdf() {
    if (!hasExportablePreview()) return;

    setStatus('Building PDF', '');

    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            openPrintPdf();
            return;
        }

        const canvas = await capturePreviewCanvas();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 36;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;
        const imageHeight = canvas.height * usableWidth / canvas.width;
        const imageData = canvas.toDataURL('image/png');

        let offset = 0;
        while (offset < imageHeight) {
            if (offset > 0) pdf.addPage();
            pdf.addImage(imageData, 'PNG', margin, margin - offset, usableWidth, imageHeight);
            offset += usableHeight;
        }

        pdf.save(`${safeFileName(refs.noteTitle.value)}.pdf`);
        setStatus('PDF ready', 'good');
        toast('PDF downloaded');
    } catch (error) {
        void error;
        openPrintPdf();
    }
}

async function copyPng() {
    if (!hasExportablePreview()) return;

    setStatus('Rendering PNG', '');

    try {
        const canvas = await capturePreviewCanvas();
        const blob = await canvasToBlob(canvas, 'image/png');

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setStatus('PNG copied', 'good');
            toast('PNG copied');
            return;
        }

        downloadBlob(blob, `${safeFileName(refs.noteTitle.value)}.png`, 'image/png');
        setStatus('PNG downloaded', 'good');
        toast('PNG copy is not available here, so it was downloaded');
    } catch (error) {
        void error;
        setStatus('PNG failed', 'warn');
        toast('Could not create the PNG');
    }
}

async function copySvg() {
    if (!hasExportablePreview()) return;

    setStatus('Building SVG', '');

    try {
        const svg = await buildPreviewSvg();
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

        if (navigator.clipboard && window.ClipboardItem) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/svg+xml': blob })
                ]);
                setStatus('SVG copied', 'good');
                toast('SVG copied');
                return;
            } catch (error) {
                if (navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(svg);
                    setStatus('SVG source copied', 'good');
                    toast('SVG source copied');
                    return;
                }
            }
        }

        downloadBlob(blob, `${safeFileName(refs.noteTitle.value)}.svg`, 'image/svg+xml;charset=utf-8');
        setStatus('SVG downloaded', 'good');
        toast('SVG copy is not available here, so it was downloaded');
    } catch (error) {
        void error;
        setStatus('SVG failed', 'warn');
        toast('Could not create the SVG');
    }
}

async function capturePreviewCanvas() {
    if (!window.html2canvas) {
        throw new Error('html2canvas is not available');
    }

    renderNote();

    const stage = createExportStage();
    document.body.appendChild(stage);
    await waitForFonts();

    try {
        const canvas = await window.html2canvas(stage, {
            backgroundColor: getCssValue('--export-bg'),
            scale: Math.min(window.devicePixelRatio || 1, 2),
            useCORS: true,
            width: stage.scrollWidth,
            height: stage.scrollHeight,
            windowWidth: stage.scrollWidth,
            windowHeight: stage.scrollHeight,
            scrollX: 0,
            scrollY: 0
        });
        return canvas;
    } finally {
        stage.remove();
    }
}

async function buildPreviewSvg() {
    renderNote();

    const stage = createExportStage();
    document.body.appendChild(stage);
    await waitForFonts();
    inlineComputedStyles(stage);

    const width = Math.ceil(stage.scrollWidth);
    const height = Math.ceil(stage.scrollHeight);
    const body = new XMLSerializer().serializeToString(stage);
    stage.remove();

    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<foreignObject width="100%" height="100%">`,
        body,
        `</foreignObject>`,
        `</svg>`
    ].join('');
}

function createExportStage() {
    const stage = document.createElement('section');
    stage.className = 'export-stage';
    stage.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

    const title = document.createElement('h1');
    title.className = 'export-title';
    title.textContent = refs.noteTitle.value || 'LaTeX note';

    const meta = document.createElement('div');
    meta.className = 'export-meta';
    meta.textContent = `Rendered ${new Date().toLocaleString()}`;

    const content = document.createElement('article');
    content.className = 'export-content preview-content';
    content.innerHTML = refs.previewOutput.innerHTML;

    stage.append(title, meta, content);
    return stage;
}

function openPrintPdf() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        setStatus('PDF blocked', 'warn');
        toast('Allow popups to print or save as PDF');
        return;
    }

    const html = buildStandaloneHtml();
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
    });
    setStatus('Print opened', 'good');
    toast('Use the print dialog to save as PDF');
}

function buildStandaloneHtml() {
    const title = escapeHtml(refs.noteTitle.value || 'Rendered LaTeX note');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css">
<style>${standaloneExportCss()}</style>
</head>
<body>
<main class="export-page">
<h1>${title}</h1>
<div class="export-meta">Rendered ${escapeHtml(new Date().toLocaleString())}</div>
${refs.previewOutput.innerHTML}
</main>
</body>
</html>`;
}

function copyPreviewText() {
    const text = refs.previewOutput.innerText.trim();
    copyText(text, 'Preview text copied');
}

function hasExportablePreview() {
    if (!refs.sourceInput.value.trim()) {
        toast('Nothing to export');
        return false;
    }

    return true;
}

function canvasToBlob(canvas, type) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Canvas export failed'));
            }
        }, type);
    });
}

function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
        return document.fonts.ready.catch(() => {});
    }

    return Promise.resolve();
}

function inlineComputedStyles(root) {
    const elements = [root, ...root.querySelectorAll('*')];

    elements.forEach(element => {
        const computed = window.getComputedStyle(element);
        const properties = [
            'align-items',
            'background',
            'background-color',
            'border',
            'border-bottom',
            'border-left',
            'border-radius',
            'box-sizing',
            'color',
            'display',
            'font-family',
            'font-size',
            'font-style',
            'font-weight',
            'height',
            'justify-content',
            'line-height',
            'margin',
            'margin-bottom',
            'margin-left',
            'margin-right',
            'margin-top',
            'max-width',
            'min-height',
            'opacity',
            'overflow',
            'overflow-wrap',
            'padding',
            'padding-bottom',
            'padding-left',
            'padding-right',
            'padding-top',
            'position',
            'text-align',
            'text-decoration',
            'vertical-align',
            'white-space',
            'width'
        ];

        const inline = properties
            .map(property => `${property}:${computed.getPropertyValue(property)};`)
            .join('');
        element.setAttribute('style', `${element.getAttribute('style') || ''};${inline}`);
    });
}

function standaloneExportCss() {
    return `
body{margin:0;background:#f4f7fb;color:#1b2330;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
.export-page{max-width:900px;margin:0 auto;padding:42px 48px;background:#fff;min-height:100vh}
.export-page>h1{margin:0 0 6px;font-size:28px;line-height:1.15;color:#111827}
.export-meta{margin-bottom:24px;color:#667085;font-size:13px}
.latex-preview{max-width:850px}
.latex-preview h2,.latex-preview h3,.latex-preview h4{margin:1.25em 0 .45em;color:#111827;line-height:1.18}
.latex-preview h2:first-child,.latex-preview h3:first-child,.latex-preview h4:first-child,.latex-preview p:first-child{margin-top:0}
.latex-preview h2{font-size:1.45em;border-bottom:1px solid #d6dde8;padding-bottom:.25em}
.latex-preview h3{font-size:1.18em}
.latex-preview h4{font-size:1.03em;color:#586579}
.latex-preview p{margin:.72em 0}
.latex-preview ul,.latex-preview ol{margin:.75em 0 .75em 1.25em;padding:0}
.latex-preview li+li{margin-top:.35em}
.latex-preview code{padding:.13em .34em;border:1px solid #d6dde8;border-radius:5px;color:#0f766e;background:#f8fafc;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.9em}
.latex-display{margin:1em 0;padding:.8em .9em;overflow-x:auto;border:1px solid #d6dde8;border-radius:8px;background:#f8fafc}
.latex-comment{margin:.65em 0;padding:.35em 0 .35em .8em;border-left:3px solid #aeb9ca;color:#778397;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.92em}
.latex-command{margin:.55em 0;color:#778397;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.9em}
.inline-chip{display:inline-flex;align-items:center;min-height:1.55em;padding:0 .42em;border:1px solid #d6dde8;border-radius:999px;color:#586579;background:#eef2f7;font-size:.82em;vertical-align:baseline}
.underline{text-decoration:underline;text-decoration-thickness:.08em;text-underline-offset:.16em}
@media print{body{background:#fff}.export-page{padding:0;max-width:none}}
`;
}

function copyText(value, successMessage) {
    if (!value.trim()) {
        toast('Nothing to copy');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value)
            .then(() => toast(successMessage))
            .catch(() => fallbackCopy(value, successMessage));
        return;
    }

    fallbackCopy(value, successMessage);
}

function fallbackCopy(value, successMessage) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        toast(successMessage);
    } catch (error) {
        toast('Clipboard copy was blocked');
    }

    textarea.remove();
}

function downloadBlob(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getCssValue(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function setTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });

    if (persist) {
        savePrefs();
        renderNote();
    }
}

function setEditorSize(size, persist = true) {
    document.documentElement.dataset.editorSize = size;

    if (persist) {
        savePrefs();
    }
}

function savePrefs() {
    const prefs = {
        theme: document.documentElement.dataset.theme || 'dark',
        livePreview: refs.livePreviewToggle.checked,
        editorSize: refs.editorSize.value
    };
    localStorage.setItem(STORAGE.prefs, JSON.stringify(prefs));
}

function loadPrefs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE.prefs) || '{}');
    } catch (error) {
        return {};
    }
}

function markSaved() {
    window.clearTimeout(savedTimer);
    refs.savedStamp.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    savedTimer = window.setTimeout(() => {
        refs.savedStamp.textContent = 'Saved locally';
    }, 3500);
}

function setStatus(message, tone = '') {
    refs.statusText.textContent = message;
    refs.statusPill.classList.toggle('good', tone === 'good');
    refs.statusPill.classList.toggle('warn', tone === 'warn');
}

function toast(message) {
    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = message;
    refs.toastContainer.appendChild(element);
    window.setTimeout(() => element.remove(), 2800);
}

function safeFileName(value) {
    const cleaned = (value || 'latex-note')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleaned || 'latex-note';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isEscaped(text, index) {
    let slashCount = 0;

    for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
        slashCount += 1;
    }

    return slashCount % 2 === 1;
}

function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }
}
