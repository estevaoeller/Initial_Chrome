import { handleDeleteBookmark } from '../modules.js';
import { renderBookmarks } from '../bookmark-renderer.js';

export class ContextMenuManager {
    constructor() {
        this.menu = document.getElementById('context-menu');
        this.submenu = document.getElementById('context-menu-submenu');
        
        this.currentLink = null;
        this.currentCategory = null;
        this.currentBookmarksList = [];
        this.currentContentArea = null;
        this.currentIconSize = 32;
        this.currentStateHelpers = null;
        
        this.isOpen = false;
    }

    init() {
        if (!this.menu) {
            console.error('Context menu element not found in DOM.');
            return;
        }

        // Listen for the custom trigger event
        window.addEventListener('openContextMenu', (e) => {
            const { x, y, link, category, bookmarks, contentArea, iconSize, stateHelpers } = e.detail;
            this.open(x, y, link, category, bookmarks, contentArea, iconSize, stateHelpers);
        });

        // Close menu on click anywhere
        window.addEventListener('click', () => {
            if (this.isOpen) this.close();
        });

        // Close menu on scroll or resize
        window.addEventListener('scroll', () => {
            if (this.isOpen) this.close();
        }, true);
        window.addEventListener('resize', () => {
            if (this.isOpen) this.close();
        });

        // Close menu on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Bind clicks on menu actions
        this.menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                if (action && action !== 'move') { // 'move' action is handled by submenu
                    e.stopPropagation();
                    this.executeAction(action);
                    this.close();
                }
            });
        });
    }

    open(x, y, link, category, bookmarks, contentArea, iconSize, stateHelpers) {
        this.currentLink = link;
        this.currentCategory = category;
        this.currentBookmarksList = bookmarks;
        this.currentContentArea = contentArea;
        this.currentIconSize = iconSize;
        this.currentStateHelpers = stateHelpers;

        this.isOpen = true;
        this.menu.style.display = 'flex';

        // Render dynamic move submenu
        this.renderSubmenu();

        // Position the menu
        const menuWidth = this.menu.offsetWidth || 180;
        const menuHeight = this.menu.offsetHeight || 220;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let left = x;
        let top = y;

        // Prevent overflow right
        if (x + menuWidth > windowWidth) {
            left = windowWidth - menuWidth - 8;
        }
        // Prevent overflow bottom
        if (y + menuHeight > windowHeight) {
            top = windowHeight - menuHeight - 8;
        }
        // Ensure not negative
        left = Math.max(0, left);
        top = Math.max(0, top);

        this.menu.style.left = `${left}px`;
        this.menu.style.top = `${top}px`;
    }

    close() {
        this.isOpen = false;
        this.menu.style.display = 'none';
    }

    renderSubmenu() {
        if (!this.submenu) return;
        this.submenu.innerHTML = '';

        const currentCategoryId = this.currentCategory.id;
        const groupsToMoveTo = this.currentBookmarksList.filter(g => g.id !== currentCategoryId);

        if (groupsToMoveTo.length === 0) {
            const item = document.createElement('div');
            item.className = 'submenu-item disabled';
            item.textContent = 'Sem outros grupos';
            this.submenu.appendChild(item);
        } else {
            groupsToMoveTo.forEach(g => {
                const item = document.createElement('button');
                item.className = 'submenu-item';
                item.textContent = g.name;
                item.title = `Mover para o grupo ${g.name}`;
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.moveBookmarkToGroup(g);
                });
                this.submenu.appendChild(item);
            });
        }
    }

    moveBookmarkToGroup(targetCategory) {
        if (!this.currentLink || !this.currentCategory || !targetCategory) return;

        const bookmarkId = this.currentLink.id;
        const targetCategoryId = targetCategory.id;

        if (bookmarkId && targetCategoryId) {
            chrome.bookmarks.move(bookmarkId, { parentId: targetCategoryId }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error moving bookmark via API:", chrome.runtime.lastError.message);
                    return;
                }

                // 1. Remove link from source category links list
                const sourceIndex = this.currentCategory.links.findIndex(l => l.id === bookmarkId);
                if (sourceIndex > -1) {
                    this.currentCategory.links.splice(sourceIndex, 1);
                }

                // 2. Add link to target category links list
                targetCategory.links.push(this.currentLink);

                // 3. Update state
                if (this.currentStateHelpers && this.currentStateHelpers.setBookmarks) {
                    this.currentStateHelpers.setBookmarks(this.currentBookmarksList);
                }

                // 4. Re-render bookmarks
                renderBookmarks(
                    this.currentBookmarksList,
                    this.currentContentArea,
                    this.currentIconSize,
                    this.currentStateHelpers
                );

                this.close();
            });
        }
    }

    executeAction(action) {
        if (!this.currentLink) return;

        switch (action) {
            case 'open-tab':
                chrome.tabs.create({ url: this.currentLink.url });
                break;
            case 'open-incognito':
                chrome.windows.create({ url: this.currentLink.url, incognito: true }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("Could not open incognito window:", chrome.runtime.lastError.message);
                        alert("Não foi possível abrir em modo anônimo. Certifique-se de que a opção 'Permitir em modo anônimo' está ativa nas configurações desta extensão (chrome://extensions).");
                    }
                });
                break;
            case 'copy':
                navigator.clipboard.writeText(this.currentLink.url)
                    .then(() => {
                        console.log("URL copied to clipboard");
                    })
                    .catch(err => {
                        console.error("Failed to copy URL:", err);
                    });
                break;
            case 'edit': {
                // Dispatch event to open edit modal
                const editEvent = new CustomEvent('openEditModal', {
                    detail: {
                        link: this.currentLink,
                        category: this.currentCategory,
                        bookmarks: this.currentBookmarksList,
                        contentArea: this.currentContentArea,
                        iconSize: this.currentIconSize,
                        stateHelpers: this.currentStateHelpers
                    }
                });
                window.dispatchEvent(editEvent);
                break;
            }
            case 'delete':
                handleDeleteBookmark(
                    this.currentLink.url,
                    this.currentCategory.name,
                    this.currentBookmarksList,
                    (updated) => renderBookmarks(updated, this.currentContentArea, this.currentIconSize, this.currentStateHelpers),
                    this.currentStateHelpers ? this.currentStateHelpers.spaceId : null
                );
                break;
            default:
                console.warn("Unknown context menu action:", action);
        }
    }
}
