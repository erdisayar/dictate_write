const STORAGE = {
    tabs: 'dictate_write_tabs_v2',
    activeTabId: 'dictate_write_active_tab_id',
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

const SAMPLE_SCRATCHPAD = String.raw`\section{Dictated Scratchpad}
Paste dictated paragraphs here. You can easily edit any words misheard by speech recognition and insert math inline:

Let $x \in \mathbb{R}^d$ denote the input vector and $y \in \{-1, +1\}$ denote the target label.

When you have a new idea or want to switch topics, click the \textbf{+ New Tab} button above or press \texttt{Ctrl+Alt+T}.`;

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

const LATEX_SYMBOLS = [
    // Greek Lowercase
    { category: 'greek', code: '\\alpha', label: 'alpha' },
    { category: 'greek', code: '\\beta', label: 'beta' },
    { category: 'greek', code: '\\gamma', label: 'gamma' },
    { category: 'greek', code: '\\delta', label: 'delta' },
    { category: 'greek', code: '\\epsilon', label: 'epsilon' },
    { category: 'greek', code: '\\varepsilon', label: 'varepsilon' },
    { category: 'greek', code: '\\zeta', label: 'zeta' },
    { category: 'greek', code: '\\eta', label: 'eta' },
    { category: 'greek', code: '\\theta', label: 'theta' },
    { category: 'greek', code: '\\vartheta', label: 'vartheta' },
    { category: 'greek', code: '\\iota', label: 'iota' },
    { category: 'greek', code: '\\kappa', label: 'kappa' },
    { category: 'greek', code: '\\lambda', label: 'lambda' },
    { category: 'greek', code: '\\mu', label: 'mu' },
    { category: 'greek', code: '\\nu', label: 'nu' },
    { category: 'greek', code: '\\xi', label: 'xi' },
    { category: 'greek', code: '\\pi', label: 'pi' },
    { category: 'greek', code: '\\rho', label: 'rho' },
    { category: 'greek', code: '\\sigma', label: 'sigma' },
    { category: 'greek', code: '\\tau', label: 'tau' },
    { category: 'greek', code: '\\upsilon', label: 'upsilon' },
    { category: 'greek', code: '\\phi', label: 'phi' },
    { category: 'greek', code: '\\varphi', label: 'varphi' },
    { category: 'greek', code: '\\chi', label: 'chi' },
    { category: 'greek', code: '\\psi', label: 'psi' },
    { category: 'greek', code: '\\omega', label: 'omega' },

    // Greek Uppercase
    { category: 'greek', code: '\\Gamma', label: 'Gamma' },
    { category: 'greek', code: '\\Delta', label: 'Delta' },
    { category: 'greek', code: '\\Theta', label: 'Theta' },
    { category: 'greek', code: '\\Lambda', label: 'Lambda' },
    { category: 'greek', code: '\\Xi', label: 'Xi' },
    { category: 'greek', code: '\\Pi', label: 'Pi' },
    { category: 'greek', code: '\\Sigma', label: 'Sigma' },
    { category: 'greek', code: '\\Phi', label: 'Phi' },
    { category: 'greek', code: '\\Psi', label: 'Psi' },
    { category: 'greek', code: '\\Omega', label: 'Omega' },

    // Calculus & Sums
    { category: 'calculus', code: '\\sum_{i=1}^{n}', label: 'summation' },
    { category: 'calculus', code: '\\prod_{i=1}^{n}', label: 'product' },
    { category: 'calculus', code: '\\int', label: 'integral' },
    { category: 'calculus', code: '\\int_{a}^{b}', label: 'definite integral' },
    { category: 'calculus', code: '\\iint', label: 'double integral' },
    { category: 'calculus', code: '\\oint', label: 'contour integral' },
    { category: 'calculus', code: '\\frac{\\partial f}{\\partial x}', label: 'partial derivative' },
    { category: 'calculus', code: '\\frac{d f}{d x}', label: 'derivative' },
    { category: 'calculus', code: '\\nabla', label: 'gradient nabla' },
    { category: 'calculus', code: '\\lim_{x \\to \\infty}', label: 'limit' },
    { category: 'calculus', code: '\\infty', label: 'infinity' },
    { category: 'calculus', code: '\\sqrt{x}', label: 'square root' },

    // Relations & Sets
    { category: 'relations', code: '\\le', label: 'less or equal' },
    { category: 'relations', code: '\\ge', label: 'greater or equal' },
    { category: 'relations', code: '\\neq', label: 'not equal' },
    { category: 'relations', code: '\\approx', label: 'approximately' },
    { category: 'relations', code: '\\equiv', label: 'equivalent' },
    { category: 'relations', code: '\\pm', label: 'plus minus' },
    { category: 'relations', code: '\\times', label: 'times' },
    { category: 'relations', code: '\\cdot', label: 'cdot dot product' },
    { category: 'relations', code: '\\in', label: 'element of in' },
    { category: 'relations', code: '\\notin', label: 'not in' },
    { category: 'relations', code: '\\subset', label: 'subset' },
    { category: 'relations', code: '\\subseteq', label: 'subset or equal' },
    { category: 'relations', code: '\\cup', label: 'union' },
    { category: 'relations', code: '\\cap', label: 'intersection' },
    { category: 'relations', code: '\\emptyset', label: 'empty set' },

    // Arrows & Logic
    { category: 'arrows', code: '\\to', label: 'right arrow to' },
    { category: 'arrows', code: '\\gets', label: 'left arrow gets' },
    { category: 'arrows', code: '\\implies', label: 'implies' },
    { category: 'arrows', code: '\\iff', label: 'if and only if' },
    { category: 'arrows', code: '\\therefore', label: 'therefore' },
    { category: 'arrows', code: '\\because', label: 'because' },
    { category: 'arrows', code: '\\forall', label: 'for all' },
    { category: 'arrows', code: '\\exists', label: 'exists' },
    { category: 'arrows', code: '\\land', label: 'logical and' },
    { category: 'arrows', code: '\\lor', label: 'logical or' },
    { category: 'arrows', code: '\\neg', label: 'negation not' },

    // Matrices & Delimiters
    { category: 'delimiters', code: '\\frac{a}{b}', label: 'fraction' },
    { category: 'delimiters', code: '\\binom{n}{k}', label: 'binomial coefficient' },
    { category: 'delimiters', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', label: 'parentheses matrix' },
    { category: 'delimiters', code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', label: 'bracket matrix' },
    { category: 'delimiters', code: '\\mathbf{x}', label: 'bold vector' },
    { category: 'delimiters', code: '\\mathbb{R}', label: 'real numbers' },
    { category: 'delimiters', code: '\\mathcal{L}', label: 'calligraphic loss' },
    { category: 'delimiters', code: '\\hat{y}', label: 'hat estimator' },
    { category: 'delimiters', code: '\\bar{x}', label: 'bar mean' }
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

// Multi-Tab Documents State
let tabs = [];
let activeTabId = '';

// Synced scrolling state
let isSyncScrolling = true;
let isScrollingEditor = false;
let isScrollingPreview = false;

// Command palette state
let commandPaletteItems = [];
let commandPaletteActiveIndex = 0;

const SESSION_MILESTONES = [50, 100, 250, 500, 1000];
const PASTE_CHAR_THRESHOLD = 24;

document.addEventListener('DOMContentLoaded', init);

function init() {
    bindRefs();
    const prefs = loadPrefs();

    refs.livePreviewToggle.checked = prefs.livePreview !== false;
    refs.editorSize.value = prefs.editorSize || document.documentElement.dataset.editorSize || 'large';
    refs.editorFont.value = prefs.editorFont || document.documentElement.dataset.editorFont || 'literata';
    refs.keybindingMode.value = prefs.keybindingMode || 'default';
    refs.typingSoundToggle.checked = prefs.typingSound === undefined ? true : Boolean(prefs.typingSound);
    refs.typingSoundStyle.value = prefs.typingSoundStyle || 'keystroke';

    setTheme(prefs.theme || document.documentElement.dataset.theme || 'dark', false);
    setEditorSize(refs.editorSize.value, false);
    setEditorFont(refs.editorFont.value, false);
    setFocusMode(prefs.focusMode === true, false);
    setTypingSoundUi();
    updateKeybindingIndicator();

    bindEvents();
    initSymbolPalette();
    initSyncedScroll();
    refreshIcons();

    // Load multi-document tabs
    loadTabs();

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
        'backupFileInput',
        'toastContainer',

        // Tabs
        'tabsList',
        'addTabBtn',
        'duplicateTabBtn',
        'exportBackupBtn',
        'importBackupBtn',

        // Palette & Shortcuts
        'openCommandPaletteBtn',
        'openSymbolPaletteBtn',
        'shortcutsBtn',
        'syncedScrollBtn',

        // Symbol Palette Modal
        'symbolModalBackdrop',
        'closeSymbolModalBtn',
        'symbolSearchInput',
        'symbolCategoryTabs',
        'symbolGrid',

        // Command Palette Modal
        'commandModalBackdrop',
        'commandSearchInput',
        'commandList',

        // Shortcuts Modal
        'shortcutsModalBackdrop',
        'closeShortcutsModalBtn'
    ].forEach(id => {
        refs[id] = document.getElementById(id);
    });
}

function bindEvents() {
    refs.noteTitle.addEventListener('input', () => {
        const currentTab = getActiveTab();
        if (currentTab) {
            currentTab.title = refs.noteTitle.value.trim() || 'Untitled Topic';
            updateActiveTabLabel();
            saveTabs();
        }
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
    refs.backupFileInput.addEventListener('change', handleImportBackupFile);

    refs.downloadTexBtn.addEventListener('click', downloadTex);
    refs.downloadHtmlBtn.addEventListener('click', downloadHtml);
    refs.downloadPdfBtn.addEventListener('click', downloadPdf);
    refs.copyPngBtn.addEventListener('click', copyPng);
    refs.copySvgBtn.addEventListener('click', copySvg);
    refs.clearBtn.addEventListener('click', clearNote);
    refs.copySourceBtn.addEventListener('click', () => copyText(refs.sourceInput.value, 'Source copied'));
    refs.copyPreviewBtn.addEventListener('click', copyPreviewText);

    // Document Tabs Strip Actions
    refs.addTabBtn.addEventListener('click', () => createTab());
    refs.duplicateTabBtn.addEventListener('click', duplicateCurrentTab);
    refs.exportBackupBtn.addEventListener('click', exportTabsBackup);
    refs.importBackupBtn.addEventListener('click', () => refs.backupFileInput.click());

    // LaTeX Symbol Palette
    refs.openSymbolPaletteBtn.addEventListener('click', openSymbolModal);
    refs.closeSymbolModalBtn.addEventListener('click', closeSymbolModal);
    refs.symbolModalBackdrop.addEventListener('click', event => {
        if (event.target === refs.symbolModalBackdrop) closeSymbolModal();
    });

    // Command Palette
    refs.openCommandPaletteBtn.addEventListener('click', openCommandPalette);
    refs.commandModalBackdrop.addEventListener('click', event => {
        if (event.target === refs.commandModalBackdrop) closeCommandPalette();
    });
    refs.commandSearchInput.addEventListener('input', () => renderCommandPaletteItems(refs.commandSearchInput.value));
    refs.commandSearchInput.addEventListener('keydown', handleCommandPaletteKeydown);

    // Synced Scrolling Toggle
    refs.syncedScrollBtn.addEventListener('click', toggleSyncedScroll);

    // Shortcuts Modal
    refs.shortcutsBtn.addEventListener('click', openShortcutsModal);
    refs.closeShortcutsModalBtn.addEventListener('click', closeShortcutsModal);
    refs.shortcutsModalBackdrop.addEventListener('click', event => {
        if (event.target === refs.shortcutsModalBackdrop) closeShortcutsModal();
    });

    // Toggles & Preferences
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

    // Global Keybindings
    document.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(event) {
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;

    // Ctrl+Enter: Render Note
    if (isCtrlOrMeta && event.key === 'Enter') {
        event.preventDefault();
        renderNote();
        return;
    }

    // Ctrl+K: Command Palette
    if (isCtrlOrMeta && event.key.toLowerCase() === 'k' && !event.altKey && getKeybindingMode() !== 'emacs') {
        event.preventDefault();
        openCommandPalette();
        return;
    }

    // Ctrl+Alt+T or Ctrl+Alt+N: New Topic Tab
    if (isCtrlOrMeta && event.altKey && (event.key.toLowerCase() === 't' || event.key.toLowerCase() === 'n')) {
        event.preventDefault();
        createTab();
        return;
    }

    // Ctrl+Alt+W: Close Current Tab
    if (isCtrlOrMeta && event.altKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        closeTab(activeTabId);
        return;
    }

    // Ctrl+/: LaTeX Symbol Palette
    if (isCtrlOrMeta && event.key === '/') {
        event.preventDefault();
        openSymbolModal();
        return;
    }

    // Escape: Close modals
    if (event.key === 'Escape') {
        if (!refs.commandModalBackdrop.hidden) {
            closeCommandPalette();
            return;
        }
        if (!refs.symbolModalBackdrop.hidden) {
            closeSymbolModal();
            return;
        }
        if (!refs.shortcutsModalBackdrop.hidden) {
            closeShortcutsModal();
            return;
        }
    }
}

// ==========================================
// MULTI-TOPIC DOCUMENT TABS ENGINE
// ==========================================

function loadTabs() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE.tabs) || '[]');
        if (Array.isArray(saved) && saved.length > 0) {
            tabs = saved;
            const targetId = localStorage.getItem(STORAGE.activeTabId);
            const found = tabs.find(t => t.id === targetId);
            activeTabId = found ? found.id : tabs[0].id;
        } else {
            // Seed two initial tabs for a rich out-of-the-box multi-topic experience
            tabs = [
                {
                    id: 'tab_' + Date.now().toString(36) + '_1',
                    title: 'Short derivation',
                    content: SAMPLE_NOTE,
                    updatedAt: Date.now()
                },
                {
                    id: 'tab_' + Date.now().toString(36) + '_2',
                    title: 'Dictated Scratchpad',
                    content: SAMPLE_SCRATCHPAD,
                    updatedAt: Date.now()
                }
            ];
            activeTabId = tabs[0].id;
            saveTabs();
        }
    } catch (err) {
        tabs = [
            { id: 'tab_default', title: 'Derivation Note', content: SAMPLE_NOTE, updatedAt: Date.now() }
        ];
        activeTabId = tabs[0].id;
    }

    renderTabsList();
    activateTab(activeTabId, false);
}

function saveTabs() {
    const current = getActiveTab();
    if (current) {
        current.title = refs.noteTitle.value.trim() || 'Untitled Topic';
        current.content = refs.sourceInput.value;
        current.updatedAt = Date.now();
    }
    localStorage.setItem(STORAGE.tabs, JSON.stringify(tabs));
    localStorage.setItem(STORAGE.activeTabId, activeTabId);
}

function getActiveTab() {
    return tabs.find(t => t.id === activeTabId);
}

function createTab(title = 'New Topic', content = '', switchTo = true) {
    saveTabs();

    const newId = 'tab_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newTab = {
        id: newId,
        title,
        content,
        updatedAt: Date.now()
    };

    tabs.push(newTab);
    saveTabs();
    renderTabsList();

    if (switchTo) {
        activateTab(newId, true);
        refs.noteTitle.focus();
        refs.noteTitle.select();
        toast('New topic tab opened');
    }
}

function switchTab(tabId) {
    if (tabId === activeTabId) return;
    saveTabs();
    activateTab(tabId, true);
}

function activateTab(tabId, animate = true) {
    const target = tabs.find(t => t.id === tabId);
    if (!target) return;

    activeTabId = tabId;
    localStorage.setItem(STORAGE.activeTabId, tabId);

    refs.noteTitle.value = target.title || 'Untitled Topic';
    refs.sourceInput.value = target.content || '';
    lastSourceValue = refs.sourceInput.value;

    resetWritingSession();
    updateStats();
    updateWritingMetrics();
    renderNote();
    updateTabsActiveUi();
    markSaved();

    if (animate) {
        refs.sourceInput.focus();
    }
}

function closeTab(tabId, event) {
    if (event) event.stopPropagation();

    if (tabs.length <= 1) {
        // Always maintain at least one topic tab
        const current = tabs[0];
        current.title = 'Untitled Topic';
        current.content = '';
        refs.noteTitle.value = current.title;
        refs.sourceInput.value = '';
        lastSourceValue = '';
        saveTabs();
        renderTabsList();
        renderNote();
        toast('Tab reset to blank');
        return;
    }

    const indexToClose = tabs.findIndex(t => t.id === tabId);
    if (indexToClose === -1) return;

    tabs.splice(indexToClose, 1);

    if (activeTabId === tabId) {
        const nextIndex = Math.min(indexToClose, tabs.length - 1);
        activeTabId = tabs[nextIndex].id;
        activateTab(activeTabId, false);
    }

    saveTabs();
    renderTabsList();
    toast('Tab closed');
}

function duplicateCurrentTab() {
    const current = getActiveTab();
    if (!current) return;
    createTab(`${current.title} (Copy)`, current.content, true);
}

function renderTabsList() {
    if (!refs.tabsList) return;
    refs.tabsList.innerHTML = '';

    tabs.forEach((tab, index) => {
        const item = document.createElement('div');
        item.className = `tab-item ${tab.id === activeTabId ? 'active' : ''}`;
        item.setAttribute('role', 'tab');
        item.setAttribute('aria-selected', String(tab.id === activeTabId));
        item.title = tab.title || 'Untitled Topic';

        item.innerHTML = `
            <span class="tab-title">${escapeHtml(tab.title || 'Untitled Topic')}</span>
            <button class="tab-close" type="button" title="Close topic tab">
                <i data-lucide="x"></i>
            </button>
        `;

        item.addEventListener('click', () => switchTab(tab.id));

        const closeBtn = item.querySelector('.tab-close');
        closeBtn.addEventListener('click', ev => closeTab(tab.id, ev));

        refs.tabsList.appendChild(item);
    });

    refreshIcons();
}

function updateTabsActiveUi() {
    const items = refs.tabsList?.querySelectorAll('.tab-item');
    if (!items) return;

    items.forEach((item, index) => {
        const tab = tabs[index];
        if (tab) {
            item.classList.toggle('active', tab.id === activeTabId);
            item.setAttribute('aria-selected', String(tab.id === activeTabId));
        }
    });
}

function updateActiveTabLabel() {
    const activeItem = refs.tabsList?.querySelector('.tab-item.active .tab-title');
    if (activeItem) {
        activeItem.textContent = refs.noteTitle.value.trim() || 'Untitled Topic';
    }
}

function exportTabsBackup() {
    saveTabs();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tabs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `dictate_write_tabs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast('All tabs exported as JSON backup');
}

async function handleImportBackupFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!Array.isArray(imported) || imported.length === 0) {
            toast('Invalid backup format: Expected array of tabs');
            return;
        }

        tabs = imported;
        activeTabId = tabs[0].id;
        saveTabs();
        renderTabsList();
        activateTab(activeTabId, false);
        toast(`Imported ${tabs.length} tabs successfully`);
    } catch (err) {
        toast('Failed to parse backup JSON file');
    } finally {
        refs.backupFileInput.value = '';
    }
}

// ==========================================
// SOURCE INPUT & KEYBOARD SHORTCUTS
// ==========================================

function handleSourceInput() {
    const previous = lastSourceValue;
    const current = refs.sourceInput.value;
    const delta = current.length - previous.length;

    if (delta > 0 && delta <= PASTE_CHAR_THRESHOLD) {
        recordTyping(delta);
    }

    lastSourceValue = current;

    // Update active tab object in memory
    const activeTab = getActiveTab();
    if (activeTab) {
        activeTab.content = current;
        activeTab.updatedAt = Date.now();
    }
    saveTabs();

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
        if (getKeybindingMode() !== 'default') return;
        event.preventDefault();
        insertSnippet('bold');
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
        if (getKeybindingMode() !== 'default') return;
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
    if (mode === 'emacs') return handleEmacsKeydown(event);
    if (mode === 'vim') return handleVimKeydown(event);
    return false;
}

function handleWordShortcuts(event) {
    if (!event.altKey || event.ctrlKey || event.metaKey) return false;
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
    if (event.metaKey) return false;
    if (!event.ctrlKey && !event.altKey) return false;

    if (event.altKey && !event.ctrlKey) {
        const key = event.key.toLowerCase();
        if (key === 'd') {
            event.preventDefault();
            deleteNextWord();
            return true;
        }
        return false;
    }

    if (!event.ctrlKey || event.altKey) return false;

    const key = event.key.toLowerCase();
    switch (key) {
        case 'a': event.preventDefault(); moveToLineStart(); return true;
        case 'e': event.preventDefault(); moveToLineEnd(); return true;
        case 'b': event.preventDefault(); moveByCharacter(-1); return true;
        case 'f': event.preventDefault(); moveByCharacter(1); return true;
        case 'p': event.preventDefault(); moveByLine(-1); return true;
        case 'n': event.preventDefault(); moveByLine(1); return true;
        case 'd': event.preventDefault(); deleteForwardCharacter(); return true;
        case 'h': event.preventDefault(); deleteBackwardCharacter(); return true;
        case 'k': event.preventDefault(); killToLineEnd(); return true;
        case 'u': event.preventDefault(); killToLineStart(); return true;
        case 'w': event.preventDefault(); deletePreviousWord(); return true;
        default: return false;
    }
}

function handleVimKeydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;

    if (event.key === 'Escape') {
        event.preventDefault();
        pendingVimOperator = '';
        vimMode = 'normal';
        updateKeybindingIndicator();
        return true;
    }

    if (vimMode === 'insert') return false;

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
        case 'i': event.preventDefault(); vimMode = 'insert'; updateKeybindingIndicator(); return true;
        case 'a': event.preventDefault(); moveByCharacter(1); vimMode = 'insert'; updateKeybindingIndicator(); return true;
        case 'o': event.preventDefault(); openLine(1); vimMode = 'insert'; updateKeybindingIndicator(); return true;
        case 'O': event.preventDefault(); openLine(-1); vimMode = 'insert'; updateKeybindingIndicator(); return true;
        case 'h': event.preventDefault(); moveByCharacter(-1); return true;
        case 'l': event.preventDefault(); moveByCharacter(1); return true;
        case 'j': event.preventDefault(); moveByLine(1); return true;
        case 'k': event.preventDefault(); moveByLine(-1); return true;
        case 'w': event.preventDefault(); moveByWord(1); return true;
        case 'b': event.preventDefault(); moveByWord(-1); return true;
        case 'e': event.preventDefault(); moveToWordEnd(); return true;
        case 'x': event.preventDefault(); deleteForwardCharacter(); return true;
        case '0': event.preventDefault(); moveToLineStart(); return true;
        case '$': event.preventDefault(); moveToLineEnd(); return true;
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
    if (direction < 0 && start !== end) { setSelection(start); return; }
    if (direction > 0 && start !== end) { setSelection(end); return; }
    setSelection(clamp(start + direction, 0, text.length));
}

function moveByWord(direction) {
    const { text, start, end } = getInputSelection();
    const anchor = direction < 0 ? Math.min(start, end) : Math.max(start, end);
    const target = direction < 0 ? findPreviousWordBoundary(text, anchor) : findNextWordBoundary(text, anchor);
    setSelection(target);
}

function moveToWordEnd() {
    const { text, start, end } = getInputSelection();
    let index = Math.max(start, end);
    while (index < text.length && /\s/.test(text[index])) index += 1;
    while (index < text.length && /\S/.test(text[index])) index += 1;
    setSelection(Math.max(0, index - 1));
}

function findPreviousWordBoundary(text, from) {
    let index = clamp(from, 0, text.length);
    while (index > 0 && /\s/.test(text[index - 1])) index -= 1;
    while (index > 0 && /\w/.test(text[index - 1])) index -= 1;
    if (index === from) {
        while (index > 0 && /\S/.test(text[index - 1])) index -= 1;
    }
    return index;
}

function findNextWordBoundary(text, from) {
    let index = clamp(from, 0, text.length);
    while (index < text.length && /\w/.test(text[index])) index += 1;
    while (index < text.length && /\s/.test(text[index])) index += 1;
    if (index === from) {
        while (index < text.length && /\S/.test(text[index])) index += 1;
    }
    return index;
}

function moveToLineStart() {
    const { text, start } = getInputSelection();
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    setSelection(lineStart);
}

function moveToLineEnd() {
    const { text, end } = getInputSelection();
    const lineEnd = text.indexOf('\n', end);
    setSelection(lineEnd === -1 ? text.length : lineEnd);
}

function moveByLine(direction) {
    const { text, start } = getInputSelection();
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const column = start - lineStart;
    const lines = text.split('\n');

    let currentLineIndex = 0;
    let accumulated = 0;

    for (let index = 0; index < lines.length; index += 1) {
        const nextAccumulated = accumulated + lines[index].length + 1;
        if (start <= nextAccumulated - 1) {
            currentLineIndex = index;
            break;
        }
        accumulated = nextAccumulated;
    }

    const targetLineIndex = clamp(currentLineIndex + direction, 0, lines.length - 1);
    if (targetLineIndex === currentLineIndex) return;

    let targetOffset = 0;
    for (let index = 0; index < targetLineIndex; index += 1) {
        targetOffset += lines[index].length + 1;
    }

    const targetLineLength = lines[targetLineIndex].length;
    setSelection(targetOffset + Math.min(column, targetLineLength));
}

function deleteForwardCharacter() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    if (start >= text.length) return;
    applyEditorEdit(`${text.slice(0, start)}${text.slice(start + 1)}`, start);
}

function deleteBackwardCharacter() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    if (start <= 0) return;
    applyEditorEdit(`${text.slice(0, start - 1)}${text.slice(start)}`, start - 1);
}

function deletePreviousWord() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    const boundary = findPreviousWordBoundary(text, start);
    if (boundary === start) return;
    applyEditorEdit(`${text.slice(0, boundary)}${text.slice(start)}`, boundary);
}

function deleteNextWord() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    const boundary = findNextWordBoundary(text, end);
    if (boundary === end) return;
    applyEditorEdit(`${text.slice(0, start)}${text.slice(boundary)}`, start);
}

function killToLineStart() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    if (lineStart === start) return;
    applyEditorEdit(`${text.slice(0, lineStart)}${text.slice(start)}`, lineStart);
}

function killToLineEnd() {
    const { text, start, end } = getInputSelection();
    if (start !== end) { applyEditorEdit(`${text.slice(0, start)}${text.slice(end)}`, start); return; }
    const lineEnd = text.indexOf('\n', end);
    const boundary = lineEnd === -1 ? text.length : lineEnd;
    if (boundary === start) return;
    applyEditorEdit(`${text.slice(0, start)}${text.slice(boundary)}`, start);
}

function deleteCurrentLine() {
    const { text, start } = getInputSelection();
    if (!text.length) return;
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineBreak = text.indexOf('\n', lineStart);
    let removeStart = lineStart;
    let removeEnd = lineBreak === -1 ? text.length : lineBreak + 1;
    if (lineBreak === -1 && lineStart > 0) removeStart = lineStart - 1;
    const nextValue = `${text.slice(0, removeStart)}${text.slice(removeEnd)}`;
    applyEditorEdit(nextValue, Math.min(removeStart, nextValue.length));
}

function openLine(direction) {
    const { text, start } = getInputSelection();
    if (!text.length) { applyEditorEdit('\n', direction > 0 ? 1 : 0); return; }
    if (direction < 0) {
        const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
        applyEditorEdit(`${text.slice(0, lineStart)}\n${text.slice(lineStart)}`, lineStart);
        return;
    }
    const lineEnd = text.indexOf('\n', start);
    const insertAt = lineEnd === -1 ? text.length : lineEnd + 1;
    applyEditorEdit(`${text.slice(0, insertAt)}\n${text.slice(insertAt)}`, insertAt + 1);
}

// ==========================================
// AUDIO SYNTHESIS & METRICS
// ==========================================

function shouldPlayTypingSound(event) {
    if (!refs.typingSoundToggle.checked) return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
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
            toast(`Pace check — ${milestone} words written this session`);
        }
    }
}

function setFocusMode(enabled, persist = true) {
    document.documentElement.dataset.focusMode = enabled ? 'on' : 'off';
    refs.focusModeBtn.setAttribute('aria-pressed', String(enabled));
    refs.focusModeBtn.querySelector('span').textContent = enabled ? 'Split' : 'Focus';
    if (persist) savePrefs();
}

function setTypingSoundUi() {
    refs.typingSoundStyleWrap.hidden = !refs.typingSoundToggle.checked;
}

function bindTypingAudioUnlock() {
    const unlock = () => { void ensureTypingAudioReady(); };
    ['pointerdown', 'touchstart', 'keydown'].forEach(eventName => {
        document.addEventListener(eventName, unlock, { capture: true, passive: true });
    });
}

function createTypingAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

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
    if (!context) return null;

    if (context.state !== 'running') {
        try {
            await context.resume();
        } catch (error) {
            return null;
        }
    }

    return context.state === 'running' ? context : null;
}

function getTypingOutput(context) {
    return typingMasterGain || context.destination;
}

async function playTypingSound(key, isRepeat = false) {
    if (!refs.typingSoundToggle.checked) return false;

    const nowMs = Date.now();
    const minGap = isRepeat ? 16 : 10;
    if (nowMs - lastKeystrokeSoundAt < minGap) return true;
    lastKeystrokeSoundAt = nowMs;

    try {
        const context = await ensureTypingAudioReady();
        if (!context) return false;

        const style = refs.typingSoundStyle.value;
        const at = context.currentTime + 0.005;
        playTypingSoundStyle(context, style, key, at);
        return true;
    } catch (error) {
        return false;
    }
}

function setGainEnvelope(gain, now, peak, attack = 0.002, release = 0.04) {
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.linearRampToValueAtTime(0.0001, now + release);
}

function playTypingSoundStyle(context, style, key, now) {
    switch (style) {
        case 'piano': playPianoTone(context, key, now); break;
        case 'soft': playSoftClick(context, now); break;
        case 'typewriter': playTypewriterSound(context, key, now); break;
        case 'bubble': playBubbleSound(context, key, now); break;
        case 'marble': playMarbleSound(context, key, now); break;
        case 'chime': playChimeSound(context, key, now); break;
        case 'keystroke':
        default: playMechanicalKeystroke(context, key, now); break;
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
    snap.stop(now + 0.06);
}

function playSoftClick(context, now) {
    const output = getTypingOutput(context);
    const click = context.createOscillator();
    const gain = context.createGain();

    click.type = 'sine';
    click.frequency.setValueAtTime(1400, now);
    click.frequency.exponentialRampToValueAtTime(450, now + 0.018);

    setGainEnvelope(gain, now, 0.22, 0.001, 0.024);

    click.connect(gain);
    gain.connect(output);
    click.start(now);
    click.stop(now + 0.03);
}

function playBubbleSound(context, key, now) {
    const output = getTypingOutput(context);
    const code = String(key || 'a').charCodeAt(0);
    const bubble = context.createOscillator();
    const gain = context.createGain();

    bubble.type = 'sine';
    const startFreq = 420 + (code % 280);
    bubble.frequency.setValueAtTime(startFreq, now);
    bubble.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + 0.04);

    setGainEnvelope(gain, now, 0.24, 0.002, 0.05);

    bubble.connect(gain);
    gain.connect(output);
    bubble.start(now);
    bubble.stop(now + 0.06);
}

function playMarbleSound(context, key, now) {
    const output = getTypingOutput(context);
    const click = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

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

function playChimeSound(context, key, now) {
    const output = getTypingOutput(context);
    const code = String(key || 'a').charCodeAt(0);
    const chime = context.createOscillator();
    const chimeGain = context.createGain();

    chime.type = 'sine';
    const freq = 1200 + (code % 6) * 120;
    chime.frequency.setValueAtTime(freq, now);

    setGainEnvelope(chimeGain, now, 0.16, 0.003, 0.12);

    chime.connect(chimeGain);
    chimeGain.connect(output);
    chime.start(now);
    chime.stop(now + 0.14);
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

// ==========================================
// PREVIEW & LATEX RENDERING
// ==========================================

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
        return `${previewTitle}<div class="empty-preview">Your rendered note will appear here.<br>Paste dictated speech or start writing. Use tabs above for multiple topics.</div>`;
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
    if (!trimmed || trimmed === 'Untitled Topic' || trimmed === 'Untitled Note') {
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
    const results = [];
    let cursor = 0;

    while (cursor < text.length) {
        const next = findNextMathDelimited(text, cursor);
        if (!next) break;
        results.push(next);
        cursor = next.index + next.raw.length;
    }

    return results;
}

function findNextMathDelimited(text, from) {
    const candidates = [];

    const displayDollar = text.indexOf('$$', from);
    if (displayDollar !== -1) {
        const end = text.indexOf('$$', displayDollar + 2);
        if (end !== -1) {
            candidates.push({
                index: displayDollar,
                raw: text.slice(displayDollar, end + 2),
                value: text.slice(displayDollar + 2, end).trim(),
                display: true,
                valueStartIndex: displayDollar + 2
            });
        }
    }

    const bracket = text.indexOf('\\[', from);
    if (bracket !== -1) {
        const end = text.indexOf('\\]', bracket + 2);
        if (end !== -1) {
            candidates.push({
                index: bracket,
                raw: text.slice(bracket, end + 2),
                value: text.slice(bracket + 2, end).trim(),
                display: true,
                valueStartIndex: bracket + 2
            });
        }
    }

    const paren = text.indexOf('\\(', from);
    if (paren !== -1) {
        const end = text.indexOf('\\)', paren + 2);
        if (end !== -1) {
            candidates.push({
                index: paren,
                raw: text.slice(paren, end + 2),
                value: text.slice(paren + 2, end).trim(),
                display: false,
                valueStartIndex: paren + 2
            });
        }
    }

    const inline = findDollarPair(text, from);
    if (inline) {
        candidates.push({
            index: inline.start,
            raw: text.slice(inline.start, inline.end),
            value: text.slice(inline.start + 1, inline.end - 1).trim(),
            display: false,
            valueStartIndex: inline.start + 1
        });
    }

    return candidates.sort((a, b) => a.index - b.index)[0] || null;
}

function countMath(source) {
    return extractMathExpressions(source).length;
}

function renderDiagnostics(diagnostics) {
    if (!diagnostics.length) {
        refs.diagnostics.hidden = true;
        refs.diagnostics.innerHTML = '';
        return;
    }

    refs.diagnostics.hidden = false;
    refs.diagnostics.innerHTML = `
        <div class="diagnostics-header">Math Syntax Issues (${diagnostics.length})</div>
        <div class="diagnostics-list">
            ${diagnostics.map((item, index) => `
                <div class="diagnostic-item" data-error-index="${index}">
                    <div class="diagnostic-meta">Line ${item.line}, Col ${item.column}</div>
                    <div class="diagnostic-message">${escapeHtml(item.message)}</div>
                    <div class="diagnostic-sample">${escapeHtml(item.sample)}</div>
                </div>
            `).join('')}
        </div>
    `;

    refs.diagnostics.querySelectorAll('.diagnostic-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = Number(el.dataset.errorIndex);
            const target = diagnostics[idx];
            if (target) {
                focusSourceRange(target.startIndex, target.endIndex);
            }
        });
    });
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
        fraction: { before: '\\frac{', after: '}{b}', fallback: 'a' },
        sqrt: { before: '\\sqrt{', after: '}', fallback: 'x' },
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

    const currentTab = getActiveTab();
    if (currentTab) {
        currentTab.content = input.value;
        currentTab.updatedAt = Date.now();
    }
    saveTabs();

    updateStats();
    updateWritingMetrics();
    markSaved();

    if (refs.livePreviewToggle.checked) {
        scheduleRender();
    }
}

function loadSample() {
    if (refs.sourceInput.value.trim() && !window.confirm('Replace the current tab with the sample?')) {
        return;
    }

    refs.noteTitle.value = 'Short derivation';
    refs.sourceInput.value = SAMPLE_NOTE;
    lastSourceValue = refs.sourceInput.value;
    resetWritingSession();

    saveTabs();
    updateActiveTabLabel();
    updateStats();
    updateWritingMetrics();
    markSaved();
    renderNote();
    toast('Sample loaded into tab');
}

function clearNote() {
    if (refs.sourceInput.value.trim() && !window.confirm('Clear this topic tab?')) {
        return;
    }

    refs.sourceInput.value = '';
    refs.noteTitle.value = 'Untitled Topic';
    lastSourceValue = '';
    resetWritingSession();

    saveTabs();
    updateActiveTabLabel();
    updateStats();
    updateWritingMetrics();
    markSaved();
    renderNote();
    refs.sourceInput.focus();
    toast('Cleared tab');
}

function loadFile() {
    const file = refs.fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const title = file.name.replace(/\.[^/.]+$/, '');
        const content = String(reader.result || '');
        createTab(title, content, true);
        toast(`Loaded ${file.name} as new tab`);
        refs.fileInput.value = '';
    };

    reader.readAsText(file);
}

// ==========================================
// LATEX SYMBOL PALETTE MODAL (CTRL+/)
// ==========================================

let activeSymbolCategory = 'greek';

function initSymbolPalette() {
    refs.symbolSearchInput.addEventListener('input', () => {
        renderSymbols(refs.symbolSearchInput.value);
    });

    refs.symbolCategoryTabs.querySelectorAll('.symbol-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            refs.symbolCategoryTabs.querySelectorAll('.symbol-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeSymbolCategory = tab.dataset.category;
            renderSymbols(refs.symbolSearchInput.value);
        });
    });
}

function openSymbolModal() {
    refs.symbolModalBackdrop.hidden = false;
    refs.symbolSearchInput.value = '';
    renderSymbols();
    refs.symbolSearchInput.focus();
}

function closeSymbolModal() {
    refs.symbolModalBackdrop.hidden = true;
}

function renderSymbols(filter = '') {
    const query = filter.toLowerCase().trim();
    const symbols = query
        ? LATEX_SYMBOLS.filter(s => s.code.toLowerCase().includes(query) || s.label.toLowerCase().includes(query))
        : LATEX_SYMBOLS.filter(s => s.category === activeSymbolCategory);

    refs.symbolGrid.innerHTML = '';

    symbols.forEach(symbol => {
        const tile = document.createElement('div');
        tile.className = 'symbol-tile';
        tile.title = `${symbol.label} (${symbol.code})`;

        tile.innerHTML = `
            <div class="symbol-tile-math">$${symbol.code}$</div>
            <div class="symbol-tile-code">${escapeHtml(symbol.code)}</div>
        `;

        tile.addEventListener('click', () => {
            insertAtSelection(symbol.code, '');
            closeSymbolModal();
            toast(`Inserted ${symbol.code}`);
        });

        refs.symbolGrid.appendChild(tile);
    });

    if (window.renderMathInElement) {
        window.renderMathInElement(refs.symbolGrid, katexOptions());
    }
}

// ==========================================
// COMMAND PALETTE (CTRL+K)
// ==========================================

function openCommandPalette() {
    refs.commandModalBackdrop.hidden = false;
    refs.commandSearchInput.value = '';
    commandPaletteActiveIndex = 0;
    buildCommandPaletteItems();
    renderCommandPaletteItems();
    refs.commandSearchInput.focus();
}

function closeCommandPalette() {
    refs.commandModalBackdrop.hidden = true;
}

function buildCommandPaletteItems() {
    commandPaletteItems = [
        { icon: 'plus', title: 'New Topic Tab', desc: 'Open a blank tab for another topic', shortcut: 'Ctrl+Alt+T', action: () => createTab() },
        { icon: 'x', title: 'Close Current Tab', desc: 'Close this topic tab', shortcut: 'Ctrl+Alt+W', action: () => closeTab(activeTabId) },
        { icon: 'copy', title: 'Duplicate Tab', desc: 'Duplicate current topic and equations', shortcut: '', action: duplicateCurrentTab },
        { icon: 'binary', title: 'Open LaTeX Symbol Palette', desc: 'Search and insert Greek, math, and matrix symbols', shortcut: 'Ctrl+/', action: openSymbolModal },
        { icon: 'maximize-2', title: 'Toggle Focus Mode', desc: 'Distraction-free full-width writing', shortcut: 'Ctrl+E', action: () => setFocusMode(document.documentElement.dataset.focusMode !== 'on') },
        { icon: 'refresh-cw', title: 'Render Note Preview', desc: 'Re-render KaTeX math and layout', shortcut: 'Ctrl+Enter', action: renderNote },
        { icon: 'file-text', title: 'Download PDF', desc: 'Export printable or downloadable PDF', shortcut: '', action: downloadPdf },
        { icon: 'download', title: 'Download .tex Source', desc: 'Save raw LaTeX document file', shortcut: '', action: downloadTex },
        { icon: 'image', title: 'Copy Rendered PNG', desc: 'Copy note image to clipboard', shortcut: '', action: copyPng },
        { icon: 'panel-top', title: 'Copy Rendered SVG', desc: 'Copy vector SVG image to clipboard', shortcut: '', action: copySvg },
        { icon: 'archive', title: 'Backup All Tabs (JSON)', desc: 'Export all open topic tabs into a JSON file', shortcut: '', action: exportTabsBackup },
        { icon: 'help-circle', title: 'Keyboard Shortcuts Guide', desc: 'View all keyboard shortcuts and commands', shortcut: '?', action: openShortcutsModal }
    ];

    // Add direct tab-switching commands
    tabs.forEach((tab, idx) => {
        if (tab.id !== activeTabId) {
            commandPaletteItems.push({
                icon: 'file-text',
                title: `Switch to: ${tab.title || 'Untitled Topic'}`,
                desc: `Tab ${idx + 1} • Jump directly to this topic`,
                shortcut: '',
                action: () => switchTab(tab.id)
            });
        }
    });
}

function renderCommandPaletteItems(query = '') {
    const q = query.toLowerCase().trim();
    const matches = q
        ? commandPaletteItems.filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q))
        : commandPaletteItems;

    refs.commandList.innerHTML = '';
    commandPaletteActiveIndex = Math.min(commandPaletteActiveIndex, Math.max(0, matches.length - 1));

    if (matches.length === 0) {
        refs.commandList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--subtle);font-size:0.85rem;">No matching commands</div>`;
        return;
    }

    matches.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `command-item ${index === commandPaletteActiveIndex ? 'active' : ''}`;
        div.setAttribute('role', 'option');

        div.innerHTML = `
            <div class="command-item-left">
                <i data-lucide="${item.icon}"></i>
                <div>
                    <div class="command-item-title">${escapeHtml(item.title)}</div>
                    <div class="command-item-desc">${escapeHtml(item.desc)}</div>
                </div>
            </div>
            ${item.shortcut ? `<kbd>${escapeHtml(item.shortcut)}</kbd>` : ''}
        `;

        div.addEventListener('click', () => {
            closeCommandPalette();
            item.action();
        });

        div.addEventListener('mouseenter', () => {
            commandPaletteActiveIndex = index;
            highlightActiveCommandItem();
        });

        refs.commandList.appendChild(div);
    });

    refreshIcons();
}

function highlightActiveCommandItem() {
    const items = refs.commandList.querySelectorAll('.command-item');
    items.forEach((el, idx) => {
        el.classList.toggle('active', idx === commandPaletteActiveIndex);
    });
}

function handleCommandPaletteKeydown(event) {
    const items = refs.commandList.querySelectorAll('.command-item');
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        commandPaletteActiveIndex = (commandPaletteActiveIndex + 1) % items.length;
        highlightActiveCommandItem();
        items[commandPaletteActiveIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        commandPaletteActiveIndex = (commandPaletteActiveIndex - 1 + items.length) % items.length;
        highlightActiveCommandItem();
        items[commandPaletteActiveIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
        event.preventDefault();
        items[commandPaletteActiveIndex]?.click();
    }
}

// ==========================================
// SYNCHRONIZED SCROLLING
// ==========================================

function initSyncedScroll() {
    const editor = refs.sourceInput;
    const preview = refs.previewOutput;

    editor.addEventListener('scroll', () => {
        if (!isSyncScrolling || isScrollingPreview) return;
        isScrollingEditor = true;

        const maxEditor = editor.scrollHeight - editor.clientHeight;
        if (maxEditor > 0) {
            const ratio = editor.scrollTop / maxEditor;
            const maxPreview = preview.scrollHeight - preview.clientHeight;
            preview.scrollTop = ratio * maxPreview;
        }

        window.requestAnimationFrame(() => { isScrollingEditor = false; });
    });

    preview.addEventListener('scroll', () => {
        if (!isSyncScrolling || isScrollingEditor) return;
        isScrollingPreview = true;

        const maxPreview = preview.scrollHeight - preview.clientHeight;
        if (maxPreview > 0) {
            const ratio = preview.scrollTop / maxPreview;
            const maxEditor = editor.scrollHeight - editor.clientHeight;
            editor.scrollTop = ratio * maxEditor;
        }

        window.requestAnimationFrame(() => { isScrollingPreview = false; });
    });
}

function toggleSyncedScroll() {
    isSyncScrolling = !isSyncScrolling;
    refs.syncedScrollBtn.querySelector('span').textContent = `Sync Scroll: ${isSyncScrolling ? 'On' : 'Off'}`;
    toast(`Synchronized scrolling ${isSyncScrolling ? 'enabled' : 'disabled'}`);
}

// ==========================================
// SHORTCUTS MODAL (?)
// ==========================================

function openShortcutsModal() {
    refs.shortcutsModalBackdrop.hidden = false;
}

function closeShortcutsModal() {
    refs.shortcutsModalBackdrop.hidden = true;
}

// ==========================================
// EXPORTS: TEX, HTML, PDF, PNG, SVG
// ==========================================

function downloadTex() {
    if (!hasExportablePreview()) return;
    const filename = `${safeFileName(refs.noteTitle.value)}.tex`;
    downloadBlob(new Blob([refs.sourceInput.value], { type: 'text/x-tex;charset=utf-8' }), filename, 'text/x-tex;charset=utf-8');
    setStatus('LaTeX downloaded', 'good');
    toast(`Downloaded ${filename}`);
}

function downloadHtml() {
    if (!hasExportablePreview()) return;
    const filename = `${safeFileName(refs.noteTitle.value)}.html`;
    const html = buildStandaloneHtml();
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), filename, 'text/html;charset=utf-8');
    setStatus('HTML downloaded', 'good');
    toast(`Downloaded ${filename}`);
}

async function downloadPdf() {
    if (!hasExportablePreview()) return;

    if (!window.jspdf || !window.html2canvas) {
        openPrintPdf();
        return;
    }

    setStatus('Building PDF...', '');

    try {
        const canvas = await capturePreviewCanvas();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 36;
        const printWidth = pageWidth - margin * 2;
        const printHeight = (canvas.height * printWidth) / canvas.width;

        let heightLeft = printHeight;
        let position = margin;
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight, undefined, 'FAST');
        heightLeft -= pageHeight - margin * 2;

        while (heightLeft > 0) {
            position = heightLeft - printHeight + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight, undefined, 'FAST');
            heightLeft -= pageHeight - margin * 2;
        }

        const filename = `${safeFileName(refs.noteTitle.value)}.pdf`;
        pdf.save(filename);
        setStatus('PDF downloaded', 'good');
        toast(`Downloaded ${filename}`);
    } catch (error) {
        openPrintPdf();
    }
}

async function copyPng() {
    if (!hasExportablePreview()) return;
    setStatus('Creating image...', '');

    try {
        const canvas = await capturePreviewCanvas();
        const blob = await canvasToBlob(canvas, 'image/png');

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setStatus('PNG copied', 'good');
            toast('Rendered note copied as PNG');
            return;
        }

        downloadBlob(blob, `${safeFileName(refs.noteTitle.value)}.png`, 'image/png');
        setStatus('PNG downloaded', 'good');
        toast('PNG downloaded');
    } catch (error) {
        setStatus('PNG failed', 'warn');
        toast('Could not create PNG');
    }
}

async function copySvg() {
    if (!hasExportablePreview()) return;
    setStatus('Building SVG...', '');

    try {
        const svg = await buildPreviewSvg();
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

        if (navigator.clipboard && window.ClipboardItem) {
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/svg+xml': blob })]);
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
        toast('SVG downloaded');
    } catch (error) {
        setStatus('SVG failed', 'warn');
        toast('Could not create SVG');
    }
}

async function capturePreviewCanvas() {
    if (!window.html2canvas) throw new Error('html2canvas not loaded');
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
        toast('Allow popups to print/save as PDF');
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

function standaloneExportCss() {
    return `
body { margin: 0; padding: 40px; font-family: "Literata", Georgia, serif; color: #1c2430; background: #fff; line-height: 1.7; }
.export-page { max-width: 800px; margin: 0 auto; }
h1 { font-family: "Inter", sans-serif; font-size: 2rem; margin: 0 0 8px; }
.export-meta { font-family: "Inter", sans-serif; font-size: 0.8rem; color: #667085; margin-bottom: 30px; border-bottom: 1px solid #eef1f5; padding-bottom: 14px; }
.latex-display { margin: 1.5em 0; overflow-x: auto; text-align: center; }
p { margin: 1em 0; }
`;
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
            if (blob) resolve(blob);
            else reject(new Error('Canvas export failed'));
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
        const properties = ['color', 'font-family', 'font-size', 'font-weight', 'line-height'];
        properties.forEach(prop => {
            element.style.setProperty(prop, computed.getPropertyValue(prop));
        });
    });
}

async function copyText(text, successMessage) {
    if (!text.trim()) {
        toast('Nothing to copy');
        return;
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            temp.remove();
        }

        setStatus('Copied', 'good');
        toast(successMessage);
    } catch (error) {
        setStatus('Copy failed', 'warn');
        toast('Clipboard access failed');
    }
}

function downloadBlob(blob, filename) {
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
    if (!refs.keybindingIndicator) return;
    const mode = getKeybindingMode();
    let label = 'Keys: Default';

    if (mode === 'emacs') label = 'Keys: Emacs';
    else if (mode === 'vim') label = `VIM: ${vimMode === 'normal' ? 'NORMAL' : 'INSERT'}`;

    refs.keybindingIndicator.textContent = label;
}

function setEditorSize(size, persist = true) {
    document.documentElement.dataset.editorSize = size;
    if (persist) savePrefs();
}

function setEditorFont(font, persist = true) {
    document.documentElement.dataset.editorFont = font;
    if (persist) savePrefs();
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
