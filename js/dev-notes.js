// ==================== DEVELOPER NOTES PANEL ====================
// Only active in development mode (when not on production domain)
class DevNotes {
    constructor() {
        // Check if in production (adjust domain as needed)
        this.isProduction = window.location.hostname === 'yourdomain.com';
        if (this.isProduction) return;

        // State
        this.notes = this.loadFromStorage('dev-notes', []);
        this.isOpen = this.loadFromStorage('dev-notes-open', 'false') === 'true';
        this.dockPosition = this.loadFromStorage('dev-notes-dock', 'floating');
        this.position = this.loadFromStorage('dev-notes-position', {
            x: window.innerWidth - 420,
            y: 100
        });
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedPriority = 'medium';
        this.selectedCategory = 'idea';
        this.filter = 'all';

        // DOM references
        this.panel = null;
        this.toggleButton = null;

        // Initialize
        this.init();
    }

    loadFromStorage(key, defaultValue) {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultValue;
        try {
            return JSON.parse(stored);
        } catch {
            return stored;
        }
    }

    saveToStorage(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }

    init() {
        if (this.isProduction) return;

        // Create toggle button
        this.createToggleButton();

        // Create panel
        this.createPanel();

        // Render initial state
        this.render();

        // Setup event listeners
        this.setupEventListeners();
    }

    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'dev-notes-toggle';
        this.toggleButton.innerHTML = `📝 Dev Notes ${this.notes.length > 0 ? `(${this.notes.length})` : ''}`;
        this.toggleButton.title = 'Open Developer Notes';
        this.toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 10px 20px;
            border-radius: 9999px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: none;
            cursor: pointer;
            z-index: 9999;
            font-weight: 600;
            font-size: 14px;
            transition: background 0.2s;
        `;
        this.toggleButton.addEventListener('mouseenter', () => {
            this.toggleButton.style.background = '#1d4ed8';
        });
        this.toggleButton.addEventListener('mouseleave', () => {
            this.toggleButton.style.background = '#2563eb';
        });
        this.toggleButton.addEventListener('click', () => this.open());
        document.body.appendChild(this.toggleButton);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'dev-notes-panel';
        this.panel.id = 'dev-notes-panel';
        document.body.appendChild(this.panel);
    }

    getCurrentPath() {
        return window.location.pathname;
    }

    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#eab308';
            case 'low': return '#22c55e';
        }
    }

    getCategoryIcon(category) {
        switch (category) {
            case 'idea': return '💡';
            case 'bug': return '🐛';
            case 'todo': return '✓';
            case 'improvement': return '⚡';
        }
    }

    getPositionStyle() {
        switch (this.dockPosition) {
            case 'bottom':
                return {
                    position: 'fixed',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    width: '100%',
                    height: '300px',
                };
            case 'right':
                return {
                    position: 'fixed',
                    top: '0',
                    right: '0',
                    width: '400px',
                    height: '100vh',
                };
            case 'left':
                return {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '400px',
                    height: '100vh',
                };
            case 'floating':
            default:
                return {
                    position: 'fixed',
                    left: `${this.position.x}px`,
                    top: `${this.position.y}px`,
                    width: '400px',
                    height: '500px',
                };
        }
    }

    render() {
        if (!this.panel) return;

        // Show/hide toggle button
        this.toggleButton.style.display = this.isOpen ? 'none' : 'block';

        if (!this.isOpen) {
            this.panel.style.display = 'none';
            return;
        }

        // Apply position styles
        const styles = this.getPositionStyle();
        Object.assign(this.panel.style, styles);
        this.panel.style.display = 'flex';
        this.panel.style.flexDirection = 'column';
        this.panel.style.background = '#111827';
        this.panel.style.color = 'white';
        this.panel.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        this.panel.style.border = '1px solid #374151';
        this.panel.style.zIndex = '9999';

        // Get filtered notes
        const filteredNotes = this.getFilteredNotes();

        // Render content
        this.panel.innerHTML = `
            <!-- Header -->
            <div class="dev-notes-header" style="
                background: #1f2937;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: ${this.dockPosition === 'floating' ? 'move' : 'default'};
                user-select: none;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: bold;">📝 Dev Notes</span>
                    <span style="font-size: 12px; color: #9ca3af;">(${filteredNotes.length})</span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <select id="dock-position" style="
                        background: #374151;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        border: 1px solid #4b5563;
                        color: white;
                    ">
                        <option value="floating" ${this.dockPosition === 'floating' ? 'selected' : ''}>Float</option>
                        <option value="bottom" ${this.dockPosition === 'bottom' ? 'selected' : ''}>Dock Bottom</option>
                        <option value="right" ${this.dockPosition === 'right' ? 'selected' : ''}>Dock Right</option>
                        <option value="left" ${this.dockPosition === 'left' ? 'selected' : ''}>Dock Left</option>
                    </select>

                    <button id="close-panel" style="
                        background: transparent;
                        border: none;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
            </div>

            <!-- Filters -->
            <div style="
                padding: 8px 12px;
                background: #1f2937;
                border-bottom: 1px solid #374151;
                display: flex;
                gap: 8px;
                font-size: 12px;
                flex-wrap: wrap;
            ">
                <button class="filter-btn" data-filter="all">All</button>
                <button class="filter-btn" data-filter="current">This Page</button>
                <button class="filter-btn" data-filter="idea">💡 Ideas</button>
                <button class="filter-btn" data-filter="todo">✓ Todos</button>
                <button class="filter-btn" data-filter="bug">🐛 Bugs</button>
                <button class="filter-btn" data-filter="improvement">⚡ Improvements</button>
            </div>

            <!-- Notes List -->
            <div id="notes-list" style="
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            ">
                ${filteredNotes.length === 0 ? `
                    <div style="text-align: center; color: #6b7280; margin-top: 32px;">
                        No notes yet. Add one below!
                    </div>
                ` : filteredNotes.map(note => this.renderNote(note)).join('')}
            </div>

            <!-- Add Note Form -->
            <div style="
                border-top: 1px solid #374151;
                padding: 12px;
            ">
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <select id="note-category" style="
                        background: #1f2937;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        border: 1px solid #4b5563;
                        color: white;
                    ">
                        <option value="idea" ${this.selectedCategory === 'idea' ? 'selected' : ''}>💡 Idea</option>
                        <option value="todo" ${this.selectedCategory === 'todo' ? 'selected' : ''}>✓ Todo</option>
                        <option value="bug" ${this.selectedCategory === 'bug' ? 'selected' : ''}>🐛 Bug</option>
                        <option value="improvement" ${this.selectedCategory === 'improvement' ? 'selected' : ''}>⚡ Improvement</option>
                    </select>

                    <select id="note-priority" style="
                        background: #1f2937;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        border: 1px solid #4b5563;
                        color: white;
                    ">
                        <option value="low" ${this.selectedPriority === 'low' ? 'selected' : ''}>🟢 Low</option>
                        <option value="medium" ${this.selectedPriority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
                        <option value="high" ${this.selectedPriority === 'high' ? 'selected' : ''}>🔴 High</option>
                    </select>
                </div>

                <textarea id="new-note-text" placeholder="Add a note... (Ctrl+Enter to save)" style="
                    width: 100%;
                    background: #1f2937;
                    font-size: 14px;
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #4b5563;
                    color: white;
                    resize: none;
                    outline: none;
                    margin-bottom: 8px;
                " rows="3"></textarea>

                <button id="add-note-btn" style="
                    width: 100%;
                    background: #2563eb;
                    font-size: 14px;
                    padding: 8px;
                    border-radius: 4px;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                ">Add Note</button>
            </div>

            <!-- Export Footer -->
            <div style="
                border-top: 1px solid #374151;
                padding: 8px;
                display: flex;
                gap: 8px;
                background: #1f2937;
            ">
                <button id="export-md-btn" title="Export as Markdown" style="
                    flex: 1;
                    background: #16a34a;
                    font-size: 12px;
                    padding: 8px;
                    border-radius: 4px;
                    border: none;
                    color: white;
                    cursor: pointer;
                ">📄 MD</button>
                <button id="export-gh-btn" title="Export GitHub Issues Template" style="
                    flex: 1;
                    background: #9333ea;
                    font-size: 12px;
                    padding: 8px;
                    border-radius: 4px;
                    border: none;
                    color: white;
                    cursor: pointer;
                ">🐙 GitHub</button>
                <button id="clear-all-btn" title="Clear All Notes" style="
                    flex: 1;
                    background: #dc2626;
                    font-size: 12px;
                    padding: 8px;
                    border-radius: 4px;
                    border: none;
                    color: white;
                    cursor: pointer;
                ">🗑️ Clear</button>
            </div>
        `;

        // Re-attach event listeners
        this.attachPanelEventListeners();
    }

    renderNote(note) {
        return `
            <div style="
                background: #1f2937;
                padding: 12px;
                border-radius: 4px;
                border: 1px solid #374151;
                margin-bottom: 8px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${this.getCategoryIcon(note.category)}</span>
                        <span style="font-size: 12px; font-weight: bold; color: ${this.getPriorityColor(note.priority)}">
                            ${note.priority.toUpperCase()}
                        </span>
                    </div>
                    <button class="delete-note-btn" data-id="${note.id}" style="
                        background: transparent;
                        border: none;
                        color: #ef4444;
                        cursor: pointer;
                        font-size: 12px;
                    ">Delete</button>
                </div>

                <p style="font-size: 14px; margin-bottom: 8px;">${this.escapeHtml(note.text)}</p>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af;">
                    <span>${note.page}</span>
                    <span>${new Date(note.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFilteredNotes() {
        return this.notes.filter(note => {
            if (this.filter === 'all') return true;
            if (this.filter === 'current') return note.page === this.getCurrentPath();
            return note.category === this.filter;
        });
    }

    setupEventListeners() {
        // Dragging for floating mode
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }

    attachPanelEventListeners() {
        // Header drag
        const header = this.panel.querySelector('.dev-notes-header');
        if (header) {
            header.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        }

        // Close button
        const closeBtn = this.panel.querySelector('#close-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Dock position
        const dockSelect = this.panel.querySelector('#dock-position');
        if (dockSelect) {
            dockSelect.addEventListener('change', (e) => {
                this.dockPosition = e.target.value;
                this.saveToStorage('dev-notes-dock', this.dockPosition);
                this.render();
            });
        }

        // Filters
        this.panel.querySelectorAll('.filter-btn').forEach(btn => {
            const filterValue = btn.getAttribute('data-filter');
            btn.style.cssText = `
                padding: 4px 8px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                background: ${this.filter === filterValue ? '#2563eb' : '#374151'};
                color: white;
            `;
            btn.addEventListener('click', () => {
                this.filter = filterValue;
                this.render();
            });
            btn.addEventListener('mouseenter', () => {
                if (this.filter !== filterValue) {
                    btn.style.background = '#4b5563';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (this.filter !== filterValue) {
                    btn.style.background = '#374151';
                }
            });
        });

        // Category and priority selects
        const categorySelect = this.panel.querySelector('#note-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
            });
        }

        const prioritySelect = this.panel.querySelector('#note-priority');
        if (prioritySelect) {
            prioritySelect.addEventListener('change', (e) => {
                this.selectedPriority = e.target.value;
            });
        }

        // Add note
        const addBtn = this.panel.querySelector('#add-note-btn');
        const textarea = this.panel.querySelector('#new-note-text');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNote());
        }

        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.addNote();
                }
            });
        }

        // Delete notes
        this.panel.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.deleteNote(id);
            });
        });

        // Export buttons
        const exportMdBtn = this.panel.querySelector('#export-md-btn');
        if (exportMdBtn) {
            exportMdBtn.addEventListener('click', () => this.exportToMarkdown());
        }

        const exportGhBtn = this.panel.querySelector('#export-gh-btn');
        if (exportGhBtn) {
            exportGhBtn.addEventListener('click', () => this.exportToGitHub());
        }

        const clearBtn = this.panel.querySelector('#clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllNotes());
        }
    }

    handleMouseDown(e) {
        if (this.dockPosition !== 'floating') return;
        this.isDragging = true;
        this.dragOffset = {
            x: e.clientX - this.position.x,
            y: e.clientY - this.position.y,
        };
    }

    handleMouseMove(e) {
        if (!this.isDragging || this.dockPosition !== 'floating') return;
        this.position = {
            x: e.clientX - this.dragOffset.x,
            y: e.clientY - this.dragOffset.y,
        };
        this.saveToStorage('dev-notes-position', this.position);
        this.render();
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    addNote() {
        const textarea = this.panel.querySelector('#new-note-text');
        const text = textarea ? textarea.value.trim() : '';

        if (!text) return;

        const note = {
            id: Date.now().toString(),
            text: text,
            timestamp: new Date().toISOString(),
            page: this.getCurrentPath(),
            priority: this.selectedPriority,
            category: this.selectedCategory,
        };

        this.notes.push(note);
        this.saveToStorage('dev-notes', this.notes);

        // Update toggle button count
        this.toggleButton.innerHTML = `📝 Dev Notes (${this.notes.length})`;

        this.render();
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveToStorage('dev-notes', this.notes);

        // Update toggle button count
        this.toggleButton.innerHTML = `📝 Dev Notes ${this.notes.length > 0 ? `(${this.notes.length})` : ''}`;

        this.render();
    }

    clearAllNotes() {
        if (confirm('Clear all notes? This cannot be undone.')) {
            this.notes = [];
            this.saveToStorage('dev-notes', this.notes);
            this.toggleButton.innerHTML = '📝 Dev Notes';
            this.render();
        }
    }

    exportToMarkdown() {
        const grouped = this.notes.reduce((acc, note) => {
            if (!acc[note.page]) acc[note.page] = [];
            acc[note.page].push(note);
            return acc;
        }, {});

        let markdown = `# Development Session Notes - ${new Date().toLocaleDateString()}\n\n`;

        Object.entries(grouped).forEach(([page, pageNotes]) => {
            markdown += `## ${page}\n\n`;
            pageNotes.forEach(note => {
                const checkbox = note.category === 'todo' ? '- [ ]' : '-';
                const priority = note.priority === 'high' ? '🔴' : note.priority === 'medium' ? '🟡' : '🟢';
                markdown += `${checkbox} ${priority} [${note.category.toUpperCase()}] ${note.text}\n`;
                markdown += `  *Added: ${new Date(note.timestamp).toLocaleString()}*\n\n`;
            });
        });

        this.downloadFile(markdown, `dev-notes-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    }

    exportToGitHub() {
        const grouped = this.notes.reduce((acc, note) => {
            if (!acc[note.page]) acc[note.page] = [];
            acc[note.page].push(note);
            return acc;
        }, {});

        let issuesText = '# GitHub Issues Template\n\n';
        issuesText += 'Copy each section below into a new GitHub issue:\n\n---\n\n';

        Object.entries(grouped).forEach(([page, pageNotes]) => {
            issuesText += `## Issue: Feature Ideas for ${page}\n\n`;
            issuesText += `**Labels:** enhancement, dev-notes\n\n`;
            issuesText += `**Description:**\n\n`;
            pageNotes.forEach(note => {
                const priority = note.priority === 'high' ? '🔴 HIGH' : note.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';
                issuesText += `- [${note.category.toUpperCase()}] ${priority}: ${note.text}\n`;
                issuesText += `  - Noted on: ${new Date(note.timestamp).toLocaleString()}\n\n`;
            });
            issuesText += `---\n\n`;
        });

        this.downloadFile(issuesText, `github-issues-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    open() {
        this.isOpen = true;
        this.saveToStorage('dev-notes-open', 'true');
        this.render();
    }

    close() {
        this.isOpen = false;
        this.saveToStorage('dev-notes-open', 'false');
        this.render();
    }
}

// Initialize DevNotes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.devNotes = new DevNotes();
    });
} else {
    window.devNotes = new DevNotes();
}
