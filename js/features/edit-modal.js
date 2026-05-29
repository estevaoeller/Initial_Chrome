import {
    saveCustomIconProps,
    removeCustomIconProps,
    updateBookmarkFull
} from '../modules.js';
import { renderBookmarks } from '../bookmark-renderer.js';

export class EditModalManager {
    constructor(settingsState) {
        this.settingsState = settingsState;
        
        this.modal = document.getElementById('edit-link-modal');
        this.closeBtn = document.getElementById('close-modal-btn');
        this.cancelBtn = document.getElementById('cancel-link-btn');
        this.saveBtn = document.getElementById('save-link-btn');

        this.inputName = document.getElementById('edit-link-name');
        this.inputUrl = document.getElementById('edit-link-url');
        this.tabBtns = document.querySelectorAll('.icon-tab-btn');
        this.tabContents = document.querySelectorAll('.icon-tab-content');

        this.previewFavicon = document.getElementById('preview-favicon');
        this.previewName = document.getElementById('preview-name');

        this.gallerySource = document.getElementById('gallery-source');
        this.gallerySearch = document.getElementById('gallery-search');

        this.gallerySimpleiconsSettings = document.getElementById('gallery-simpleicons-settings');
        this.simpleColor = document.getElementById('edit-icon-color');
        this.simpleColorHex = document.getElementById('edit-icon-color-hex');

        this.galleryTechiconsSettings = document.getElementById('gallery-techicons-settings');
        this.techColored = document.getElementById('techicon-colored');

        this.galleryDashboardiconsSettings = document.getElementById('gallery-dashboardicons-settings');

        this.customUrl = document.getElementById('custom-icon-url');

        this.currentActiveTab = 'auto'; // auto, gallery, custom
        this.currentEditingLink = null;
        this.currentStateHelpers = null;
    }

    init() {
        if (!this.modal) return;

        // --- Tab Switching ---
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.tabBtns.forEach(b => b.classList.remove('active'));
                this.tabContents.forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                this.currentActiveTab = btn.dataset.tab;
                document.getElementById(`tab-${this.currentActiveTab}`).style.display = 'block';
                this.updatePreview();
            });
        });

        this.gallerySource.addEventListener('change', () => this.updateGallerySettingsVisibility());

        this.inputName.addEventListener('input', () => this.updatePreview());
        this.inputUrl.addEventListener('input', () => this.updatePreview());
        this.gallerySearch.addEventListener('input', () => this.updatePreview());
        this.customUrl.addEventListener('input', () => this.updatePreview());
        this.techColored.addEventListener('change', () => this.updatePreview());

        if (this.simpleColor) {
            this.simpleColor.addEventListener('input', (e) => {
                if (this.simpleColorHex) this.simpleColorHex.textContent = e.target.value;
                this.updatePreview();
            });
        }

        // --- Listen to global event ---
        window.addEventListener('openEditModal', (e) => {
            this.previouslyFocusedElement = document.activeElement;
            const { link, stateHelpers } = e.detail;
            this.currentEditingLink = link;
            this.currentStateHelpers = stateHelpers;

            // Load values
            this.inputName.value = link.name;
            this.inputUrl.value = link.url;

            // Load custom icon if exists
            const customIcons = stateHelpers.customIcons || {};
            const iconData = customIcons[link.url];

            if (iconData) {
                if (iconData.type === 'simpleicons' || iconData.type === 'techicons' || iconData.type === 'dashboardicons') {
                    this.currentActiveTab = 'gallery';
                    this.gallerySource.value = iconData.type;
                    this.gallerySearch.value = iconData.value;
                    if (iconData.type === 'simpleicons') {
                        this.simpleColor.value = iconData.color || '#ffffff';
                        if (this.simpleColorHex) this.simpleColorHex.textContent = this.simpleColor.value;
                    } else if (iconData.type === 'techicons') {
                        this.techColored.checked = iconData.color !== 'plain';
                    }
                } else if (iconData.type === 'custom') {
                    this.currentActiveTab = 'custom';
                    this.customUrl.value = iconData.value;
                }
            } else {
                this.currentActiveTab = 'auto';
                this.gallerySource.value = 'simpleicons';
                this.gallerySearch.value = link.name ? link.name.toLowerCase().replace(/\s+/g, '') : '';
                this.simpleColor.value = '#ffffff';
                if (this.simpleColorHex) this.simpleColorHex.textContent = '#ffffff';
                this.techColored.checked = true;
                this.customUrl.value = '';
            }

            this.updateGallerySettingsVisibility();

            // Sync Tabs UI
            this.tabBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.tab === this.currentActiveTab);
            });
            this.tabContents.forEach(c => {
                c.style.display = c.id === `tab-${this.currentActiveTab}` ? 'block' : 'none';
            });

            this.updatePreview();

            // Show modal
            this.modal.style.display = 'flex';
            setTimeout(() => {
                this.modal.classList.add('show');
                if (this.inputName) {
                    this.inputName.focus();
                    this.inputName.select();
                }
            }, 10);
        });

        // --- Close Logic ---
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // --- Save Logic ---
        this.saveBtn.addEventListener('click', () => this.handleSave());

        // Focus trap
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.modal.classList.contains('show')) {
                const focusables = Array.from(this.modal.querySelectorAll('button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => {
                    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
                });
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    updatePreview() {
        if (!this.currentEditingLink) return;
        const size = this.currentStateHelpers ? this.currentStateHelpers.iconSize || this.settingsState.iconSize : 32;
        this.previewName.textContent = this.inputName.value || 'Nome do Link';

        if (this.currentActiveTab === 'auto') {
            const url = this.inputUrl.value || this.currentEditingLink.url;
            try {
                const parsed = new URL(url);
                this.previewFavicon.src = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=${size}`;
            } catch (e) {
                this.previewFavicon.src = '';
            }
        } else if (this.currentActiveTab === 'gallery') {
            const val = this.gallerySearch.value.trim().toLowerCase().replace(/\s+/g, '');
            const source = this.gallerySource.value;
            if (val) {
                if (source === 'simpleicons') {
                    const color = this.simpleColor.value.replace('#', '');
                    this.previewFavicon.src = `https://cdn.simpleicons.org/${val}/${color}`;
                } else if (source === 'techicons') {
                    const suffix = this.techColored.checked ? 'original' : 'plain';
                    this.previewFavicon.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${val}/${val}-${suffix}.svg`;
                } else if (source === 'dashboardicons') {
                    this.previewFavicon.src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${val}.svg`;
                }
            } else {
                this.previewFavicon.src = '';
            }
        } else if (this.currentActiveTab === 'custom') {
            this.previewFavicon.src = this.customUrl.value || '';
        }
    }

    updateGallerySettingsVisibility() {
        const source = this.gallerySource.value;
        this.gallerySimpleiconsSettings.style.display = source === 'simpleicons' ? 'block' : 'none';
        this.galleryTechiconsSettings.style.display = source === 'techicons' ? 'flex' : 'none';
        this.galleryDashboardiconsSettings.style.display = source === 'dashboardicons' ? 'block' : 'none';
        this.updatePreview();
    }

    closeModal() {
        this.modal.classList.remove('show');
        setTimeout(() => { this.modal.style.display = 'none'; }, 300);
        this.currentEditingLink = null;
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
        }
    }

    handleSave() {
        if (!this.currentEditingLink) return;

        const newName = this.inputName.value.trim() || this.currentEditingLink.name;
        const newUrl = this.inputUrl.value.trim() || this.currentEditingLink.url;

        // Prepare Icon Data
        let iconData = null;
        if (this.currentActiveTab === 'gallery' && this.gallerySearch.value.trim()) {
            const source = this.gallerySource.value;
            if (source === 'simpleicons') {
                iconData = {
                    type: 'simpleicons',
                    value: this.gallerySearch.value.trim().toLowerCase().replace(/\s+/g, ''),
                    color: this.simpleColor.value
                };
            } else if (source === 'techicons') {
                iconData = {
                    type: 'techicons',
                    value: this.gallerySearch.value.trim().toLowerCase().replace(/\s+/g, ''),
                    color: this.techColored.checked ? 'original' : 'plain'
                };
            } else if (source === 'dashboardicons') {
                iconData = {
                    type: 'dashboardicons',
                    value: this.gallerySearch.value.trim().toLowerCase().replace(/\s+/g, '')
                };
            }
        } else if (this.currentActiveTab === 'custom' && this.customUrl.value.trim()) {
            iconData = {
                type: 'custom',
                value: this.customUrl.value.trim()
            };
        }

        const idKey = this.currentEditingLink.url;

        const finishSave = () => {
            this.currentEditingLink.name = newName;
            this.currentEditingLink.url = newUrl;

            if (this.currentStateHelpers) {
                if (iconData) {
                    this.currentStateHelpers.customIcons[idKey] = iconData;
                } else {
                    delete this.currentStateHelpers.customIcons[idKey];
                }
                if (this.currentStateHelpers.setBookmarks) {
                    this.currentStateHelpers.setBookmarks(this.currentStateHelpers.getBookmarks());
                }

                renderBookmarks(
                    this.currentStateHelpers.getBookmarks(),
                    document.getElementById('content-area'),
                    this.settingsState.iconSize,
                    this.currentStateHelpers
                );
            }
            this.closeModal();
        };

        if (iconData) {
            saveCustomIconProps(idKey, iconData, () => {
                if (this.currentEditingLink.id) {
                    updateBookmarkFull(this.currentEditingLink.id, newName, newUrl, finishSave);
                } else {
                    finishSave();
                }
            });
        } else {
            removeCustomIconProps(idKey, () => {
                const proceed = () => {
                    if (this.currentEditingLink.id) {
                        updateBookmarkFull(this.currentEditingLink.id, newName, newUrl, finishSave);
                    } else {
                        finishSave();
                    }
                };
                if (this.currentEditingLink.id) {
                    removeCustomIconProps(this.currentEditingLink.id, proceed);
                } else {
                    proceed();
                }
            });
        }
    }
}
