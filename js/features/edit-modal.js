import {
  saveCustomIconProps,
  removeCustomIconProps,
  updateBookmarkFull,
} from '../modules.js';
import { renderBookmarks } from '../bookmark-renderer.js';
import {
  inferIconSlugs,
  resolveIconUrls,
  attachIconCascade,
  searchIconCatalog,
  buildPreviewUrlForSource,
  clearLockedIconUrl,
} from '../icon-resolver.js';

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
    this.autoDetectedBadge = document.getElementById('auto-detected-badge');

    this.gallerySource = document.getElementById('gallery-source');
    this.gallerySearch = document.getElementById('gallery-search');
    this.suggestionsGrid = document.getElementById('icon-suggestions-grid');

    this.gallerySimpleiconsSettings = document.getElementById(
      'gallery-simpleicons-settings',
    );
    this.simpleColor = document.getElementById('edit-icon-color');
    this.simpleColorHex = document.getElementById('edit-icon-color-hex');

    this.galleryTechiconsSettings = document.getElementById(
      'gallery-techicons-settings',
    );
    this.techColored = document.getElementById('techicon-colored');

    this.galleryDashboardiconsSettings = document.getElementById(
      'gallery-dashboardicons-settings',
    );

    this.customUrl = document.getElementById('custom-icon-url');

    this.currentActiveTab = 'auto'; // auto, gallery, custom
    this.currentEditingLink = null;
    this.currentStateHelpers = null;
  }

  init() {
    if (!this.modal) return;

    // --- Tab Switching ---
    this.tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.tabBtns.forEach((b) => b.classList.remove('active'));
        this.tabContents.forEach((c) => (c.style.display = 'none'));
        btn.classList.add('active');
        this.currentActiveTab = btn.dataset.tab;
        document.getElementById(`tab-${this.currentActiveTab}`).style.display =
          'block';
        if (this.currentActiveTab === 'gallery') {
          this.renderSuggestions();
        }
        this.updatePreview();
      });
    });

    this.gallerySource.addEventListener('change', () => {
      this.updateGallerySettingsVisibility();
      this.renderSuggestions();
    });

    this.inputName.addEventListener('input', () => {
      this.updatePreview();
      if (this.currentActiveTab === 'gallery' && !this.gallerySearch.value) {
        this.renderSuggestions();
      }
    });
    this.inputUrl.addEventListener('input', () => {
      this.updatePreview();
      if (this.currentActiveTab === 'gallery' && !this.gallerySearch.value) {
        this.renderSuggestions();
      }
    });
    this.gallerySearch.addEventListener('input', () => {
      this.updatePreview();
      this.renderSuggestions();
    });
    this.customUrl.addEventListener('input', () => this.updatePreview());
    this.techColored.addEventListener('change', () => {
      this.updatePreview();
      this.renderSuggestions();
    });

    if (this.simpleColor) {
      this.simpleColor.addEventListener('input', (e) => {
        if (this.simpleColorHex)
          this.simpleColorHex.textContent = e.target.value;
        this.updatePreview();
        this.renderSuggestions();
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
      const iconData = customIcons[link.url] || customIcons[link.id];

      if (iconData) {
        if (
          iconData.type === 'simpleicons' ||
          iconData.type === 'techicons' ||
          iconData.type === 'dashboardicons'
        ) {
          this.currentActiveTab = 'gallery';
          this.gallerySource.value = iconData.type;
          this.gallerySearch.value = iconData.value;
          if (iconData.type === 'simpleicons') {
            this.simpleColor.value = iconData.color || '#ffffff';
            if (this.simpleColorHex)
              this.simpleColorHex.textContent = this.simpleColor.value;
          } else if (iconData.type === 'techicons') {
            this.techColored.checked = iconData.color !== 'plain';
          }
        } else if (iconData.type === 'custom') {
          this.currentActiveTab = 'custom';
          this.customUrl.value = iconData.value;
        }
      } else {
        this.currentActiveTab = 'auto';
        this.gallerySource.value = 'dashboardicons';
        const inferred = inferIconSlugs(link.url, link.name);
        this.gallerySearch.value = inferred[0] || '';
        this.simpleColor.value = '#ffffff';
        if (this.simpleColorHex) this.simpleColorHex.textContent = '#ffffff';
        this.techColored.checked = true;
        this.customUrl.value = '';
      }

      this.updateGallerySettingsVisibility();
      this.renderSuggestions();

      // Sync Tabs UI
      this.tabBtns.forEach((b) => {
        b.classList.toggle('active', b.dataset.tab === this.currentActiveTab);
      });
      this.tabContents.forEach((c) => {
        c.style.display =
          c.id === `tab-${this.currentActiveTab}` ? 'block' : 'none';
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
        const focusables = Array.from(
          this.modal.querySelectorAll(
            'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => {
          return (
            el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el.getClientRects().length > 0
          );
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

  async renderSuggestions() {
    if (!this.suggestionsGrid || !this.currentEditingLink) return;

    const source = this.gallerySource ? this.gallerySource.value : 'dashboardicons';
    const query = this.gallerySearch ? this.gallerySearch.value.trim() : '';
    const linkContext = {
      name: this.inputName.value || this.currentEditingLink.name,
      url: this.inputUrl.value || this.currentEditingLink.url,
    };

    const items = await searchIconCatalog(source, query, linkContext, 20);
    this.suggestionsGrid.innerHTML = '';

    const currentSlug = query.toLowerCase().replace(/\s+/g, '');

    items.forEach(({ slug }) => {
      const url = buildPreviewUrlForSource(source, slug, {
        simpleColor: this.simpleColor ? this.simpleColor.value : '#ffffff',
        techColored: this.techColored ? this.techColored.checked : true,
      });

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `icon-suggestion-card ${slug === currentSlug ? 'selected' : ''}`;
      btn.title = `Selecionar ícone "${slug}"`;

      const img = document.createElement('img');
      img.src = url;
      img.alt = slug;
      img.loading = 'lazy';
      img.onerror = () => {
        btn.style.display = 'none';
      };

      const label = document.createElement('span');
      label.textContent = slug;

      btn.appendChild(img);
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        this.gallerySearch.value = slug;
        this.suggestionsGrid
          .querySelectorAll('.icon-suggestion-card')
          .forEach((c) => c.classList.remove('selected'));
        btn.classList.add('selected');
        this.updatePreview();
      });

      this.suggestionsGrid.appendChild(btn);
    });
  }

  updatePreview() {
    if (!this.currentEditingLink) return;
    const size = this.currentStateHelpers
      ? this.currentStateHelpers.iconSize || this.settingsState.iconSize
      : 32;
    const nameVal = this.inputName.value || 'Nome do Link';
    const urlVal = this.inputUrl.value || this.currentEditingLink.url;
    this.previewName.textContent = nameVal;

    if (this.currentActiveTab === 'auto') {
      const defaultSource =
        this.settingsState.defaultIconSource || 'dashboardicons';
      const inferred = inferIconSlugs(urlVal, nameVal);
      if (this.autoDetectedBadge) {
        if (defaultSource !== 'favicon' && inferred.length > 0) {
          this.autoDetectedBadge.style.display = 'flex';
          this.autoDetectedBadge.innerHTML = `✨ Detectado automaticamente: <code>${inferred[0]}</code>`;
        } else {
          this.autoDetectedBadge.style.display = 'none';
        }
      }

      const candidateUrls = resolveIconUrls(
        { name: nameVal, url: urlVal },
        null,
        defaultSource,
        size,
        true, // ignoreLock no preview para permitir re-detecção ao editar nome/URL
      );
      attachIconCascade(this.previewFavicon, candidateUrls);
    } else if (this.currentActiveTab === 'gallery') {
      const val = this.gallerySearch.value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
      const source = this.gallerySource.value;
      if (val) {
        this.previewFavicon.onerror = null;
        this.previewFavicon.src = buildPreviewUrlForSource(source, val, {
          simpleColor: this.simpleColor ? this.simpleColor.value : '#ffffff',
          techColored: this.techColored ? this.techColored.checked : true,
        });
      } else {
        this.previewFavicon.src = '';
      }
    } else if (this.currentActiveTab === 'custom') {
      this.previewFavicon.onerror = null;
      this.previewFavicon.src = this.customUrl.value || '';
    }
  }

  updateGallerySettingsVisibility() {
    const source = this.gallerySource.value;
    this.gallerySimpleiconsSettings.style.display =
      source === 'simpleicons' ? 'block' : 'none';
    this.galleryTechiconsSettings.style.display =
      source === 'techicons' ? 'flex' : 'none';
    this.galleryDashboardiconsSettings.style.display =
      source === 'dashboardicons' ? 'block' : 'none';
    this.updatePreview();
  }

  closeModal() {
    this.modal.classList.remove('show');
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
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
    if (
      this.currentActiveTab === 'gallery' &&
      this.gallerySearch.value.trim()
    ) {
      const source = this.gallerySource.value;
      if (source === 'simpleicons') {
        iconData = {
          type: 'simpleicons',
          value: this.gallerySearch.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ''),
          color: this.simpleColor.value,
        };
      } else if (source === 'techicons') {
        iconData = {
          type: 'techicons',
          value: this.gallerySearch.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ''),
          color: this.techColored.checked ? 'original' : 'plain',
        };
      } else if (source === 'dashboardicons') {
        iconData = {
          type: 'dashboardicons',
          value: this.gallerySearch.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ''),
        };
      }
    } else if (
      this.currentActiveTab === 'custom' &&
      this.customUrl.value.trim()
    ) {
      iconData = {
        type: 'custom',
        value: this.customUrl.value.trim(),
      };
    }

    const oldUrlKey = this.currentEditingLink.url;
    const idKey = newUrl;

    const finishSave = () => {
      // Limpa o travamento de ícone deste link para que seu novo ajuste/re-detecção valha imediatamente
      clearLockedIconUrl(oldUrlKey);
      clearLockedIconUrl(idKey);

      this.currentEditingLink.name = newName;
      this.currentEditingLink.url = newUrl;

      if (this.currentStateHelpers) {
        if (oldUrlKey !== idKey) {
          delete this.currentStateHelpers.customIcons[oldUrlKey];
        }
        if (iconData) {
          this.currentStateHelpers.customIcons[idKey] = iconData;
        } else {
          delete this.currentStateHelpers.customIcons[idKey];
        }
        if (this.currentStateHelpers.setBookmarks) {
          this.currentStateHelpers.setBookmarks(
            this.currentStateHelpers.getBookmarks(),
          );
        }

        // Force update of the bookmark card DOM so the new icon renders immediately
        const existingCard = document.querySelector(
          `.bookmark-item[data-id="${this.currentEditingLink.id}"]`,
        );
        if (existingCard) {
          existingCard.remove();
        }

        renderBookmarks(
          this.currentStateHelpers.getBookmarks(),
          document.getElementById('content-area'),
          this.settingsState.iconSize,
          this.currentStateHelpers,
        );
      }
      this.closeModal();
    };

    if (iconData) {
      saveCustomIconProps(idKey, iconData, () => {
        if (this.currentEditingLink.id) {
          updateBookmarkFull(
            this.currentEditingLink.id,
            newName,
            newUrl,
            finishSave,
          );
        } else {
          finishSave();
        }
      });
    } else {
      removeCustomIconProps(oldUrlKey, () => {
        const proceed = () => {
          if (this.currentEditingLink.id) {
            updateBookmarkFull(
              this.currentEditingLink.id,
              newName,
              newUrl,
              finishSave,
            );
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
