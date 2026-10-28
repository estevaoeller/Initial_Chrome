import {
  loadSpacesFromChrome,
  createSpace,
  deleteSpace,
  renameSpace,
  moveSpace,
  loadSortable,
} from '../modules.js';

export class SidebarManager {
  constructor(settingsState, onSpaceSelected) {
    this.settingsState = settingsState;
    this.onSpaceSelected = onSpaceSelected;

    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.spacesList = document.getElementById('spaces-list');
    this.addSpaceBtn = document.getElementById('add-space-btn');

    // Space Modal Elements
    this.spaceModal = document.getElementById('space-modal');
    this.spaceModalTitle = document.getElementById('space-modal-title');
    this.spaceNameInput = document.getElementById('space-name-input');
    this.spaceIconInput = document.getElementById('space-icon-input');
    this.closeSpaceModalBtn = document.getElementById('close-space-modal-btn');
    this.cancelSpaceBtn = document.getElementById('cancel-space-btn');
    this.saveSpaceBtn = document.getElementById('save-space-btn');
    this.deleteSpaceBtn = document.getElementById('delete-space-btn');
    this.quickEmojiBtns = document.querySelectorAll('.quick-emoji-btn');

    // Space Context Menu Elements
    this.spaceContextMenu = document.getElementById('space-context-menu');
    this.spaceMenuEdit = document.getElementById('space-menu-edit');
    this.spaceMenuDelete = document.getElementById('space-menu-delete');

    this.currentSpaces = [];
    this.activeSpaceId = null;
    this.editingSpaceId = null;
    this.contextMenuSpaceId = null;
  }

  init() {
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }

    if (this.addSpaceBtn) {
      this.addSpaceBtn.addEventListener('click', () => this.openModal());
    }

    // Modal Events
    if (this.closeSpaceModalBtn) {
      this.closeSpaceModalBtn.addEventListener('click', () =>
        this.closeModal(),
      );
    }
    if (this.cancelSpaceBtn) {
      this.cancelSpaceBtn.addEventListener('click', () => this.closeModal());
    }
    if (this.saveSpaceBtn) {
      this.saveSpaceBtn.addEventListener('click', () => this.handleSaveSpace());
    }
    if (this.deleteSpaceBtn) {
      this.deleteSpaceBtn.addEventListener('click', () =>
        this.handleDeleteSpace(),
      );
    }

    // Select quick emoji helper
    this.quickEmojiBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.spaceIconInput) {
          this.spaceIconInput.value = btn.textContent;
        }
      });
    });

    // Context Menu Events
    if (this.spaceMenuEdit) {
      this.spaceMenuEdit.addEventListener('click', () => {
        if (this.contextMenuSpaceId) {
          this.openModal(this.contextMenuSpaceId);
          this.hideSpaceContextMenu();
        }
      });
    }
    if (this.spaceMenuDelete) {
      this.spaceMenuDelete.addEventListener('click', () => {
        if (this.contextMenuSpaceId) {
          this.handleDeleteSpace(this.contextMenuSpaceId);
          this.hideSpaceContextMenu();
        }
      });
    }

    // Close space context menu on left click anywhere
    window.addEventListener('click', () => {
      this.hideSpaceContextMenu();
    });

    // Focus trap for space modal
    if (this.spaceModal) {
      this.spaceModal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && this.spaceModal.classList.contains('show')) {
          const focusables = Array.from(
            this.spaceModal.querySelectorAll(
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

    if (this.settingsState.sidebarCollapsed && this.sidebar) {
      this.sidebar.classList.add('collapsed');
      if (this.sidebarToggle) {
        this.sidebarToggle.classList.add('collapsed');
        this.sidebarToggle.setAttribute('aria-expanded', 'false');
      }
    }

    // Initialize Sortable for Space list
    if (this.spacesList) {
      loadSortable((Sortable) => {
        Sortable.create(this.spacesList, {
          animation: 150,
          draggable: '.space-item',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          onEnd: (evt) => {
            if (evt.oldIndex === evt.newIndex) return;
            const spaceId = evt.item.dataset.spaceId;
            this.handleMoveSpace(spaceId, evt.newIndex);
          },
        });
      });
    }
  }

  openModal(spaceId = null) {
    this.previouslyFocusedElement = document.activeElement;
    if (spaceId) {
      // Edit Mode
      this.editingSpaceId = spaceId;
      const space = this.currentSpaces.find((s) => s.id === spaceId);
      if (space) {
        if (this.spaceModalTitle)
          this.spaceModalTitle.textContent = 'Editar Espaço';
        if (this.spaceNameInput) this.spaceNameInput.value = space.name;
        if (this.spaceIconInput) this.spaceIconInput.value = space.icon;
        if (this.deleteSpaceBtn) this.deleteSpaceBtn.style.display = 'block';
      }
    } else {
      // Create Mode
      this.editingSpaceId = null;
      if (this.spaceModalTitle)
        this.spaceModalTitle.textContent = 'Novo Espaço';
      if (this.spaceNameInput) this.spaceNameInput.value = '';
      if (this.spaceIconInput) this.spaceIconInput.value = '';
      if (this.deleteSpaceBtn) this.deleteSpaceBtn.style.display = 'none';
    }

    if (this.spaceModal) {
      this.spaceModal.classList.add('show');
      this.spaceModal.style.display = 'flex';
    }
    if (this.spaceNameInput) {
      this.spaceNameInput.focus();
    }
  }

  closeModal() {
    if (this.spaceModal) {
      this.spaceModal.classList.remove('show');
      setTimeout(() => {
        this.spaceModal.style.display = 'none';
      }, 300);
    }
    this.editingSpaceId = null;
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  handleSaveSpace() {
    if (!this.spaceNameInput) return;
    const name = this.spaceNameInput.value.trim();
    if (!name) return;

    const icon =
      (this.spaceIconInput && this.spaceIconInput.value.trim()) || '📁';

    if (this.editingSpaceId) {
      // Edit
      renameSpace(this.editingSpaceId, name, icon, () => {
        const space = this.currentSpaces.find(
          (s) => s.id === this.editingSpaceId,
        );
        if (space) {
          space.name = name;
          space.icon = icon;
        }
        this.renderSpacesList(this.currentSpaces);
        if (this.activeSpaceId === this.editingSpaceId) {
          this.selectSpace(this.editingSpaceId);
        }
        this.closeModal();
      });
    } else {
      // Create
      createSpace(name, icon, (newSpace) => {
        if (newSpace) {
          this.currentSpaces.push(newSpace);
          this.renderSpacesList(this.currentSpaces);
          this.selectSpace(newSpace.id);
        }
        this.closeModal();
      });
    }
  }

  handleDeleteSpace(spaceId = null) {
    const idToDelete = spaceId || this.editingSpaceId;
    if (!idToDelete) return;

    if (
      !confirm(
        'Deseja realmente excluir este espaço e TODOS os seus marcadores? Esta ação não pode ser desfeita.',
      )
    )
      return;

    deleteSpace(idToDelete, () => {
      this.currentSpaces = this.currentSpaces.filter(
        (s) => s.id !== idToDelete,
      );
      this.renderSpacesList(this.currentSpaces);

      if (this.activeSpaceId === idToDelete) {
        if (this.currentSpaces.length > 0) {
          this.selectSpace(this.currentSpaces[0].id);
        } else {
          createSpace('Home', '🏠', (newSpace) => {
            if (newSpace) {
              this.currentSpaces = [newSpace];
              this.renderSpacesList(this.currentSpaces);
              this.selectSpace(newSpace.id);
            }
          });
        }
      }
      this.closeModal();
    });
  }

  handleMoveSpace(spaceId, newIndex) {
    moveSpace(spaceId, newIndex, () => {
      loadSpacesFromChrome((spaces) => {
        this.currentSpaces = spaces;
      });
    });
  }

  showSpaceContextMenu(x, y, spaceId) {
    this.contextMenuSpaceId = spaceId;
    if (!this.spaceContextMenu) return;

    this.spaceContextMenu.style.display = 'flex';
    this.spaceContextMenu.style.left = `${x}px`;
    this.spaceContextMenu.style.top = `${y}px`;
  }

  hideSpaceContextMenu() {
    if (this.spaceContextMenu) {
      this.spaceContextMenu.style.display = 'none';
    }
    this.contextMenuSpaceId = null;
  }

  renderSpacesList(spaces) {
    if (!this.spacesList) return;
    this.spacesList.innerHTML = '';
    spaces.forEach((space) => {
      const spaceItem = document.createElement('button');
      spaceItem.className = 'space-item';
      if (space.id === this.activeSpaceId) {
        spaceItem.classList.add('active');
      }
      spaceItem.dataset.spaceId = space.id;

      // Tooltip com o nome (útil no modo mini-rail, onde só o ícone aparece)
      spaceItem.title = space.name;

      const spaceIconSpan = document.createElement('span');
      spaceIconSpan.className = 'space-icon';
      spaceIconSpan.textContent = space.icon;

      const spaceNameSpan = document.createElement('span');
      spaceNameSpan.className = 'space-name';
      spaceNameSpan.textContent = space.name;

      spaceItem.appendChild(spaceIconSpan);
      spaceItem.appendChild(spaceNameSpan);

      // Left click to select
      spaceItem.addEventListener('click', () => this.selectSpace(space.id));

      // Right click context menu
      spaceItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showSpaceContextMenu(e.clientX, e.clientY, space.id);
      });

      // Double click edit modal
      spaceItem.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal(space.id);
      });

      this.spacesList.appendChild(spaceItem);
    });
  }

  selectSpace(spaceId) {
    this.activeSpaceId = spaceId;

    // Update active class
    document.querySelectorAll('.space-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.spaceId === spaceId);
    });

    // Call parent selection handler
    if (this.onSpaceSelected) {
      this.onSpaceSelected(spaceId);
    }

    // Save to settings
    chrome.storage.sync.get(['extensionSettings'], (result) => {
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
      this.sidebarToggle.classList.toggle('collapsed', isCollapsed);
      this.sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    }
    // Save state
    chrome.storage.sync.get(['extensionSettings'], (result) => {
      const settings = result.extensionSettings || {};
      settings.sidebarCollapsed = isCollapsed;
      chrome.storage.sync.set({ extensionSettings: settings });
    });
  }

  loadSpaces(targetSpaceId) {
    loadSpacesFromChrome((spaces) => {
      this.currentSpaces = spaces;
      this.renderSpacesList(spaces);

      if (spaces.length > 0) {
        const spaceExists = spaces.find((s) => s.id === targetSpaceId);
        const actualTarget =
          targetSpaceId && spaceExists ? targetSpaceId : spaces[0].id;
        this.selectSpace(actualTarget);
      } else {
        // No spaces exist yet - create default "Home" space
        createSpace('Home', '🏠', (newSpace) => {
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
