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
let typingEvents = [];
let sessionBaselineWords = 0;
let sessionMilestones = new Set();
let lastSourceValue = '';
let typingAudio = null;
let typingMasterGain = null;
let typingAudioUnlockHintShown = false;
let lastKeystrokeSoundAt = 0;
let vimMode = 'insert';
let pendingVimOperator = '';

const SESSION_MILESTONES = [50, 100, 250, 500, 1000];
const PASTE_CHAR_THRESHOLD = 24;

document.addEventListener('DOMContentLoaded', init);

function init() {
    bindRefs();
    const prefs = loadPrefs();

    refs.noteTitle.value = localStorage.getItem(STORAGE.title) || 'Untitled LaTeX note';
    refs.sourceInput.value = localStorage.getItem(STORAGE.source) || '';
    refs.livePreviewToggle.checked = prefs.livePreview !== false;
    refs.editorSize.value = prefs.editorSize || document.documentElement.dataset.editorSize || 'large';
    refs.editorFont.value = prefs.editorFont || document.documentElement.dataset.editorFont || 'literata';
    refs.keybindingMode.value = prefs.keybindingMode || 'default';
    refs.typingSoundToggle.checked = prefs.typingSound === undefined
        ? true
        : Boolean(prefs.typingSound);
    refs.typingSoundStyle.value = prefs.typingSoundStyle || 'keystroke';

    setTheme(prefs.theme || document.documentElement.dataset.theme || 'dark', false);
    setEditorSize(refs.editorSize.value, false);
    setEditorFont(refs.editorFont.value, false);
    setFocusMode(prefs.focusMode === true, false);
    setTypingSoundUi();
    updateKeybindingIndicator();
    bindEvents();
    refreshIcons();
    lastSourceValue = refs.sourceInput.value;
    sessionBaselineWords = countWords(refs.sourceInput.value);
    updateStats();
    updateWritingMetrics();
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
        'wpmCount',
        'keybindingIndicator',
        'sessionStat',
        'sessionWords',
        'focusModeBtn',
        'livePreviewToggle',
        'typingSoundToggle',
        'typingSoundStyle',
        'typingSoundStyleWrap',
        'editorSize',
        'editorFont',
        'keybindingMode',
        'mathCount',
        'savedStamp',
        'copyPreviewBtn',
        'previewOutput',
        'diagnostics',
        'fileInput',
        'toastContainer',
        'readAloudBtn',
        'findPanel',
        'findInput',
        'replaceInput',
        'findCaseSensitive',
        'findWholeWord',
        'findRegex',
        'findCount',
        'findPrevBtn',
        'findNextBtn',
        'replaceOneBtn',
        'replaceAllBtn',
        'findCloseBtn',
        'matchHighlightLayer',
        'synonymPopover',
        'synonymWord',
        'synonymBody',
        'synonymCloseBtn',
        'helpOverlay',
        'helpCloseBtn',
        'helpGrid'
    ].forEach(id => {
        refs[id] = document.getElementById(id);
    });
}

function bindEvents() {
    refs.noteTitle.addEventListener('input', () => {
        localStorage.setItem(STORAGE.title, refs.noteTitle.value);
        markSaved();
        if (refs.livePreviewToggle.checked) {
            scheduleRender();
        }
    });

    refs.sourceInput.addEventListener('input', handleSourceInput);
    refs.sourceInput.addEventListener('keydown', handleEditorKeydown);
    bindTypingAudioUnlock();
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
    refs.readAloudBtn.addEventListener('click', toggleReadAloud);

    bindFindPanel();
    bindSynonymPopover();
    bindHelpOverlay();

    refs.livePreviewToggle.addEventListener('change', () => {
        savePrefs();
        if (refs.livePreviewToggle.checked) {
            renderNote();
        } else {
            setStatus('Manual render', '');
        }
    });

    refs.editorSize.addEventListener('change', () => setEditorSize(refs.editorSize.value));
    refs.editorFont.addEventListener('change', () => setEditorFont(refs.editorFont.value));
    refs.keybindingMode.addEventListener('change', () => {
        pendingVimOperator = '';
        vimMode = 'insert';
        updateKeybindingIndicator();
        savePrefs();
        toast(`Keybindings: ${refs.keybindingMode.options[refs.keybindingMode.selectedIndex].textContent}`);
    });
    refs.focusModeBtn.addEventListener('click', () => setFocusMode(document.documentElement.dataset.focusMode !== 'on'));
    refs.typingSoundToggle.addEventListener('change', async () => {
        setTypingSoundUi();
        savePrefs();
        typingAudioUnlockHintShown = false;

        if (refs.typingSoundToggle.checked) {
            const played = await playTypingSound('a');
            if (!played) {
                toast('Click in the editor, then type to hear keystroke sounds');
            }
        }
    });
    refs.typingSoundStyle.addEventListener('change', async () => {
        savePrefs();
        if (refs.typingSoundToggle.checked) {
            await playTypingSound('a');
        }
    });

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

        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
            const key = event.key.toLowerCase();
            if (key === 'f') {
                event.preventDefault();
                openFindPanel(false);
                return;
            }
            if (key === 'h') {
                event.preventDefault();
                openFindPanel(true);
                return;
            }
            if (key === 'r') {
                event.preventDefault();
                toggleReadAloud();
                return;
            }
            if (key === '/') {
                event.preventDefault();
                toggleHelpOverlay();
                return;
            }
        }
    });
}

function handleSourceInput() {
    const previous = lastSourceValue;
    const current = refs.sourceInput.value;
    const delta = current.length - previous.length;

    if (delta > 0 && delta <= PASTE_CHAR_THRESHOLD) {
        recordTyping(delta);
    }

    lastSourceValue = current;
    localStorage.setItem(STORAGE.source, current);
    updateStats();
    updateWritingMetrics();
    checkSessionMilestones();
    markSaved();

    if (refs.livePreviewToggle.checked) {
        scheduleRender();
    } else {
        setStatus('Saved', 'good');
    }
}

function handleEditorKeydown(event) {
    if (shouldPlayTypingSound(event)) {
        void playTypingSound(event.key, event.repeat);
    }

    if (handleWordShortcuts(event)) {
        return;
    }

    if (handleModeKeydown(event)) {
        return;
    }

    if (event.key === 'Tab') {
        event.preventDefault();
        insertAtSelection('    ', '');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        if (getKeybindingMode() !== 'default') {
            return;
        }
        event.preventDefault();
        insertSnippet('bold');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
        if (getKeybindingMode() !== 'default') {
            return;
        }
        event.preventDefault();
        insertSnippet('italic');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setFocusMode(document.documentElement.dataset.focusMode !== 'on');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        const input = refs.sourceInput;
        const hasSelection = input.selectionStart !== input.selectionEnd;

        if (!hasSelection) {
            event.preventDefault();
            copyText(input.value, 'Source copied');
        }
    }
}

function getKeybindingMode() {
    return refs.keybindingMode?.value || 'default';
}

function handleModeKeydown(event) {
    const mode = getKeybindingMode();
    if (mode === 'emacs') {
        return handleEmacsKeydown(event);
    }
    if (mode === 'vim') {
        return handleVimKeydown(event);
    }
    return false;
}

function handleWordShortcuts(event) {
    if (!event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }

    const key = event.key.toLowerCase();

    if (key === 'b') {
        event.preventDefault();
        moveByWord(-1);
        return true;
    }

    if (key === 'f') {
        event.preventDefault();
        moveByWord(1);
        return true;
    }

    if (event.key === 'Backspace') {
        event.preventDefault();
        deletePreviousWord();
        return true;
    }

    return false;
}

function handleEmacsKeydown(event) {
    if (event.metaKey) {
        return false;
    }

    if (!event.ctrlKey && !event.altKey) {
        return false;
    }

    if (event.altKey && !event.ctrlKey) {
        const key = event.key.toLowerCase();
        if (key === 'd') {
            event.preventDefault();
            deleteNextWord();
            return true;
        }
        return false;
    }

    if (!event.ctrlKey || event.altKey) {
        return false;
    }

    const key = event.key.toLowerCase();
    switch (key) {
        case 'a':
            event.preventDefault();
            moveToLineStart();
            return true;
        case 'e':
            event.preventDefault();
            moveToLineEnd();
            return true;
        case 'b':
            event.preventDefault();
            moveByCharacter(-1);
            return true;
        case 'f':
            event.preventDefault();
            moveByCharacter(1);
            return true;
        case 'p':
            event.preventDefault();
            moveByLine(-1);
            return true;
        case 'n':
            event.preventDefault();
            moveByLine(1);
            return true;
        case 'd':
            event.preventDefault();
            deleteForwardCharacter();
            return true;
        case 'h':
            event.preventDefault();
            deleteBackwardCharacter();
            return true;
        case 'k':
            event.preventDefault();
            killToLineEnd();
            return true;
        case 'u':
            event.preventDefault();
            killToLineStart();
            return true;
        case 'w':
            event.preventDefault();
            deletePreviousWord();
            return true;
        default:
            return false;
    }
}

function handleVimKeydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
        return false;
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        pendingVimOperator = '';
        vimMode = 'normal';
        updateKeybindingIndicator();
        return true;
    }

    if (vimMode === 'insert') {
        return false;
    }

    const key = event.key;

    if (key === 'd') {
        event.preventDefault();
        if (pendingVimOperator === 'd') {
            deleteCurrentLine();
            pendingVimOperator = '';
        } else {
            pendingVimOperator = 'd';
        }
        return true;
    }

    pendingVimOperator = '';

    switch (key) {
        case 'i':
            event.preventDefault();
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'a':
            event.preventDefault();
            moveByCharacter(1);
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'I':
            event.preventDefault();
            moveToLineStart(true);
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'A':
            event.preventDefault();
            moveToLineEnd();
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'o':
            event.preventDefault();
            openLine(1);
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'O':
            event.preventDefault();
            openLine(-1);
            vimMode = 'insert';
            updateKeybindingIndicator();
            return true;
        case 'h':
            event.preventDefault();
            moveByCharacter(-1);
            return true;
        case 'l':
            event.preventDefault();
            moveByCharacter(1);
            return true;
        case 'j':
            event.preventDefault();
            moveByLine(1);
            return true;
        case 'k':
            event.preventDefault();
            moveByLine(-1);
            return true;
        case 'w':
            event.preventDefault();
            moveByWord(1);
            return true;
        case 'b':
            event.preventDefault();
            moveByWord(-1);
            return true;
        case 'e':
            event.preventDefault();
            moveToWordEnd();
            return true;
        case 'x':
            event.preventDefault();
            deleteForwardCharacter();
            return true;
        case '0':
            event.preventDefault();
            moveToLineStart();
            return true;
        case '$':
            event.preventDefault();
            moveToLineEnd();
            return true;
        default:
            if (key.length === 1 || key === 'Backspace' || key === 'Delete' || key === 'Enter') {
                event.preventDefault();
                return true;
            }
            return false;
    }
}

function getInputSelection() {
    const input = refs.sourceInput;
    return {
        input,
        text: input.value,
        start: input.selectionStart,
        end: input.selectionEnd
    };
}

function setSelection(position) {
    const input = refs.sourceInput;
    const target = clamp(position, 0, input.value.length);
    input.selectionStart = target;
    input.selectionEnd = target;
}

function applyEditorEdit(nextValue, nextStart, nextEnd = nextStart) {
    const input = refs.sourceInput;
    input.value = nextValue;
    input.selectionStart = clamp(nextStart, 0, nextValue.length);
    input.selectionEnd = clamp(nextEnd, 0, nextValue.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function moveByCharacter(direction) {
    const { text, start, end } = getInputSelection();
    if (direction < 0 && start !== end) {
        setSelection(start);
        return;
    }
    if (direction > 0 && start !== end) {
        setSelection(end);
        return;
    }
    setSelection(clamp(start + direction, 0, text.length));
}

function moveByWord(direction) {
    const { text, start, end } = getInputSelection();
    const anchor = direction < 0 ? Math.min(start, end) : Math.max(start, end);
    const target = direction < 0
        ? findPreviousWordBoundary(text, anchor)
        : findNextWordBoundary(text, anchor);
    setSelection(target);
}

function moveToWordEnd() {
    const { text, start, end } = getInputSelection();
    let index = Math.max(start, end);

    while (index < text.length && /\s/.test(text[index])) {
        index += 1;
    }
    while (index < text.length && /\S/.test(text[index])) {
        index += 1;
    }

    setSelection(Math.max(0, index - 1));
}

function findPreviousWordBoundary(text, from) {
    let index = clamp(from, 0, text.length);

    while (index > 0 && /\s/.test(text[index - 1])) {
        index -= 1;
    }
    while (index > 0 && /\w/.test(text[index - 1])) {
        index -= 1;
    }
    if (index === from) {
        while (index > 0 && /\S/.test(text[index - 1])) {
            index -= 1;
        }
    }

    return index;
}

function findNextWordBoundary(text, from) {
    let index = clamp(from, 0, text.length);

    while (index < text.length && /\s/.test(text[index])) {
        index += 1;
    }
    while (index < text.length && /\w/.test(text[index])) {
        index += 1;
    }
    if (index === from) {
        while (index < text.length && /\S/.test(text[index])) {
            index += 1;
        }
    }

    return index;
}

function moveToLineStart(nonWhitespace = false) {
    const { text, start } = getInputSelection();
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    if (!nonWhitespace) {
        setSelection(lineStart);
        return;
    }

    const lineEnd = text.indexOf('\n', start);
    const safeEnd = lineEnd === -1 ? text.length : lineEnd;
    const line = text.slice(lineStart, safeEnd);
    const offset = line.search(/\S/);
    setSelection(offset === -1 ? lineStart : lineStart + offset);
}

function moveToLineEnd() {
    const { text, end } = getInputSelection();
    const lineEnd = text.indexOf('\n', end);
    setSelection(lineEnd === -1 ? text.length : lineEnd);
}

function moveByLine(direction) {
    const { text, start, end } = getInputSelection();
    const anchor = direction < 0 ? Math.min(start, end) : Math.max(start, end);
    const lineStart = text.lastIndexOf('\n', Math.max(0, anchor - 1)) + 1;
    const lineEndIndex = text.indexOf('\n', anchor);
    const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
    const column = anchor - lineStart;

    if (direction < 0) {
        if (lineStart === 0) {
            setSelection(0);
            return;
        }

        const previousLineEnd = lineStart - 1;
        const previousLineStart = text.lastIndexOf('\n', Math.max(0, previousLineEnd - 1)) + 1;
        const target = Math.min(previousLineStart + column, previousLineEnd);
        setSelection(target);
        return;
    }

    if (lineEnd === text.length) {
        setSelection(text.length);
        return;
    }

    const nextLineStart = lineEnd + 1;
    const nextLineEndIndex = text.indexOf('\n', nextLineStart);
    const nextLineEnd = nextLineEndIndex === -1 ? text.length : nextLineEndIndex;
    const target = Math.min(nextLineStart + column, nextLineEnd);
    setSelection(target);
}

function deleteBackwardCharacter() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    if (start === 0) {
        return;
    }
    applyEditorEdit(`${text.slice(0, start - 1)}${text.slice(start)}`, start - 1);
}

function deleteForwardCharacter() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    if (end >= text.length) {
        return;
    }
    applyEditorEdit(`${text.slice(0, start)}${text.slice(end + 1)}`, start);
}

function deletePreviousWord() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    const boundary = findPreviousWordBoundary(text, start);
    if (boundary === start) {
        return;
    }
    applyEditorEdit(`${text.slice(0, boundary)}${text.slice(start)}`, boundary);
}

function deleteNextWord() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    const boundary = findNextWordBoundary(text, end);
    if (boundary === end) {
        return;
    }
    applyEditorEdit(`${text.slice(0, start)}${text.slice(boundary)}`, start);
}

function killToLineStart() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    if (lineStart === start) {
        return;
    }
    applyEditorEdit(`${text.slice(0, lineStart)}${text.slice(start)}`, lineStart);
}

function killToLineEnd() {
    const { text, start, end } = getInputSelection();
    if (start !== end) {
        applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start);
        return;
    }
    const lineEnd = text.indexOf('\n', end);
    const boundary = lineEnd === -1 ? text.length : lineEnd;
    if (boundary === start) {
        return;
    }
    applyEditorEdit(`${text.slice(0, start)}${text.slice(boundary)}`, start);
}

function deleteCurrentLine() {
    const { text, start } = getInputSelection();
    if (!text.length) {
        return;
    }

    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineBreak = text.indexOf('\n', lineStart);
    let removeStart = lineStart;
    let removeEnd = lineBreak === -1 ? text.length : lineBreak + 1;

    if (lineBreak === -1 && lineStart > 0) {
        removeStart = lineStart - 1;
    }

    const nextValue = `${text.slice(0, removeStart)}${text.slice(removeEnd)}`;
    applyEditorEdit(nextValue, Math.min(removeStart, nextValue.length));
}

function openLine(direction) {
    const { text, start } = getInputSelection();
    if (!text.length) {
        applyEditorEdit('\n', direction > 0 ? 1 : 0);
        return;
    }

    if (direction < 0) {
        const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
        applyEditorEdit(`${text.slice(0, lineStart)}\n${text.slice(lineStart)}`, lineStart);
        return;
    }

    const lineEnd = text.indexOf('\n', start);
    const insertAt = lineEnd === -1 ? text.length : lineEnd + 1;
    applyEditorEdit(`${text.slice(0, insertAt)}\n${text.slice(insertAt)}`, insertAt + 1);
}

function shouldPlayTypingSound(event) {
    if (!refs.typingSoundToggle.checked) {
        return false;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
        return false;
    }

    return event.key.length === 1 || event.key === 'Backspace' || event.key === 'Enter' || event.key === ' ';
}

function recordTyping(chars) {
    const now = Date.now();
    typingEvents.push({ time: now, chars });
    const cutoff = now - 60000;
    typingEvents = typingEvents.filter(entry => entry.time >= cutoff);
}

function updateWritingMetrics() {
    const now = Date.now();
    const cutoff = now - 60000;
    typingEvents = typingEvents.filter(entry => entry.time >= cutoff);

    let wpm = 0;
    if (typingEvents.length) {
        const totalChars = typingEvents.reduce((sum, entry) => sum + entry.chars, 0);
        const windowMs = Math.max(now - typingEvents[0].time, 1000);
        wpm = Math.round((totalChars / 5) / (windowMs / 60000));
    }

    refs.wpmCount.textContent = String(wpm);

    const sessionWords = Math.max(0, countWords(refs.sourceInput.value) - sessionBaselineWords);
    refs.sessionWords.textContent = String(sessionWords);
    refs.sessionStat.hidden = sessionWords < 5;
}

function checkSessionMilestones() {
    const sessionWords = Math.max(0, countWords(refs.sourceInput.value) - sessionBaselineWords);

    for (const milestone of SESSION_MILESTONES) {
        if (sessionWords >= milestone && !sessionMilestones.has(milestone)) {
            sessionMilestones.add(milestone);
            toast(`Nice pace — ${milestone} words revised this session`);
        }
    }
}

function setFocusMode(enabled, persist = true) {
    document.documentElement.dataset.focusMode = enabled ? 'on' : 'off';
    refs.focusModeBtn.setAttribute('aria-pressed', String(enabled));
    refs.focusModeBtn.querySelector('span').textContent = enabled ? 'Split' : 'Focus';

    if (persist) {
        savePrefs();
    }
}

function setTypingSoundUi() {
    const enabled = refs.typingSoundToggle.checked;
    refs.typingSoundStyleWrap.hidden = !enabled;
}

function bindTypingAudioUnlock() {
    const unlock = () => {
        void ensureTypingAudioReady();
    };

    ['pointerdown', 'touchstart', 'keydown'].forEach(eventName => {
        document.addEventListener(eventName, unlock, { capture: true, passive: true });
    });
}

function createTypingAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return null;
    }

    if (!typingAudio) {
        typingAudio = new AudioContextClass();
        typingMasterGain = typingAudio.createGain();
        typingMasterGain.gain.value = 1;
        typingMasterGain.connect(typingAudio.destination);
    }

    return typingAudio;
}

async function ensureTypingAudioReady() {
    const context = createTypingAudioContext();
    if (!context) {
        return null;
    }

    if (context.state !== 'running') {
        try {
            await context.resume();
        } catch (error) {
            void error;
            return null;
        }
    }

    return context.state === 'running' ? context : null;
}

function getTypingOutput(context) {
    return typingMasterGain || context.destination;
}

async function playTypingSound(key, isRepeat = false) {
    if (!refs.typingSoundToggle.checked) {
        return false;
    }

    const nowMs = Date.now();
    const minGap = isRepeat ? 16 : 10;
    if (nowMs - lastKeystrokeSoundAt < minGap) {
        return true;
    }
    lastKeystrokeSoundAt = nowMs;

    try {
        const context = await ensureTypingAudioReady();
        if (!context) {
            maybeShowTypingAudioHint();
            return false;
        }

        const style = refs.typingSoundStyle.value;
        const at = context.currentTime + 0.005;

        playTypingSoundStyle(context, style, key, at);

        return true;
    } catch (error) {
        void error;
        maybeShowTypingAudioHint();
        return false;
    }
}

function maybeShowTypingAudioHint() {
    if (typingAudioUnlockHintShown || !refs.typingSoundToggle.checked) {
        return;
    }

    typingAudioUnlockHintShown = true;
    toast('Click in the editor, then type to hear keystroke sounds');
}

function setGainEnvelope(gain, now, peak, attack = 0.002, release = 0.04) {
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.linearRampToValueAtTime(0.0001, now + release);
}

function playTypingSoundStyle(context, style, key, now) {
    switch (style) {
        case 'piano':
            playPianoTone(context, key, now);
            break;
        case 'soft':
            playSoftClick(context, now);
            break;
        case 'typewriter':
            playTypewriterSound(context, key, now);
            break;
        case 'bubble':
            playBubbleSound(context, key, now);
            break;
        case 'marble':
            playMarbleSound(context, key, now);
            break;
        case 'chime':
            playChimeSound(context, key, now);
            break;
        case 'keystroke':
        default:
            playMechanicalKeystroke(context, key, now);
            break;
    }
}

function playMechanicalKeystroke(context, key, now) {
    const output = getTypingOutput(context);
    const keyCode = String(key || 'a').charCodeAt(0);
    const isBackspace = key === 'Backspace';
    const isEnter = key === 'Enter';

    const clickLength = Math.floor(context.sampleRate * 0.045);
    const clickBuffer = context.createBuffer(1, clickLength, context.sampleRate);
    const clickData = clickBuffer.getChannelData(0);

    for (let index = 0; index < clickLength; index += 1) {
        const decay = Math.exp(-index / (clickLength * (isBackspace ? 0.1 : 0.075)));
        clickData[index] = (Math.random() * 2 - 1) * decay;
    }

    const click = context.createBufferSource();
    click.buffer = clickBuffer;

    const clickFilter = context.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = isEnter ? 2100 : isBackspace ? 1650 : 2400 + (keyCode % 500);
    clickFilter.Q.value = 1.1;

    const clickGain = context.createGain();
    const clickPeak = isBackspace ? 0.28 : isEnter ? 0.32 : 0.38;
    setGainEnvelope(clickGain, now, clickPeak, 0.001, 0.035);

    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(output);
    click.start(now);
    click.stop(now + 0.05);

    const body = context.createOscillator();
    body.type = 'sine';
    const bodyStart = isBackspace ? 130 : isEnter ? 110 : 155 + (keyCode % 35);
    body.frequency.setValueAtTime(bodyStart, now);
    body.frequency.exponentialRampToValueAtTime(bodyStart * 0.55, now + 0.028);

    const bodyGain = context.createGain();
    setGainEnvelope(bodyGain, now, isBackspace ? 0.14 : 0.18, 0.002, 0.04);

    body.connect(bodyGain);
    bodyGain.connect(output);
    body.start(now);
    body.stop(now + 0.05);
}

function playTypewriterSound(context, key, now) {
    const output = getTypingOutput(context);
    const keyCode = String(key || 'a').charCodeAt(0);
    const isBackspace = key === 'Backspace';

    const snapLength = Math.floor(context.sampleRate * 0.06);
    const snapBuffer = context.createBuffer(1, snapLength, context.sampleRate);
    const snapData = snapBuffer.getChannelData(0);

    for (let index = 0; index < snapLength; index += 1) {
        const decay = Math.exp(-index / (snapLength * 0.055));
        snapData[index] = (Math.random() * 2 - 1) * decay;
    }

    const snap = context.createBufferSource();
    snap.buffer = snapBuffer;

    const snapFilter = context.createBiquadFilter();
    snapFilter.type = 'highpass';
    snapFilter.frequency.value = isBackspace ? 900 : 1400;

    const snapGain = context.createGain();
    setGainEnvelope(snapGain, now, isBackspace ? 0.34 : 0.42, 0.001, 0.03);

    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(output);
    snap.start(now);
    snap.stop(now + 0.065);

    const slap = context.createOscillator();
    slap.type = 'square';
    slap.frequency.setValueAtTime(isBackspace ? 95 : 120 + (keyCode % 20), now);
    slap.frequency.exponentialRampToValueAtTime(60, now + 0.02);

    const slapFilter = context.createBiquadFilter();
    slapFilter.type = 'lowpass';
    slapFilter.frequency.value = 320;

    const slapGain = context.createGain();
    setGainEnvelope(slapGain, now, 0.08, 0.001, 0.025);

    slap.connect(slapFilter);
    slapFilter.connect(slapGain);
    slapGain.connect(output);
    slap.start(now);
    slap.stop(now + 0.04);
}

function playBubbleSound(context, key, now) {
    const output = getTypingOutput(context);
    const keyCode = String(key || 'a').charCodeAt(0);
    const pop = context.createOscillator();
    pop.type = 'sine';
    const startFreq = 320 + (keyCode % 120);
    pop.frequency.setValueAtTime(startFreq, now);
    pop.frequency.exponentialRampToValueAtTime(Math.max(startFreq * 0.45, 90), now + 0.07);

    const popGain = context.createGain();
    setGainEnvelope(popGain, now, 0.2, 0.003, 0.09);

    pop.connect(popGain);
    popGain.connect(output);
    pop.start(now);
    pop.stop(now + 0.1);
}

function playMarbleSound(context, key, now) {
    const output = getTypingOutput(context);
    const keyCode = String(key || 'a').charCodeAt(0);
    const tapLength = Math.floor(context.sampleRate * 0.035);
    const tapBuffer = context.createBuffer(1, tapLength, context.sampleRate);
    const tapData = tapBuffer.getChannelData(0);

    for (let index = 0; index < tapLength; index += 1) {
        const decay = Math.exp(-index / (tapLength * 0.12));
        tapData[index] = (Math.random() * 2 - 1) * decay;
    }

    const tap = context.createBufferSource();
    tap.buffer = tapBuffer;

    const tapFilter = context.createBiquadFilter();
    tapFilter.type = 'bandpass';
    tapFilter.frequency.value = 520 + (keyCode % 180);
    tapFilter.Q.value = 0.8;

    const tapGain = context.createGain();
    setGainEnvelope(tapGain, now, 0.26, 0.001, 0.028);

    tap.connect(tapFilter);
    tapFilter.connect(tapGain);
    tapGain.connect(output);
    tap.start(now);
    tap.stop(now + 0.04);
}

function playChimeSound(context, key, now) {
    const output = getTypingOutput(context);
    const base = 620 + (String(key || 'a').charCodeAt(0) % 160);
    const tone = context.createOscillator();
    const shimmer = context.createOscillator();

    tone.type = 'sine';
    shimmer.type = 'triangle';
    tone.frequency.setValueAtTime(base, now);
    shimmer.frequency.setValueAtTime(base * 1.5, now);

    const gain = context.createGain();
    setGainEnvelope(gain, now, 0.14, 0.004, 0.14);

    tone.connect(gain);
    shimmer.connect(gain);
    gain.connect(output);

    tone.start(now);
    shimmer.start(now);
    tone.stop(now + 0.16);
    shimmer.stop(now + 0.16);
}

function playSoftClick(context, now) {
    const output = getTypingOutput(context);
    const click = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    click.type = 'triangle';
    click.frequency.setValueAtTime(920, now);
    click.frequency.exponentialRampToValueAtTime(520, now + 0.03);

    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    setGainEnvelope(gain, now, 0.22, 0.003, 0.05);

    click.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    click.start(now);
    click.stop(now + 0.06);
}

function playPianoTone(context, key, now) {
    const output = getTypingOutput(context);
    const base = pianoFrequency(key);
    const tone = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();

    tone.type = 'sine';
    overtone.type = 'triangle';
    tone.frequency.setValueAtTime(base, now);
    overtone.frequency.setValueAtTime(base * 2, now);

    setGainEnvelope(gain, now, 0.16, 0.008, 0.18);

    tone.connect(gain);
    overtone.connect(gain);
    gain.connect(output);

    tone.start(now);
    overtone.start(now);
    tone.stop(now + 0.2);
    overtone.stop(now + 0.2);
}

function pianoFrequency(key) {
    const code = String(key || 'a').charCodeAt(0);
    const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    return scale[code % scale.length];
}

function scheduleRender() {
    clearTimeout(renderTimer);
    setStatus('Editing', '');
    renderTimer = window.setTimeout(renderNote, 180);
}

function renderNote() {
    clearTimeout(renderTimer);

    const source = refs.sourceInput.value;
    refs.previewOutput.innerHTML = buildPreviewHtml(source, refs.noteTitle.value);

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

function buildPreviewHtml(source, title = '') {
    const normalized = source.replace(/\r\n?/g, '\n');
    const previewTitle = buildPreviewTitle(title);

    if (!normalized.trim()) {
        return `${previewTitle}<div class="empty-preview">Your rendered note will appear here.<br>Paste dictated text in the editor and revise it here.</div>`;
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
    return `${previewTitle}<div class="latex-preview">${parts.join('\n')}</div>`;
}

function buildPreviewTitle(title) {
    const trimmed = String(title || '').trim();
    if (!trimmed || trimmed === 'Untitled LaTeX note') {
        return '';
    }

    return `<h1 class="preview-note-title">${escapeHtml(trimmed)}</h1><p class="preview-note-subtitle">Rendered preview</p>`;
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
    lastSourceValue = input.value;
    localStorage.setItem(STORAGE.source, input.value);
    updateStats();
    updateWritingMetrics();
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
    lastSourceValue = refs.sourceInput.value;
    resetWritingSession();
    localStorage.setItem(STORAGE.title, refs.noteTitle.value);
    localStorage.setItem(STORAGE.source, refs.sourceInput.value);
    updateStats();
    updateWritingMetrics();
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
    lastSourceValue = '';
    resetWritingSession();
    localStorage.setItem(STORAGE.source, '');
    localStorage.setItem(STORAGE.title, refs.noteTitle.value);
    updateStats();
    updateWritingMetrics();
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
        lastSourceValue = refs.sourceInput.value;
        resetWritingSession();
        localStorage.setItem(STORAGE.source, refs.sourceInput.value);
        localStorage.setItem(STORAGE.title, refs.noteTitle.value);
        updateStats();
        updateWritingMetrics();
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

        const copied = await copyPngBlobToClipboard(blob);
        if (copied) {
            setStatus('PNG copied', 'good');
            toast('PNG copied');
            return;
        }

        downloadBlob(blob, `${safeFileName(refs.noteTitle.value)}.png`, 'image/png');
        setStatus('PNG downloaded', 'good');
        toast('Image clipboard is blocked in this browser, so PNG was downloaded');
    } catch (error) {
        void error;
        setStatus('PNG failed', 'warn');
        toast('Could not create the PNG');
    }
}

async function copyPngBlobToClipboard(blob) {
    if (!window.isSecureContext || !navigator.clipboard || !navigator.clipboard.write || !window.ClipboardItem) {
        return false;
    }

    const itemOptions = [
        { 'image/png': blob },
        { 'image/png': Promise.resolve(blob) }
    ];

    for (const option of itemOptions) {
        try {
            await navigator.clipboard.write([new ClipboardItem(option)]);
            return true;
        } catch (error) {
            void error;
        }
    }

    return false;
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

function updateKeybindingIndicator() {
    if (!refs.keybindingIndicator) {
        return;
    }

    const mode = getKeybindingMode();
    let label = 'Keys: Default';

    if (mode === 'emacs') {
        label = 'Keys: Emacs';
    } else if (mode === 'vim') {
        const state = vimMode === 'normal' ? 'NORMAL' : 'INSERT';
        label = `VIM: ${state}`;
    }

    refs.keybindingIndicator.textContent = label;
    refs.keybindingIndicator.dataset.mode = mode;
    refs.keybindingIndicator.dataset.vimState = mode === 'vim' ? vimMode : '';
}

function setEditorSize(size, persist = true) {
    document.documentElement.dataset.editorSize = size;

    if (persist) {
        savePrefs();
    }
}

function setEditorFont(font, persist = true) {
    document.documentElement.dataset.editorFont = font;

    if (persist) {
        savePrefs();
    }
}

function resetWritingSession() {
    typingEvents = [];
    sessionMilestones = new Set();
    sessionBaselineWords = countWords(refs.sourceInput.value);
}

function savePrefs() {
    const prefs = {
        theme: document.documentElement.dataset.theme || 'dark',
        livePreview: refs.livePreviewToggle.checked,
        editorSize: refs.editorSize.value,
        editorFont: refs.editorFont.value,
        keybindingMode: refs.keybindingMode.value,
        typingSound: refs.typingSoundToggle.checked,
        typingSoundStyle: refs.typingSoundStyle.value,
        focusMode: document.documentElement.dataset.focusMode === 'on'
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

/* ============================================================
   Find & Replace
   ============================================================ */

const findState = {
    matches: [],
    activeIndex: -1,
    lastQuery: ''
};

function bindFindPanel() {
    refs.findInput.addEventListener('input', updateFindMatches);
    refs.replaceInput.addEventListener('input', updateReplaceState);
    refs.findCaseSensitive.addEventListener('change', updateFindMatches);
    refs.findWholeWord.addEventListener('change', updateFindMatches);
    refs.findRegex.addEventListener('change', updateFindMatches);

    refs.findNextBtn.addEventListener('click', () => stepFind(1));
    refs.findPrevBtn.addEventListener('click', () => stepFind(-1));
    refs.replaceOneBtn.addEventListener('click', replaceOne);
    refs.replaceAllBtn.addEventListener('click', replaceAll);
    refs.findCloseBtn.addEventListener('click', closeFindPanel);

    refs.findPanel.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeFindPanel();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            stepFind(event.shiftKey ? -1 : 1);
            return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
            event.preventDefault();
            stepFind(event.shiftKey ? -1 : 1);
        }
    });

    window.addEventListener('resize', () => {
        if (!refs.findPanel.hidden) {
            renderMatchHighlights();
        }
    });
}

function openFindPanel(focusReplace) {
    refs.findPanel.hidden = false;
    refreshIcons();
    const selected = getSelectionText();
    if (selected && !selected.includes('\n')) {
        refs.findInput.value = selected;
    }
    updateFindMatches();
    (focusReplace ? refs.replaceInput : refs.findInput).focus();
    (focusReplace ? refs.replaceInput : refs.findInput).select();
}

function closeFindPanel() {
    refs.findPanel.hidden = true;
    findState.matches = [];
    findState.activeIndex = -1;
    findState.lastQuery = '';
    renderMatchHighlights();
    refs.sourceInput.focus();
}

function buildFindRegex() {
    const query = refs.findInput.value;
    if (!query) {
        return null;
    }

    const flags = refs.findCaseSensitive.checked ? 'g' : 'gi';
    let pattern;

    if (refs.findRegex.checked) {
        try {
            pattern = query;
        } catch (error) {
            return null;
        }
    } else {
        pattern = escapeRegex(query);
        if (refs.findWholeWord.checked) {
            pattern = `\\b${pattern}\\b`;
        }
    }

    try {
        return new RegExp(pattern, flags);
    } catch (error) {
        return null;
    }
}

function updateFindMatches() {
    const regex = buildFindRegex();
    const text = refs.sourceInput.value;

    if (!regex || !refs.findInput.value) {
        findState.matches = [];
        findState.activeIndex = -1;
        findState.lastQuery = '';
        refs.findCount.textContent = '0 / 0';
        renderMatchHighlights();
        return;
    }

    if (findState.lastQuery !== refs.findInput.value) {
        findState.activeIndex = -1;
        findState.lastQuery = refs.findInput.value;
    }

    findState.matches = [];
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
        findState.matches.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
        if (match.index === regex.lastIndex) {
            regex.lastIndex += 1;
        }
    }

    if (findState.activeIndex === -1 && findState.matches.length) {
        findState.activeIndex = 0;
    }
    if (findState.activeIndex >= findState.matches.length) {
        findState.activeIndex = findState.matches.length - 1;
    }

    refs.findCount.textContent = findState.matches.length
        ? `${findState.activeIndex + 1} / ${findState.matches.length}`
        : '0 / 0';

    renderMatchHighlights();
    if (findState.matches.length) {
        scrollToActiveMatch();
    }
}

function updateReplaceState() {
    // placeholder for future state hooks
}

function stepFind(direction) {
    if (!findState.matches.length) {
        updateFindMatches();
        return;
    }
    const total = findState.matches.length;
    findState.activeIndex = (findState.activeIndex + direction + total) % total;
    refs.findCount.textContent = `${findState.activeIndex + 1} / ${total}`;
    renderMatchHighlights();
    scrollToActiveMatch();
    selectActiveMatch();
}

function selectActiveMatch() {
    const match = findState.matches[findState.activeIndex];
    if (!match) return;
    refs.sourceInput.focus();
    refs.sourceInput.setSelectionRange(match.start, match.end);
}

function scrollToActiveMatch() {
    const match = findState.matches[findState.activeIndex];
    if (!match) return;
    const before = refs.sourceInput.value.slice(0, match.start);
    const lineCount = before.split('\n').length;
    refs.sourceInput.scrollTop = Math.max(0, (lineCount - 4) * getEditorLineHeight());
}

function replaceOne() {
    if (!findState.matches.length) {
        toast('No matches');
        return;
    }
    const match = findState.matches[findState.activeIndex];
    if (!match) return;
    const replacement = refs.replaceInput.value;
    const input = refs.sourceInput;
    const value = input.value;
    const next = `${value.slice(0, match.start)}${replacement}${value.slice(match.end)}`;
    const delta = replacement.length - match.text.length;

    input.value = next;
    input.setSelectionRange(match.start, match.start + replacement.length);
    lastSourceValue = input.value;
    localStorage.setItem(STORAGE.source, input.value);
    updateStats();
    updateWritingMetrics();
    markSaved();
    if (refs.livePreviewToggle.checked) scheduleRender();

    // Shift subsequent matches by delta, then re-scan to keep regex fresh.
    for (let i = findState.activeIndex + 1; i < findState.matches.length; i += 1) {
        findState.matches[i].start += delta;
        findState.matches[i].end += delta;
    }
    updateFindMatches();
    if (findState.matches.length) {
        selectActiveMatch();
        scrollToActiveMatch();
    }
}

function replaceAll() {
    if (!findState.matches.length) {
        toast('No matches');
        return;
    }
    const regex = buildFindRegex();
    if (!regex) return;
    const replacement = refs.replaceInput.value;
    const input = refs.sourceInput;
    const value = input.value;

    let count = 0;
    const next = value.replace(regex, () => {
        count += 1;
        return replacement;
    });

    if (count === 0) {
        toast('No matches');
        return;
    }

    input.value = next;
    lastSourceValue = input.value;
    localStorage.setItem(STORAGE.source, input.value);
    updateStats();
    updateWritingMetrics();
    markSaved();
    if (refs.livePreviewToggle.checked) scheduleRender();

    updateFindMatches();
    toast(`Replaced ${count} occurrence${count === 1 ? '' : 's'}`);
}

function renderMatchHighlights() {
    const layer = refs.matchHighlightLayer;
    layer.innerHTML = '';

    if (!findState.matches.length || refs.findPanel.hidden) {
        return;
    }

    const mirror = buildEditorMirror();
    findState.matches.forEach((match, index) => {
        const rect = mirror.rectForRange(match.start, match.end);
        if (!rect) return;
        const highlight = document.createElement('div');
        highlight.className = 'match-highlight' + (index === findState.activeIndex ? ' active' : '');
        highlight.style.left = `${rect.left}px`;
        highlight.style.top = `${rect.top}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        layer.appendChild(highlight);
    });
}

function buildEditorMirror() {
    const textarea = refs.sourceInput;
    const computed = window.getComputedStyle(textarea);
    const props = [
        'box-sizing', 'width', 'height', 'padding-top', 'padding-right',
        'padding-bottom', 'padding-left', 'border-top-width', 'border-right-width',
        'border-bottom-width', 'border-left-width', 'font-family', 'font-size',
        'font-weight', 'line-height', 'letter-spacing', 'tab-size', 'white-space',
        'word-wrap', 'word-break', 'text-wrap'
    ];

    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.overflow = 'hidden';
    mirror.style.top = '0';
    mirror.style.left = '0';

    props.forEach(prop => {
        mirror.style.setProperty(prop, computed.getPropertyValue(prop));
    });

    mirror.textContent = textarea.value + '\u200b';
    textarea.parentElement.appendChild(mirror);

    const range = document.createRange();

    function rectForRange(start, end) {
        const textNode = mirror.firstChild;
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
        const maxLen = textNode.nodeValue.length;
        try {
            range.setStart(textNode, Math.min(start, maxLen));
            range.setEnd(textNode, Math.min(end, maxLen));
            const rect = range.getBoundingClientRect();
            const parentRect = mirror.getBoundingClientRect();
            return {
                left: rect.left - parentRect.left,
                top: rect.top - parentRect.top + textarea.scrollTop,
                width: rect.width,
                height: rect.height
            };
        } catch (error) {
            return null;
        }
    }

    function dispose() {
        mirror.remove();
    }

    return { rectForRange, dispose };
}

/* ============================================================
   Read Aloud (text-to-speech)
   ============================================================ */

const ttsState = {
    utterance: null,
    active: false,
    tokens: [],
    tokenIndex: 0
};

function toggleReadAloud() {
    if (ttsState.active) {
        stopReadAloud();
        return;
    }
    startReadAloud();
}

function startReadAloud() {
    if (!('speechSynthesis' in window)) {
        toast('Speech synthesis is not supported in this browser');
        return;
    }

    const text = refs.sourceInput.value.trim();
    if (!text) {
        toast('Nothing to read');
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(stripLatexForSpeech(text));
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => /en[-_]/i.test(voice.lang));
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    utterance.rate = 1;
    utterance.pitch = 1;

    ttsState.tokens = tokenizeForHighlight(text);
    ttsState.tokenIndex = 0;
    ttsState.active = true;
    ttsState.utterance = utterance;

    utterance.onboundary = event => {
        if (event.name !== 'word') return;
        advanceTtsHighlight(event.charIndex);
    };
    utterance.onend = stopReadAloud;
    utterance.onerror = stopReadAloud;

    refs.readAloudBtn.setAttribute('aria-pressed', 'true');
    refs.readAloudBtn.querySelector('span').textContent = 'Stop';
    setStatus('Reading aloud', 'good');
    highlightTtsToken(0);
    window.speechSynthesis.speak(utterance);
}

function stopReadAloud() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    ttsState.active = false;
    ttsState.utterance = null;
    clearTtsHighlight();
    refs.readAloudBtn.setAttribute('aria-pressed', 'false');
    refs.readAloudBtn.querySelector('span').textContent = 'Read';
    setStatus('Ready', '');
}

function stripLatexForSpeech(text) {
    return text
        .replace(/\\begin\{[^}]+\}/g, '')
        .replace(/\\end\{[^}]+\}/g, '')
        .replace(/\\item\s*/g, '')
        .replace(/\\(textbf|textit|emph|underline|texttt)\{([^{}]*)\}/g, '$2')
        .replace(/\\(section|subsection|subsubsection|paragraph)\*?\{([^{}]*)\}/g, '$2. ')
        .replace(/\\(cite|ref|label)\{[^{}]*\}/g, '')
        .replace(/\\(LaTeX|TeX|quad|,|newline)/g, ' ')
        .replace(/\\\\/g, '. ')
        .replace(/\$[^$]*\$/g, ' math expression ')
        .replace(/\$\$[\s\S]*?\$\$/g, ' display math ')
        .replace(/\\\[[\s\S]*?\\\]/g, ' display math ')
        .replace(/\\\([\s\S]*?\\\)/g, ' math expression ')
        .replace(/\\[a-zA-Z]+/g, ' ')
        .replace(/[{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeForHighlight(text) {
    const cleaned = text
        .replace(/\\begin\{[^}]+\}/g, ' ')
        .replace(/\\end\{[^}]+\}/g, ' ')
        .replace(/\\item\s*/g, ' ')
        .replace(/\\(textbf|textit|emph|underline|texttt)\{([^{}]*)\}/g, '$2')
        .replace(/\\(section|subsection|subsubsection|paragraph)\*?\{([^{}]*)\}/g, '$2')
        .replace(/\\(cite|ref|label)\{[^{}]*\}/g, ' ')
        .replace(/\$[^$]*\$/g, ' math ')
        .replace(/\$\$[\s\S]*?\$\$/g, ' math ')
        .replace(/\\\[[\s\S]*?\\\]/g, ' math ')
        .replace(/\\\([\s\S]*?\\\)/g, ' math ');

    const tokens = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
        tokens.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
    }
    return tokens;
}

function advanceTtsHighlight(charIndex) {
    let target = 0;
    for (let i = 0; i < ttsState.tokens.length; i += 1) {
        if (ttsState.tokens[i].start >= charIndex) {
            target = i;
            break;
        }
        target = i;
    }
    highlightTtsToken(target);
}

function highlightTtsToken(index) {
    ttsState.tokenIndex = index;
    clearTtsHighlight();
    const token = ttsState.tokens[index];
    if (!token) return;

    const preview = refs.previewOutput;
    const walker = document.createTreeWalker(preview, NodeFilter.SHOW_TEXT, null);
    let node;
    let consumed = 0;
    while ((node = walker.nextNode())) {
        const len = node.nodeValue.length;
        if (consumed + len >= token.start) {
            const localStart = Math.max(0, token.start - consumed);
            const localEnd = Math.min(len, token.end - consumed);
            const span = document.createElement('span');
            span.className = 'tts-word active';
            const range = document.createRange();
            range.setStart(node, localStart);
            range.setEnd(node, localEnd);
            range.surroundContents(span);
            span.scrollIntoView({ block: 'center', behavior: 'smooth' });
            return;
        }
        consumed += len;
    }
}

function clearTtsHighlight() {
    const preview = refs.previewOutput;
    preview.querySelectorAll('.tts-word').forEach(span => {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.normalize();
        span.remove();
    });
}

/* ============================================================
   Synonym lookup (Datamuse API)
   ============================================================ */

let synonymAbort = null;

function bindSynonymPopover() {
    refs.synonymCloseBtn.addEventListener('click', closeSynonymPopover);
    refs.sourceInput.addEventListener('dblclick', event => {
        const word = getWordAtCaret();
        if (word) {
            openSynonymPopover(word, event);
        }
    });
    document.addEventListener('click', event => {
        if (refs.synonymPopover.hidden) return;
        if (refs.synonymPopover.contains(event.target)) return;
        if (event.target === refs.sourceInput) return;
        closeSynonymPopover();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !refs.synonymPopover.hidden) {
            closeSynonymPopover();
        }
    });
}

function getWordAtCaret() {
    const input = refs.sourceInput;
    const value = input.value;
    const pos = input.selectionStart;
    if (pos !== input.selectionEnd) {
        const selected = value.slice(input.selectionStart, input.selectionEnd);
        if (/^[A-Za-z][A-Za-z'-]*$/.test(selected)) return selected;
    }
    let start = pos;
    let end = pos;
    while (start > 0 && /[A-Za-z'-]/.test(value[start - 1])) start -= 1;
    while (end < value.length && /[A-Za-z'-]/.test(value[end])) end += 1;
    const word = value.slice(start, end);
    return /^[A-Za-z][A-Za-z'-]*$/.test(word) ? word : '';
}

async function openSynonymPopover(word, event) {
    refs.synonymPopover.hidden = false;
    refs.synonymWord.textContent = word.toLowerCase();
    refs.synonymBody.innerHTML = '<span class="synonym-empty">Loading synonyms…</span>';
    positionSynonymPopover(event);

    if (synonymAbort) {
        synonymAbort.abort();
    }
    const controller = new AbortController();
    synonymAbort = controller;

    try {
        const response = await fetch(
            `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&ml=${encodeURIComponent(word)}&max=24`,
            { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        renderSynonyms(word, data);
    } catch (error) {
        if (error.name === 'AbortError') return;
        refs.synonymBody.innerHTML = '<span class="synonym-empty">Could not fetch synonyms. Check your connection.</span>';
    }
}

function renderSynonyms(word, data) {
    const synonyms = data.filter(item => item.tags && item.tags.includes('syn')).slice(0, 12);
    const similar = data.filter(item => !item.tags || !item.tags.includes('syn')).slice(0, 12);

    const body = refs.synonymBody;
    body.innerHTML = '';

    if (!synonyms.length && !similar.length) {
        body.innerHTML = '<span class="synonym-empty">No synonyms found.</span>';
        return;
    }

    if (synonyms.length) {
        const group = document.createElement('div');
        group.className = 'synonym-group';
        group.innerHTML = '<span class="synonym-group-label">Synonyms</span>';
        const chips = document.createElement('div');
        synonyms.forEach(item => {
            chips.appendChild(createSynonymChip(item.word));
        });
        group.appendChild(chips);
        body.appendChild(group);
    }

    if (similar.length) {
        const group = document.createElement('div');
        group.className = 'synonym-group';
        group.innerHTML = '<span class="synonym-group-label">Related words</span>';
        const chips = document.createElement('div');
        similar.forEach(item => {
            chips.appendChild(createSynonymChip(item.word));
        });
        group.appendChild(chips);
        body.appendChild(group);
    }
}

function createSynonymChip(word) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'synonym-chip';
    chip.textContent = word;
    chip.addEventListener('click', () => {
        replaceWordAtCaret(word);
        closeSynonymPopover();
        toast(`Replaced with "${word}"`);
    });
    return chip;
}

function replaceWordAtCaret(replacement) {
    const input = refs.sourceInput;
    const value = input.value;
    const pos = input.selectionStart;
    let start = pos;
    let end = pos;
    while (start > 0 && /[A-Za-z'-]/.test(value[start - 1])) start -= 1;
    while (end < value.length && /[A-Za-z'-]/.test(value[end])) end += 1;
    if (start === end) return;

    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    input.value = next;
    input.setSelectionRange(start, start + replacement.length);
    lastSourceValue = input.value;
    localStorage.setItem(STORAGE.source, input.value);
    updateStats();
    updateWritingMetrics();
    markSaved();
    if (refs.livePreviewToggle.checked) scheduleRender();
    input.focus();
}

function positionSynonymPopover(event) {
    const popover = refs.synonymPopover;
    const rect = refs.sourceInput.getBoundingClientRect();
    let x = event ? event.clientX : rect.left + 40;
    let y = event ? event.clientY : rect.top + 40;

    popover.style.left = '0px';
    popover.style.top = '0px';
    const popRect = popover.getBoundingClientRect();
    const margin = 12;

    if (x + popRect.width + margin > window.innerWidth) {
        x = window.innerWidth - popRect.width - margin;
    }
    if (y + popRect.height + margin > window.innerHeight) {
        y = window.innerHeight - popRect.height - margin;
    }
    x = Math.max(margin, x);
    y = Math.max(margin, y);

    popover.style.left = `${x}px`;
    popover.style.top = `${y}px`;
}

function closeSynonymPopover() {
    refs.synonymPopover.hidden = true;
    if (synonymAbort) {
        synonymAbort.abort();
        synonymAbort = null;
    }
}

/* ============================================================
   Shortcuts help overlay
   ============================================================ */

const SHORTCUT_GROUPS = [
    {
        title: 'Core',
        items: [
            { keys: ['Ctrl', 'Enter'], label: 'Render note' },
            { keys: ['Ctrl', 'S'], label: 'Save (auto-saved anyway)' },
            { keys: ['Ctrl', 'E'], label: 'Toggle focus mode' },
            { keys: ['Ctrl', '/'], label: 'Show this help' }
        ]
    },
    {
        title: 'Find & Replace',
        items: [
            { keys: ['Ctrl', 'F'], label: 'Open find' },
            { keys: ['Ctrl', 'H'], label: 'Open replace' },
            { keys: ['Enter'], label: 'Next match' },
            { keys: ['Shift', 'Enter'], label: 'Previous match' },
            { keys: ['Esc'], label: 'Close panel' }
        ]
    },
    {
        title: 'Read & Vocabulary',
        items: [
            { keys: ['Ctrl', 'R'], label: 'Read aloud / stop' },
            { keys: ['Double-click'], label: 'Look up synonyms' }
        ]
    },
    {
        title: 'Snippets',
        items: [
            { keys: ['Ctrl', 'B'], label: 'Bold (\\textbf)' },
            { keys: ['Ctrl', 'I'], label: 'Italic (\\textit)' },
            { keys: ['Tab'], label: 'Indent' }
        ]
    },
    {
        title: 'Word motion (Alt)',
        items: [
            { keys: ['Alt', 'B'], label: 'Back one word' },
            { keys: ['Alt', 'F'], label: 'Forward one word' },
            { keys: ['Alt', '⌫'], label: 'Delete previous word' }
        ]
    },
    {
        title: 'Modes',
        items: [
            { keys: ['Esc'], label: 'Vim normal mode' },
            { keys: ['i'], label: 'Vim insert mode' },
            { keys: ['Ctrl', 'A'], label: 'Emacs line start' },
            { keys: ['Ctrl', 'E'], label: 'Emacs line end' }
        ]
    }
];

function bindHelpOverlay() {
    refs.helpCloseBtn.addEventListener('click', toggleHelpOverlay);
    refs.helpOverlay.addEventListener('click', event => {
        if (event.target === refs.helpOverlay) {
            toggleHelpOverlay();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !refs.helpOverlay.hidden) {
            toggleHelpOverlay();
        }
    });
    renderHelpGrid();
}

function renderHelpGrid() {
    refs.helpGrid.innerHTML = '';
    SHORTCUT_GROUPS.forEach(group => {
        const section = document.createElement('div');
        section.className = 'help-section';
        const heading = document.createElement('h3');
        heading.textContent = group.title;
        const list = document.createElement('ul');
        group.items.forEach(item => {
            const li = document.createElement('li');
            const label = document.createElement('span');
            label.textContent = item.label;
            const keys = document.createElement('span');
            keys.className = 'kbd-group';
            item.keys.forEach((key, i) => {
                if (i > 0) {
                    keys.appendChild(document.createTextNode(' '));
                }
                const kbd = document.createElement('span');
                kbd.className = 'kbd';
                kbd.textContent = key;
                keys.appendChild(kbd);
            });
            li.append(label, keys);
            list.appendChild(li);
        });
        section.append(heading, list);
        refs.helpGrid.appendChild(section);
    });
}

function toggleHelpOverlay() {
    const isOpening = refs.helpOverlay.hidden;
    refs.helpOverlay.hidden = !isOpening;
    if (isOpening) {
        refreshIcons();
        refs.helpCloseBtn.focus();
    } else {
        refs.sourceInput.focus();
    }
}
