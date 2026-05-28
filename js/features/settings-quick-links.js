export class SettingsQuickLinksManager {
    constructor() {
        this.quickLinksList = document.getElementById('quick-links-list');
        this.newLinkName = document.getElementById('new-link-name');
        this.newLinkUrl = document.getElementById('new-link-url');
        this.addLinkBtn = document.getElementById('add-link-btn');
        this.dragSrcEl = null;
    }

    init() {
        this.loadQuickLinksList();
        if (this.addLinkBtn) {
            this.addLinkBtn.addEventListener('click', () => this.addQuickLink());
        }
    }

    loadQuickLinksList() {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            this.renderQuickLinksUI(links);
        });
    }

    renderQuickLinksUI(links) {
        if (!this.quickLinksList) return;
        this.quickLinksList.innerHTML = '';
        if (links.length === 0) {
            this.quickLinksList.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.7;">Nenhum link adicionado</div>';
            return;
        }
        links.forEach((link, index) => {
            const item = document.createElement('div');
            item.draggable = true;
            item.dataset.index = index;
            item.className = 'draggable-link';
            item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--settings-border); background:var(--input-bg); margin-bottom:5px; border-radius:4px; transition: transform 0.2s, box-shadow 0.2s;';

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">
                    <span style="cursor:grab; font-size:1.2em; opacity:0.5; user-select:none;">☰</span>
                    <div style="overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
                        <strong style="color:var(--text);">${link.name}</strong>
                        <div style="font-size:0.8em; opacity:0.7; overflow:hidden; text-overflow:ellipsis;">${link.url}</div>
                    </div>
                </div>
                <button class="delete-link-btn" data-index="${index}" style="background:transparent; border:none; cursor:pointer; font-size:1.2em; padding:5px;">🗑️</button>
            `;

            // DnD Events
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragover', (e) => this.handleDragOver(e));
            item.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            item.addEventListener('drop', (e) => this.handleDrop(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));

            this.quickLinksList.appendChild(item);
        });

        // Add listeners to delete buttons
        this.quickLinksList.querySelectorAll('.delete-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeQuickLink(index);
            });
        });
    }

    handleDragStart(e) {
        e.currentTarget.style.opacity = '0.4';
        this.dragSrcEl = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.style.border = '2px dashed var(--accent)';
        return false;
    }

    handleDragLeave(e) {
        e.currentTarget.style.border = 'none';
        e.currentTarget.style.borderBottom = '1px solid var(--settings-border)';
    }

    handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();

        const target = e.currentTarget;
        target.style.border = 'none';
        target.style.borderBottom = '1px solid var(--settings-border)';

        const srcIndex = parseInt(this.dragSrcEl.dataset.index);
        const targetIndex = parseInt(target.dataset.index);

        if (this.dragSrcEl !== target) {
            this.reorderQuickLinks(srcIndex, targetIndex);
        }
        return false;
    }

    handleDragEnd(e) {
        e.currentTarget.style.opacity = '1';
        if (this.quickLinksList) {
            this.quickLinksList.querySelectorAll('.draggable-link').forEach(item => {
                item.style.border = 'none';
                item.style.borderBottom = '1px solid var(--settings-border)';
            });
        }
    }

    reorderQuickLinks(fromIndex, toIndex) {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            if (fromIndex >= 0 && fromIndex < links.length) {
                const item = links.splice(fromIndex, 1)[0];
                links.splice(toIndex, 0, item);
                chrome.storage.sync.set({ quickLinks: links }, () => {
                    this.renderQuickLinksUI(links);
                });
            }
        });
    }

    addQuickLink() {
        if (!this.newLinkName || !this.newLinkUrl) return;
        const name = this.newLinkName.value.trim();
        let url = this.newLinkUrl.value.trim();

        if (!name || !url) return alert('Preencha nome e URL');
        if (!url.startsWith('http')) url = 'https://' + url;

        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            links.push({ name, url });
            chrome.storage.sync.set({ quickLinks: links }, () => {
                this.newLinkName.value = '';
                this.newLinkUrl.value = '';
                this.renderQuickLinksUI(links);
            });
        });
    }

    removeQuickLink(index) {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            if (index >= 0 && index < links.length) {
                links.splice(index, 1);
                chrome.storage.sync.set({ quickLinks: links }, () => {
                    this.renderQuickLinksUI(links);
                });
            }
        });
    }
}
