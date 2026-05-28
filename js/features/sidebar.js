import {
    loadSpacesFromChrome,
    createSpace,
    getRandomSpaceIcon
} from '../modules.js';

export class SidebarManager {
    constructor(settingsState, onSpaceSelected) {
        this.settingsState = settingsState;
        this.onSpaceSelected = onSpaceSelected;
        
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.spacesList = document.getElementById('spaces-list');
        this.addSpaceBtn = document.getElementById('add-space-btn');
        
        this.currentSpaces = [];
        this.activeSpaceId = null;
    }

    init() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.addSpaceBtn) {
            this.addSpaceBtn.addEventListener('click', () => this.handleAddSpace());
        }

        if (this.settingsState.sidebarCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
            if (this.sidebarToggle) this.sidebarToggle.textContent = '▶';
        }
    }

    renderSpacesList(spaces) {
        if (!this.spacesList) return;
        this.spacesList.innerHTML = '';
        spaces.forEach(space => {
            const spaceItem = document.createElement('button');
            spaceItem.className = 'space-item';
            if (space.id === this.activeSpaceId) {
                spaceItem.classList.add('active');
            }
            spaceItem.dataset.spaceId = space.id;

            const spaceIconSpan = document.createElement('span');
            spaceIconSpan.className = 'space-icon';
            spaceIconSpan.textContent = space.icon;

            const spaceNameSpan = document.createElement('span');
            spaceNameSpan.className = 'space-name';
            spaceNameSpan.textContent = space.name;

            spaceItem.appendChild(spaceIconSpan);
            spaceItem.appendChild(spaceNameSpan);
            spaceItem.addEventListener('click', () => this.selectSpace(space.id));
            this.spacesList.appendChild(spaceItem);
        });
    }

    selectSpace(spaceId) {
        this.activeSpaceId = spaceId;
        
        // Update active class
        document.querySelectorAll('.space-item').forEach(item => {
            item.classList.toggle('active', item.dataset.spaceId === spaceId);
        });
        
        // Call parent selection handler
        if (this.onSpaceSelected) {
            this.onSpaceSelected(spaceId);
        }

        // Save to settings
        chrome.storage.sync.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.lastActiveSpace = spaceId;
            chrome.storage.sync.set({ extensionSettings: settings });
        });
    }

    toggleSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.toggle('collapsed');
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        if (this.sidebarToggle) {
            this.sidebarToggle.textContent = isCollapsed ? '▶' : '◀';
        }
        // Save state
        chrome.storage.sync.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.sidebarCollapsed = isCollapsed;
            chrome.storage.sync.set({ extensionSettings: settings });
        });
    }

    handleAddSpace() {
        const name = prompt('Nome do novo espaço:');
        if (!name || !name.trim()) return;
        const icon = getRandomSpaceIcon();
        createSpace(name.trim(), icon, newSpace => {
            if (newSpace) {
                this.currentSpaces.push(newSpace);
                this.renderSpacesList(this.currentSpaces);
                this.selectSpace(newSpace.id);
            }
        });
    }

    loadSpaces(targetSpaceId) {
        loadSpacesFromChrome(spaces => {
            this.currentSpaces = spaces;
            this.renderSpacesList(spaces);

            if (spaces.length > 0) {
                const spaceExists = spaces.find(s => s.id === targetSpaceId);
                const actualTarget = targetSpaceId && spaceExists ? targetSpaceId : spaces[0].id;
                this.selectSpace(actualTarget);
            } else {
                // No spaces exist yet - create default "Home" space
                createSpace('Home', '🏠', newSpace => {
                    if (newSpace) {
                        this.currentSpaces = [newSpace];
                        this.renderSpacesList(this.currentSpaces);
                        this.selectSpace(newSpace.id);
                    }
                });
            }
        });
    }
}
